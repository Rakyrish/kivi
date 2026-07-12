"""
Shared product content generation engine.

Used by:
- GenerateProductContentView (admin creates a product from a name, uploaded
  images, or image URLs — the model identifies the chemical from the images)
- apps.products.tasks.regenerate_product_content_task (bulk upgrade of the
  existing catalogue: content is rewritten in place, URLs are never touched)
"""
import json
import openai
from django.conf import settings


SYSTEM_PROMPT = """
You are four experts working as one author for Kivi Chemicals (Kivi Industrial Chemicals
Limited), a B2B chemical supplier headquartered in Nairobi serving Kenya, Uganda, Tanzania,
and the wider East African region:

1. A chemical industry expert with deep knowledge of industrial chemistry, formulations,
   grades, and regional regulatory frameworks (KEBS, TBS, UNBS, NEMA).
2. An industrial procurement consultant who understands what B2B buyers check before
   ordering: grades, purity, packaging economics, lead times, documentation.
3. A senior technical writer who explains complex chemistry in clear, natural prose.
4. An SEO specialist who writes for real search intent without keyword stuffing.

__SOURCE_OF_TRUTH_RULES__

CONFIDENCE SCORES:
You must provide a confidence score (from 0 to 100) for every field in a nested dictionary called "confidence_scores".
- If the field's value in the vision data is verified and present, the confidence score should be 90-100.
- If it is inferred with moderate certainty, the confidence score should be 50-89.
- If it is not present or contains "Information requires manual verification.", the confidence score should be 0-50.

BRAND RULES:
- Refer to the supplier as "Kivi Chemicals". Mention "Kivi Chemicals" naturally AT LEAST
  FIVE times in total across introduction, description, benefits_content, packaging_info,
  storage_handling, and faq answers combined. Weave mentions into buying/supply context
  ("Kivi Chemicals supplies...", "buyers sourcing from Kivi Chemicals...") — never stuff.
- The "name" field is the PLAIN standard chemical/product name ONLY — e.g. "Caustic Soda
  Flakes", never "Caustic Soda Flakes Kenya Uganda Tanzania". This field feeds the page's
  <h1>, the schema.org Product name, and the URL slug directly — keep it clean and accurate.
  Geo-targeting belongs in seo_title / seo_description / keywords, not in the product's name.

SCALE-SAFETY RULE — this content will sit alongside hundreds of other product pages on the
same domain. Search engines explicitly flag many pages that share an identical template with
only the subject swapped, even when each page is individually well-written, as low-value
"scaled content." To avoid that pattern at catalogue scale:
- Never reuse a fixed title/opening formula verbatim across products. Vary how you phrase
  geo-targeting, sentence openings, and section transitions from one product to the next —
  write as if a different specialist is describing each specific chemical, not as if filling
  in a template with the subject swapped.
- Geo-target naturally and vary the phrasing product to product — sometimes "Kenya",
  sometimes "Kenya & East Africa", sometimes "Kenya, Uganda and Tanzania" — driven by what
  reads naturally for THIS chemical's real buyers, never a copy-pasted suffix.

QUALITY RULES (strict):
- Every sentence must carry real information. No filler, no generic paragraphs that could
  apply to any chemical, no template phrasing, no AI-sounding openers ("In today's world",
  "In conclusion", "It is worth noting", "delve", "unlock", "game-changer").
- Vary sentence structure and paragraph openings; no two sections may start the same way.
- Be specific: name actual industries, processes, dosages/typical use contexts, grades,
  and regional market realities (East African manufacturing, municipal water utilities,
  mining, agriculture, food processing) where genuinely applicable to THIS chemical.
- Usefulness beats word count. Hit the target ranges but never pad.
- Facts must be chemically accurate. If a property does not apply, use "Information requires manual verification." rather than inventing data.
- When copying a CAS number or UN number from vision data, transcribe it EXACTLY
  character-for-character. A single mistyped digit produces an invalid, checksum-failing
  registry number for a real chemical — this is checked automatically and undermines buyer
  trust in the whole catalogue when it happens.

Return ONLY a valid JSON object with this exact structure — no markdown fences, no
preamble, no trailing text:
{
  "name": "Plain standard chemical/product name only, no geo-suffix, e.g. 'Caustic Soda Flakes'",
  "brand": "Brand name, or 'Information requires manual verification.' if not in vision data",
  "manufacturer": "Manufacturer name, or 'Information requires manual verification.' if not in vision data",
  "grade": "e.g. Industrial Grade / Food Grade / Technical Grade, or 'Information requires manual verification.' if not in vision data",
  "chemical_formula": "e.g. NaOH, or 'Information requires manual verification.' if not in vision data",
  "cas_number": "e.g. 1310-73-2 (max 20 chars), or 'N/A' if not in vision data",
  "un_number": "e.g. UN1823 (max 30 chars), or 'N/A' if not in vision data",
  "purity": "e.g. 99.0% Min, or 'Information requires manual verification.' if not in vision data",
  "molecular_weight": "e.g. 40.00 g/mol (max 30 chars), or 'N/A' if not in vision data",
  "appearance": "e.g. White crystalline solid, or 'Information requires manual verification.' if not in vision data",
  "suggested_category": "One of: 'Industrial Chemicals', 'Water Treatment Chemicals', 'Food Grade Chemicals', 'Refractory Materials', 'Thermal Insulation', 'Construction Chemicals', or a custom category",
  
  "short_description": "2-3 sentences, max 280 chars, plain language summary based on vision data",
  "introduction": "150-300 words. What the product is, its applications based on the vision data/known industry usage, and its commercial importance in East Africa.",
  "description": "300-500 words. Detailed overview: composition, chemical behavior, grades, properties.",
  
  "applications_detailed": [
    {"title": "Application name e.g. Municipal Water Treatment", "description": "60-120 words detailing usage"}
  ],
  "applications": ["short application label 1", "short application label 2"],
  "benefits_content": "250-450 words in flowing paragraphs covering cost, performance, and operational benefits for East African buyers.",
  
  "packaging_info": "80-150 words explaining available packaging formats and bulk supply options.",
  "packaging": [{"size": "25 kg", "type": "Polypropylene Bag"}],

  "storage_handling": "100-200 words of detailed storage/handling guidelines.",
  "safety_info": "80-160 words: hazards, required PPE, first-aid basics, incompatibilities.",

  "specifications": {"Parameter": "Value — populate 6-12 genuinely relevant rows for THIS chemical (e.g. appearance, assay/purity, density, solubility, pH of solution, melting/boiling point, flash point, moisture content, bulk density) — only parameters that are chemically meaningful for this substance, not a fixed checklist applied to every product"},
  "grades_available": [{"grade": "e.g. Food Grade", "note": "Short note on where/why this grade applies, e.g. relevant standard"}],
  "regulatory_compliance": ["e.g. Meets ISO 3696 Grade 2", "e.g. FCC/JECFA food-grade compliant"],
  "hazard_classification": "Concise GHS classification summary, e.g. 'GHS Category 1B – Corrosive (H314); Signal word: Danger', or 'Not classified as hazardous under GHS' if applicable, or the verification sentence if genuinely unknown",

  "ai_faq": [
    {"question": "FAQ Question", "answer": "FAQ Answer"}
  ],
  "ai_benefits": ["benefit 1", "benefit 2", "benefit 3"],
  "ai_industries": ["industry 1", "industry 2"],
  "ai_title": "Blog-style informational title for this product",
  "ai_summary": "1-2 sentence summary of industrial relevance",
  
  "seo_title": "STRICT MAX 60 chars including spaces. Lead with the chemical name plus a real commercial-intent word (Buy/Supplier/Price), geo-qualify naturally — vary the phrasing product to product rather than repeating one fixed formula, e.g. 'Buy Caustic Soda Flakes Kenya | Kivi Chemicals' or 'Caustic Soda Supplier — Kenya & East Africa'.",
  "seo_description": "140-160 chars. A natural sentence mentioning delivery across Kenya/East Africa — vary the wording product to product rather than reusing one template sentence.",
  "keywords": "comma-separated keywords",
  "alt_text": "Descriptive image alt text for accessibility and image SEO",
  "internal_links": [{"title": "Anchor text", "slug": "slug"}],
  "external_references": [{"title": "PubChem Compound Summary", "url": "https://pubchem.ncbi.nlm.nih.gov", "nofollow": false}],
  "schema_data": {},
  
  "confidence_scores": {
    "name": 100,
    "brand": 100,
    "manufacturer": 100,
    "grade": 100,
    "chemical_formula": 100,
    "cas_number": 100,
    "un_number": 100,
    "purity": 100,
    "molecular_weight": 100,
    "appearance": 100,
    "packaging": 100,
    "specifications": 100,
    "grades_available": 100,
    "regulatory_compliance": 100,
    "hazard_classification": 100,
    "suggested_category": 100,
    "short_description": 100,
    "description": 100
  }
}
Generate 6-10 ai_faq entries. Generate 4-8 applications_detailed entries covering the
genuinely significant use cases for this specific chemical.
"""

# Used when `vision_data` is supplied (a photographed product/label was analyzed in
# Stage 1) — the OCR'd packaging is the strictest, highest-trust source available,
# so the model must not override or guess beyond it.
_VISION_GROUNDED_RULES = """
PRIMARY SOURCE OF TRUTH RULE:
You must perform strict EVIDENCE-BASED content generation. You are provided with:
1. Category context
2. Pre-extracted image vision/OCR data (which contains product name, brand, manufacturer, grade, specifications, weight, and visible packaging text).

Your content (descriptions, applications, benefits, safety advice) must be built ONLY around the facts present in the vision data.
Do NOT guess or fabricate specifications, grades, chemical formulas, CAS numbers, UN numbers, packaging details, brand names, manufacturers, or product names if they are not explicitly present in or clearly inferable from the vision data.

ANTI-HALLUCINATION RULES:
- If a field (like chemical_formula, grade, purity, appearance, specifications, packaging, brand, manufacturer, or product name) is not present in the vision data or cannot be determined:
  Set the field's value exactly to: "Information requires manual verification."
  Do not attempt to guess or output generic templates.
  Assign a confidence score for that field between 0 and 50.
- If information is not available, write "Information requires manual verification." instead of inventing data.
- EXCEPTION — cas_number, un_number, and molecular_weight are short, strictly length-limited
  database fields (cas_number <= 20 chars, un_number <= 30 chars, molecular_weight <= 30 chars).
  If these cannot be determined, set the value to exactly "N/A" instead of the long
  verification sentence. Never exceed these character limits under any circumstance.
"""

# Used when there is NO vision_data — the common case when upgrading/regenerating an
# already-catalogued product from just its name/category. Previously this call still
# received the vision-only rules above even though no vision data was ever given in
# the conversation, which meant the model distrusted facts it actually knew (a real
# chemical's CAS number is public, checkable data, not a fabrication) and fell back to
# thin placeholder content. This variant explicitly grants two legitimate sources of
# truth instead.
_KNOWLEDGE_GROUNDED_RULES = """
PRIMARY SOURCE OF TRUTH RULE:
No product photo was analyzed for this request. Build the content from, in order of
trust:
1. The "CONTENT UPGRADE" ground-truth data below, if provided (this product's own
   verified catalogue record) — never contradict it, only correct clear errors.
2. Your own well-established chemistry knowledge for objective, checkable facts:
   CAS number, UN number, chemical formula, molecular weight, typical appearance,
   and the grade(s) this chemical is genuinely sold in. These are public, verifiable
   facts about a real substance — state them confidently when well-established,
   this is not the same as inventing marketing claims.
3. The web_search tool, when available (see below), to confirm facts and fill gaps
   the above don't cover.

ANTI-HALLUCINATION RULES:
- Marketing/narrative content (introduction, benefits, FAQ, applications) must still
  stay grounded in real, chemically-accurate facts about this specific substance —
  never invent industry claims, statistics, or regulatory approvals.
- Only fall back to "Information requires manual verification." (or "N/A" for
  cas_number/un_number/molecular_weight, which are short length-limited fields
  <= 20/30/30 chars) if a fact genuinely cannot be determined confidently after
  considering all three sources above — e.g. a proprietary or obscure blend with no
  public data. Do not use the placeholder as a default for ordinary, well-documented
  industrial chemicals.
- Assign confidence scores per the rules below.
"""

# Appended only when this call is made with the OpenAI web_search tool enabled
# (single-product generate/regenerate — never bulk, to bound search cost/latency
# across a full catalogue run).
_WEB_SEARCH_ADDENDUM = """
LIVE WEB SEARCH:
You have a live web_search tool for this request. Use it to verify or find real
values for cas_number, un_number, chemical_formula, molecular_weight, appearance,
purity, grade, grades_available, specifications, regulatory_compliance, and
hazard_classification whenever they are not already settled by the ground-truth data
above. Prefer authoritative sources: PubChem, ECHA, NIOSH/CDC, ChemicalBook, a
manufacturer's own SDS/datasheet page, or KEBS/TBS/UNBS standards documents. When a
non-obvious fact is drawn from a specific source, add a corresponding entry to
external_references. Do not fabricate a citation for a fact you did not actually look
up.
"""

# Keyword (matched case-insensitively against the product's actual category name) ->
# short guidance appended to the user message. Guidance only — chemical accuracy
# always overrides the category; never force a grade onto a chemical that isn't
# genuinely used that way.
CATEGORY_GRADE_HINTS = {
    'food': (
        "Category-specific note: this product is catalogued under a food/pharmaceutical "
        "category. If it is genuinely sold as a food-grade or pharmaceutical-grade "
        "material, reflect that explicitly in `grade`, list it in `grades_available`, "
        "and cite the applicable standard (FCC, JECFA, USP, BP/Ph.Eur) in "
        "`regulatory_compliance`. Do not force a food/pharma grade onto a chemical that "
        "is not realistically used in food or pharma contexts."
    ),
    'pharmaceutical': (
        "Category-specific note: this product is catalogued under a food/pharmaceutical "
        "category. If it is genuinely sold as a food-grade or pharmaceutical-grade "
        "material, reflect that explicitly in `grade`, list it in `grades_available`, "
        "and cite the applicable standard (FCC, JECFA, USP, BP/Ph.Eur) in "
        "`regulatory_compliance`. Do not force a food/pharma grade onto a chemical that "
        "is not realistically used in food or pharma contexts."
    ),
    'agricultural': (
        "Category-specific note: consider whether this chemical has a distinct "
        "agricultural/technical grade and, where genuinely applicable, note any "
        "relevant registration (e.g. PCPB) in `regulatory_compliance`."
    ),
    'farming': (
        "Category-specific note: consider whether this chemical has a distinct "
        "agricultural/technical grade and, where genuinely applicable, note any "
        "relevant registration (e.g. PCPB) in `regulatory_compliance`."
    ),
    'mining': (
        "Category-specific note: focus grade/specifications on what matters for mining "
        "use (e.g. purity relevant to froth flotation or leaching) rather than generic "
        "industrial boilerplate."
    ),
    'cleaning': (
        "Category-specific note: where genuinely applicable, note recommended use "
        "concentration and any relevant standard (e.g. NEMA, WHO) in "
        "`regulatory_compliance`."
    ),
    'disinfection': (
        "Category-specific note: where genuinely applicable, note recommended use "
        "concentration and any relevant standard (e.g. NEMA, WHO) in "
        "`regulatory_compliance`."
    ),
}

_DEFAULT_CATEGORY_HINT = (
    "Category-specific note: default to standard industrial/technical grade framing "
    "unless this chemical is genuinely known to have a specialized grade relevant to "
    "its category."
)


def _category_grade_hint(category):
    category_lower = (category or '').lower()
    for keyword, hint in CATEGORY_GRADE_HINTS.items():
        if keyword in category_lower:
            return hint
    return _DEFAULT_CATEGORY_HINT


CONTENT_FIELDS = [
    'name', 'short_description', 'introduction', 'description',
    'applications', 'applications_detailed', 'benefits_content',
    'packaging_info', 'storage_handling', 'safety_info',
    'packaging', 'specifications',
    'grades_available', 'regulatory_compliance', 'hazard_classification',
    'ai_faq', 'ai_benefits', 'ai_industries', 'ai_title', 'ai_summary',
    'seo_title', 'seo_description', 'keywords', 'alt_text',
    'internal_links', 'external_references', 'schema_data',
    'suggested_category', 'confidence_scores',
    'image', 'images'
]

IDENTITY_FIELDS = [
    'chemical_formula', 'cas_number', 'un_number', 'grade',
    'purity', 'molecular_weight', 'appearance',
    'brand', 'manufacturer',
]

LIST_FIELDS = {'applications', 'applications_detailed', 'packaging', 'ai_faq',
               'ai_benefits', 'ai_industries', 'internal_links', 'external_references',
               'images', 'grades_available', 'regulatory_compliance'}
DICT_FIELDS = {'specifications', 'schema_data', 'confidence_scores'}

# Mirrors apps.products.models.Product CharField max_length constraints. The model can
# ignore length hints in the prompt, so every string field is hard-truncated here as a
# safety net before it ever reaches the serializer.
FIELD_MAX_LENGTHS = {
    'name': 200,
    'chemical_formula': 100,
    'cas_number': 20,
    'un_number': 30,
    'purity': 50,
    'molecular_weight': 30,
    'appearance': 150,
    'grade': 100,
    'brand': 150,
    'manufacturer': 150,
    'short_description': 300,
    'seo_title': 60,
    'seo_description': 160,
    'keywords': 300,
    'alt_text': 200,
    'ai_title': 200,
    'hazard_classification': 200,
}

# Precise identifiers where truncation would corrupt the value rather than just
# shorten it (cutting "1310-73-2" to "1310-73" isn't a shorter CAS number, it's a
# wrong one). If the model overflows these, fall back to its own "unknown" convention
# instead of emitting a mangled identifier.
_IDENTITY_OVERFLOW_FALLBACK = {
    'chemical_formula': 'Information requires manual verification.',
    'cas_number': 'N/A',
    'un_number': 'N/A',
    'molecular_weight': 'N/A',
}


_PLACEHOLDER_VALUES = {'n/a', 'information requires manual verification.'}


def is_placeholder_value(value):
    return isinstance(value, str) and value.strip().lower() in _PLACEHOLDER_VALUES


def is_mock_mode():
    api_key = getattr(settings, 'OPENAI_API_KEY', '')
    return not api_key or 'mock' in api_key.lower()


def mock_mode_block(allow_mock=False):
    """
    Returns (blocked: bool, detail: str|None). Production callers that touch many
    products in one request (bulk regeneration, per-product generation used to build
    out a large catalogue) should refuse to proceed when this returns blocked=True,
    rather than silently writing near-identical templated placeholder content across
    every product touched — that's exactly the "scaled duplicate content" pattern
    search engines penalize, and it's otherwise indistinguishable after the fact since
    the resulting rows still carry the ordinary ai_generated=True flag.
    Local/dev use (DEBUG=True) is never blocked; pass allow_mock=True to override
    deliberately elsewhere (e.g. staging smoke tests without a real API key).
    """
    if not is_mock_mode() or allow_mock or settings.DEBUG:
        return False, None
    return True, (
        'OPENAI_API_KEY is not configured or invalid — generating content now would '
        'produce near-identical templated placeholder text instead of real AI content '
        'for every product touched. Fix OPENAI_API_KEY first, or pass '
        '{"allow_mock": true} to proceed deliberately.'
    )


def _truncate_at_word_boundary(text, max_len):
    """Cut prose to at most max_len characters without splitting a word in half."""
    if len(text) <= max_len:
        return text
    truncated = text[:max_len]
    if ' ' in truncated:
        truncated = truncated.rsplit(' ', 1)[0]
    return truncated.rstrip()


def _normalize(content):
    """Guarantee every expected key exists with the right container type and
    that string fields never exceed the destination model's max_length."""
    for field in CONTENT_FIELDS + IDENTITY_FIELDS:
        if field in LIST_FIELDS:
            if not isinstance(content.get(field), list):
                content[field] = []
        elif field in DICT_FIELDS:
            if not isinstance(content.get(field), dict):
                content[field] = {}
        else:
            if not isinstance(content.get(field), str):
                content[field] = str(content.get(field) or '')
            max_len = FIELD_MAX_LENGTHS.get(field)
            if max_len and len(content[field]) > max_len:
                if field in _IDENTITY_OVERFLOW_FALLBACK:
                    content[field] = _IDENTITY_OVERFLOW_FALLBACK[field]
                else:
                    content[field] = _truncate_at_word_boundary(content[field], max_len)
    return content


def _build_system_prompt(vision_data, use_web_search):
    rules = _VISION_GROUNDED_RULES if vision_data else _KNOWLEDGE_GROUNDED_RULES
    prompt = SYSTEM_PROMPT.replace('__SOURCE_OF_TRUTH_RULES__', rules.strip())
    if use_web_search:
        prompt += "\n" + _WEB_SEARCH_ADDENDUM
    return prompt


def _call_chat_completions(client, system_prompt, user_parts):
    """Non-grounded generation call — the long-standing behavior, used for bulk
    regeneration and as the fallback if a web-search-enabled call fails."""
    response = client.chat.completions.create(
        model=getattr(settings, 'OPENAI_MODEL', 'gpt-4o-mini'),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_parts},
        ],
        temperature=0.55,
        response_format={"type": "json_object"},
        max_tokens=8000,
    )
    content = json.loads(response.choices[0].message.content.strip())
    tokens = getattr(response.usage, 'total_tokens', 0)
    return content, tokens


def _call_with_web_search(client, system_prompt, user_text):
    """Grounded generation call via the Responses API's hosted web_search tool —
    lets the model look up real CAS numbers, specifications, and standards instead
    of relying only on trained knowledge. Single-product paths only (see callers)."""
    response = client.responses.create(
        model="gpt-4o",
        tools=[{"type": "web_search_preview"}],
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_text},
        ],
        text={"format": {"type": "json_object"}},
    )
    content = json.loads(response.output_text.strip())
    tokens = getattr(response.usage, 'total_tokens', 0)
    return content, tokens


def generate_product_content(product_name='', category='', image_b64=None,
                             image_url=None, existing=None,
                             image_b64_list=None, image_url_list=None,
                             vision_data=None, use_web_search=False):
    """
    Returns (content_dict, tokens_used).
    `existing` — dict of the current product data during regeneration.
    `vision_data` — pre-extracted JSON from Stage 1.
    `use_web_search` — grant the model a live internet search tool (single-product
    generate/regenerate only — never bulk, to bound search cost across a full
    catalogue run). Falls back to the non-grounded call if the tool call fails
    (e.g. not available on the configured OpenAI account).
    """
    if is_mock_mode():
        name_val = product_name
        if vision_data and vision_data.get("product_name"):
            name_val = vision_data.get("product_name")
        return _mock_content(name_val or 'Sodium Hydroxide', vision_data), 0

    text = ""
    if vision_data:
        text += f"Generate complete B2B marketing product content strictly using this pre-extracted image vision analysis: {json.dumps(vision_data)}."
    else:
        text += f"Generate complete product content for: '{product_name or 'the chemical'}'"

    if category:
        text += f" in category: '{category}'"
        text += "\n\n" + _category_grade_hint(category)
    text += "."

    if existing:
        # Placeholder sentinels ("N/A", "Information requires manual verification.")
        # mean the field is NOT actually known — treating them as "ground truth"
        # tells the model to preserve them across every future regeneration instead
        # of ever filling them in, which is exactly the bug this filters out.
        known = {k: v for k, v in existing.items() if v and not is_placeholder_value(v)}
        if isinstance(known.get('specifications'), dict):
            specs = {sk: sv for sk, sv in known['specifications'].items() if not is_placeholder_value(sv)}
            if specs:
                known['specifications'] = specs
            else:
                known.pop('specifications')
        if known:
            text += (
                "\n\nThis is a CONTENT UPGRADE of an existing catalogue product. The current "
                "verified data below is ground truth — keep these identity facts (name, "
                "chemical_formula, cas_number, un_number, grade, brand, manufacturer) "
                "consistent, correct only clear errors, and write substantially richer "
                "content around them. EXCEPTION — `specifications`: the listed rows are a "
                "correct but incomplete starting point, not the final set; keep them but "
                "expand to the full 6-12 relevant rows the instructions call for, don't "
                "just repeat the same subset back:\n"
                + json.dumps(known, ensure_ascii=False, default=str)[:4000]
            )

    system_prompt = _build_system_prompt(vision_data, use_web_search)
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    if use_web_search:
        try:
            content, tokens = _call_with_web_search(client, system_prompt, text)
        except Exception:
            # Web search tool/model unavailable on this account, or a transient
            # Responses API error — degrade gracefully rather than failing the
            # whole request; the admin still gets content, just not grounded.
            user_parts = [{"type": "text", "text": text}]
            fallback_prompt = _build_system_prompt(vision_data, use_web_search=False)
            content, tokens = _call_chat_completions(client, fallback_prompt, user_parts)
    else:
        user_parts = [{"type": "text", "text": text}]
        content, tokens = _call_chat_completions(client, system_prompt, user_parts)

    content = _normalize(content)

    image_val = ''
    images_val = []
    if vision_data:
        image_val = vision_data.get('image') or ''
        images_val = vision_data.get('images') or []
    if not image_val and image_url_list:
        image_val = image_url_list[0]
    if not images_val and image_url_list:
        images_val = image_url_list

    content['image'] = content.get('image') or image_val
    content['images'] = content.get('images') or images_val

    content['ai_generated'] = True
    return content, tokens


def _mock_content(name, vision_data=None):
    """Development fallback when no OpenAI key is configured."""
    brand = "Kivi Chemicals"
    manufacturer = "Kivi Chemicals"
    grade = "Industrial Grade"
    packaging_size = "25 kg"
    packaging_type = "Polypropylene Bag"
    
    if vision_data:
        brand = vision_data.get("brand") or brand
        manufacturer = vision_data.get("manufacturer") or manufacturer
        grade = vision_data.get("grade") or grade
        weight = vision_data.get("weight") or "25 kg"
        packaging_size = weight
        pkg = vision_data.get("packaging") or "Polypropylene Bag"
        packaging_type = pkg

    mock = {
        "name": name,
        "brand": brand,
        "manufacturer": manufacturer,
        "grade": grade,
        "chemical_formula": "NaOH" if "sodium" in name.lower() else ("H3BO3" if "boric" in name.lower() else "Information requires manual verification."),
        "cas_number": "1310-73-2" if "sodium" in name.lower() else ("10043-35-3" if "boric" in name.lower() else "N/A"),
        "un_number": "UN1823" if "sodium" in name.lower() else "N/A",
        "purity": "99.0% Min",
        "molecular_weight": "40.00 g/mol" if "sodium" in name.lower() else ("61.83 g/mol" if "boric" in name.lower() else "N/A"),
        "appearance": "White crystalline solid",
        "suggested_category": "Industrial Chemicals",
        "short_description": f"High-purity {name} supplied by {brand} for industrial formulation, processing, and treatment applications across East Africa.",
        "introduction": (
            f"{name} is one of the most widely consumed industrial chemicals in East African manufacturing. "
            f"Producers in Kenya, Uganda, and Tanzania rely on it across water treatment, soap and detergent "
            f"production, food processing, and general manufacturing. {brand} supplies verified "
            f"industrial and food grades with batch documentation, giving procurement teams a dependable "
            f"regional source without the lead times of direct importation."
        ),
        "description": (
            f"{name} is produced to tight purity tolerances and functions as a core reagent. "
            f"Performance in plant conditions depends on moisture control, carbonate limits, and trace-metal content — "
            f"parameters covered on every certificate of analysis issued with Kivi Chemicals deliveries."
        ),
        "applications_detailed": [
            {"title": "Industrial Applications", "description": f"{name} is used in manufacturing and processing lines as a core reagent."},
            {"title": "Water treatment", "description": f"{name} is used to optimize chemical reactions in industrial utilities."}
        ],
        "applications": ["Water treatment", "General manufacturing"],
        "benefits_content": (
            f"Sourcing {name} regionally reduces total landed cost: buyers avoid import demurrage, currency "
            f"exposure on long lead times, and the working capital tied up in oversized safety stock."
        ),
        "packaging_info": (
            f"Kivi Chemicals supplies {name} in {packaging_size} {packaging_type} as the standard commercial unit."
        ),
        "storage_handling": (
            f"Store {name} in a cool, dry, well-ventilated warehouse on pallets, away from incompatible materials."
        ),
        "safety_info": (
            "Wear chemical-resistant gloves, goggles, and protective clothing when handling."
        ),
        "packaging": [
            {"size": packaging_size, "type": packaging_type},
        ],
        "specifications": {
            "Appearance": "White crystalline solid",
            "Purity": "99.0% min",
        },
        "grades_available": [
            {"grade": grade, "note": f"Standard commercial grade of {name} stocked by Kivi Chemicals."},
        ],
        "regulatory_compliance": [],
        "hazard_classification": "Information requires manual verification.",
        "ai_faq": [
            {"question": f"What grades of {name} does Kivi Chemicals stock?", "answer": f"Industrial and technical grades are held in stock by Kivi Chemicals."}
        ],
        "ai_benefits": [
            "Verified batch purity with COA on every delivery",
            "Regional stock reduces lead times versus direct import",
        ],
        "ai_industries": ["Water Treatment", "Manufacturing"],
        "ai_title": f"A Procurement Guide to Sourcing {name} in East Africa",
        "ai_summary": f"How East African plants specify, buy, and handle {name} for reliable production.",
        "seo_title": f"Buy {name} Kenya | Kivi Chemicals",
        "seo_description": f"Premium grade {name} delivered across Kenya, Uganda and Tanzania. Request a quote today.",
        "keywords": f"{name} Kenya, buy {name} Nairobi, {name} Kenya Uganda Tanzania",
        "alt_text": f"Packaging of industrial grade {name}",
        "internal_links": [],
        "external_references": [],
        "schema_data": {},
        "ai_generated": True,
        "image": vision_data.get("image", "") if vision_data else "",
        "images": vision_data.get("images", []) if vision_data else [],
        "confidence_scores": {
            "name": 95,
            "brand": 95,
            "manufacturer": 95,
            "grade": 95,
            "chemical_formula": 90,
            "cas_number": 90,
            "un_number": 90,
            "purity": 95,
            "molecular_weight": 90,
            "appearance": 95,
            "packaging": 95,
            "specifications": 95,
            "suggested_category": 95,
            "short_description": 95,
            "description": 95
        }
    }
    return _normalize(mock)
