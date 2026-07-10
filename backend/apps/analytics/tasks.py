"""
Real performance monitoring via the Google PageSpeed Insights API.

Runs Lighthouse against the live site and stores category scores,
Core Web Vitals, and improvement opportunities in PerformanceMetric.
Scheduled daily through celery-beat (see the seed_schedules command)
and triggerable on demand from the admin dashboard.
"""
import requests
from celery import shared_task
from django.conf import settings
from .models import PerformanceMetric, SystemError

PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
CATEGORIES = ['PERFORMANCE', 'SEO', 'ACCESSIBILITY', 'BEST_PRACTICES']


def _score(lighthouse, category_id):
    category = lighthouse.get('categories', {}).get(category_id, {})
    raw = category.get('score')
    return round(raw * 100) if raw is not None else 0


def _audit_seconds(audits, audit_id):
    value = audits.get(audit_id, {}).get('numericValue')
    return round(value / 1000, 3) if value is not None else 0.0


def _extract_recommendations(audits, limit=8):
    """Lighthouse 'opportunity' audits that scored below 0.9, biggest savings first."""
    opportunities = []
    for audit in audits.values():
        details = audit.get('details') or {}
        score = audit.get('score')
        if details.get('type') != 'opportunity' or score is None or score >= 0.9:
            continue
        opportunities.append({
            'title': audit.get('title', ''),
            'detail': audit.get('displayValue', ''),
            'savings_ms': details.get('overallSavingsMs', 0),
        })
    opportunities.sort(key=lambda o: o['savings_ms'], reverse=True)
    return [{'title': o['title'], 'detail': o['detail']} for o in opportunities[:limit]]


@shared_task(name="apps.analytics.tasks.run_pagespeed_audit")
def run_pagespeed_audit(url=None, strategy='mobile'):
    audit_url = url or getattr(settings, 'PUBLIC_SITE_URL', '')
    if not audit_url:
        return {'status': 'error', 'message': 'PUBLIC_SITE_URL is not configured.'}

    params = [
        ('url', audit_url),
        ('strategy', strategy),
    ] + [('category', c) for c in CATEGORIES]
    api_key = getattr(settings, 'PAGESPEED_API_KEY', '')
    if api_key:
        params.append(('key', api_key))

    try:
        response = requests.get(PSI_ENDPOINT, params=params, timeout=120)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        SystemError.objects.create(
            error_type='api_failure',
            source='pagespeed_insights',
            message=f'PageSpeed audit failed for {audit_url} ({strategy}): {e}',
        )
        return {'status': 'error', 'message': str(e)}

    lighthouse = data.get('lighthouseResult', {})
    audits = lighthouse.get('audits', {})

    # INP is a field metric — lab Lighthouse rarely has it. Prefer real CrUX data.
    inp = 0.0
    field_metrics = data.get('loadingExperience', {}).get('metrics', {})
    inp_percentile = field_metrics.get('INTERACTION_TO_NEXT_PAINT', {}).get('percentile')
    if inp_percentile is not None:
        inp = round(inp_percentile / 1000, 3)
    elif 'interaction-to-next-paint' in audits:
        inp = _audit_seconds(audits, 'interaction-to-next-paint')

    cls_value = audits.get('cumulative-layout-shift', {}).get('numericValue')

    metric = PerformanceMetric.objects.create(
        url=audit_url,
        strategy=strategy,
        performance_score=_score(lighthouse, 'performance'),
        seo_score=_score(lighthouse, 'seo'),
        accessibility_score=_score(lighthouse, 'accessibility'),
        best_practices_score=_score(lighthouse, 'best-practices'),
        lcp=_audit_seconds(audits, 'largest-contentful-paint'),
        cls=round(cls_value, 4) if cls_value is not None else 0.0,
        inp=inp,
        fcp=_audit_seconds(audits, 'first-contentful-paint'),
        ttfb=_audit_seconds(audits, 'server-response-time'),
        recommendations=_extract_recommendations(audits),
    )

    return {
        'status': 'success',
        'id': metric.id,
        'url': audit_url,
        'strategy': strategy,
        'performance_score': metric.performance_score,
        'seo_score': metric.seo_score,
        'accessibility_score': metric.accessibility_score,
        'best_practices_score': metric.best_practices_score,
    }
