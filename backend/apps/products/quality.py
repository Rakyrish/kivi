"""
Content quality validator for AI-generated product pages.

Runs after bulk/single regeneration (or on demand from the admin SEO tab) to
catch the failure modes generic LLM content tends to produce: sections that
are too thin to be useful, missing sections, generic AI-sounding phrasing,
under-use of the "Kivi Chemicals" brand name, and — because many products are
generated from the same prompt — introductions/overviews that open with the
same sentence across different products.

This does not call OpenAI. It is a fast, deterministic pass so it can run
across the whole catalogue (400+ products) on every SEO tab load.
"""
import re
from collections import defaultdict
from .models import Product

# Section -> (soft_minimum, target_minimum, target_maximum) in words.
# Below soft_minimum is flagged high severity ("thin"); between soft_minimum
# and target_minimum is medium severity (below target but not unusable).
SECTION_TARGETS = {
    'introduction': (75, 150, 300),
    'description': (150, 300, 500),
    'benefits_content': (125, 250, 450),
    'packaging_info': (40, 80, 150),
    'storage_handling': (50, 100, 200),
    'safety_info': (40, 80, 160),
}

MIN_FAQ_COUNT = 6
MIN_APPLICATIONS_DETAILED = 3
MIN_BRAND_MENTIONS = 5
BRAND_NAME = 'kivi chemicals'

# Phrases the generation prompt explicitly bans, kept as a trailing safety net
# in case the model produces them anyway.
GENERIC_PHRASES = [
    "in today's world", "in today's fast-paced", "in the ever-evolving",
    "in conclusion", "it is worth noting", "it's important to note",
    "delve into", "unlock the", "game-changer", "game changer",
    "in summary", "at the end of the day", "when it comes to",
    "plays a crucial role", "plays a vital role", "underscores the importance",
    "testament to", "landscape of",
]

_WORD_RE = re.compile(r"[a-z0-9']+")


def _word_count(text):
    return len((text or '').split())


def _normalize_opening(text, n_words=10):
    """First N words, lowercased and stripped of punctuation — a duplicate signature."""
    words = _WORD_RE.findall((text or '').lower())
    return ' '.join(words[:n_words]) if len(words) >= n_words else None


def _brand_mentions(product):
    fields = [
        product.introduction, product.description, product.benefits_content,
        product.packaging_info, product.storage_handling, product.safety_info,
    ]
    text = ' '.join(f or '' for f in fields).lower()
    count = text.count(BRAND_NAME)
    for faq in (product.ai_faq or []):
        count += str(faq.get('answer', '')).lower().count(BRAND_NAME)
    return count


def check_product(product):
    """Returns a list of issue dicts for a single product (no cross-product checks)."""
    issues = []

    for field, (soft_min, target_min, target_max) in SECTION_TARGETS.items():
        text = getattr(product, field, '') or ''
        wc = _word_count(text)
        if wc == 0:
            issues.append({
                'type': 'missing_section', 'field': field, 'severity': 'high',
                'detail': f'"{field}" is empty.',
            })
        elif wc < soft_min:
            issues.append({
                'type': 'thin_section', 'field': field, 'severity': 'high',
                'detail': f'"{field}" has only {wc} words (target {target_min}-{target_max}).',
            })
        elif wc < target_min:
            issues.append({
                'type': 'thin_section', 'field': field, 'severity': 'medium',
                'detail': f'"{field}" has {wc} words, below the {target_min}-{target_max} target.',
            })

    faq_count = len(product.ai_faq or [])
    if faq_count < MIN_FAQ_COUNT:
        issues.append({
            'type': 'missing_section', 'field': 'ai_faq', 'severity': 'medium',
            'detail': f'Only {faq_count} FAQs (target {MIN_FAQ_COUNT}-10).',
        })

    apps_count = len(product.applications_detailed or [])
    if apps_count < MIN_APPLICATIONS_DETAILED:
        issues.append({
            'type': 'thin_section', 'field': 'applications_detailed', 'severity': 'medium',
            'detail': f'Only {apps_count} applications explained individually (target 4-8).',
        })

    full_text = ' '.join(filter(None, [
        product.introduction, product.description, product.benefits_content,
        product.packaging_info, product.storage_handling,
    ])).lower()
    found_phrases = sorted({p for p in GENERIC_PHRASES if p in full_text})
    if found_phrases:
        issues.append({
            'type': 'generic_phrase', 'field': 'content', 'severity': 'medium',
            'detail': f'Generic AI phrasing found: {", ".join(found_phrases)}.',
        })

    mentions = _brand_mentions(product)
    if mentions < MIN_BRAND_MENTIONS:
        issues.append({
            'type': 'low_brand_mentions', 'field': 'content', 'severity': 'low',
            'detail': f'"Kivi Chemicals" mentioned {mentions} time(s) (target {MIN_BRAND_MENTIONS}+).',
        })

    return issues


def find_duplicate_openings(products, field='introduction', n_words=10):
    """
    Cross-product check: groups products whose `field` opens with the same
    normalized first N words. Returns {signature: [product_ids]} for groups
    with more than one product — i.e. genuine duplication, not coincidence.
    """
    groups = defaultdict(list)
    for p in products:
        sig = _normalize_opening(getattr(p, field, ''), n_words)
        if sig:
            groups[sig].append(p.id)
    return {sig: ids for sig, ids in groups.items() if len(ids) > 1}


def run_content_quality_audit(queryset=None):
    """
    Full catalogue pass. Returns:
    {
      'summary': {...counts...},
      'flagged': [{'id', 'slug', 'name', 'issues': [...]}, ...]  # sorted worst-first
    }
    """
    products = list((queryset if queryset is not None else Product.objects.filter(is_active=True)))

    per_product_issues = {}
    for product in products:
        issues = check_product(product)
        if issues:
            per_product_issues[product.id] = issues

    dup_intro = find_duplicate_openings(products, 'introduction')
    dup_desc = find_duplicate_openings(products, 'description')
    by_id = {p.id: p for p in products}

    for sig, ids in dup_intro.items():
        for pid in ids:
            per_product_issues.setdefault(pid, []).append({
                'type': 'duplicate_opening', 'field': 'introduction', 'severity': 'high',
                'detail': f'Introduction opens identically to {len(ids) - 1} other product(s).',
            })
    for sig, ids in dup_desc.items():
        for pid in ids:
            per_product_issues.setdefault(pid, []).append({
                'type': 'duplicate_opening', 'field': 'description', 'severity': 'high',
                'detail': f'Overview opens identically to {len(ids) - 1} other product(s).',
            })

    counts = defaultdict(int)
    for issues in per_product_issues.values():
        for issue in issues:
            counts[issue['type']] += 1

    total = len(products)
    flagged_count = len(per_product_issues)
    # Each product loses a couple of points per issue, floor at 0.
    total_issue_count = sum(len(v) for v in per_product_issues.values())
    quality_score = max(0, 100 - round((total_issue_count / max(total, 1)) * 25))

    flagged = [
        {
            'id': pid,
            'slug': by_id[pid].slug,
            'name': by_id[pid].name,
            'issue_count': len(issues),
            'issues': issues,
        }
        for pid, issues in per_product_issues.items()
    ]
    flagged.sort(key=lambda f: f['issue_count'], reverse=True)

    return {
        'summary': {
            'quality_score': quality_score,
            'total_products': total,
            'flagged_products': flagged_count,
            'thin_sections': counts.get('thin_section', 0),
            'missing_sections': counts.get('missing_section', 0),
            'duplicate_openings': counts.get('duplicate_opening', 0),
            'generic_phrasing': counts.get('generic_phrase', 0),
            'low_brand_mentions': counts.get('low_brand_mentions', 0),
        },
        'flagged': flagged,
    }
