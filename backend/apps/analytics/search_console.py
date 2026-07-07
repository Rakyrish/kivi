"""
Google Search Console integration via a service account.

Setup:
1. Create a service account in Google Cloud and enable the Search Console API.
2. Add the service account email as a (restricted) user on the GSC property.
3. Set env vars:
   - GSC_SITE_URL, e.g. "sc-domain:kivichemicals.com" or "https://kivichemicals.com/"
   - GOOGLE_SERVICE_ACCOUNT_FILE (path to the JSON key)
     or GOOGLE_SERVICE_ACCOUNT_JSON (the raw JSON string)

fetch_search_analytics() returns None when unconfigured or unavailable so
callers can fall back to internal search logs honestly.
"""
import json
from datetime import date, timedelta
from urllib.parse import quote
from django.conf import settings
from django.core.cache import cache

SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
API_BASE = 'https://searchconsole.googleapis.com/webmasters/v3/sites'
CACHE_KEY = 'gsc_search_analytics_v1'
FAILURE_CACHE_KEY = 'gsc_search_analytics_failed_v1'
CACHE_TTL = 3600          # GSC data lags days; hourly refresh is plenty
FAILURE_CACHE_TTL = 600   # don't hammer the API after an auth/network failure


def _get_credentials():
    from google.oauth2 import service_account

    raw_json = getattr(settings, 'GOOGLE_SERVICE_ACCOUNT_JSON', '')
    if raw_json:
        return service_account.Credentials.from_service_account_info(
            json.loads(raw_json), scopes=SCOPES
        )
    key_file = getattr(settings, 'GOOGLE_SERVICE_ACCOUNT_FILE', '')
    if key_file:
        return service_account.Credentials.from_service_account_file(
            key_file, scopes=SCOPES
        )
    return None


def _query(session, site, body):
    response = session.post(
        f"{API_BASE}/{quote(site, safe='')}/searchAnalytics/query",
        json=body,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def fetch_search_analytics(days=28, row_limit=10):
    """
    Returns {'clicks', 'impressions', 'ctr', 'average_position', 'top_queries',
    'period_days'} from the live Search Console API, or None when not
    configured / temporarily unavailable. Results are cached for an hour.
    """
    site = getattr(settings, 'GSC_SITE_URL', '')
    if not site:
        return None

    cached = cache.get(CACHE_KEY)
    if cached:
        return cached
    if cache.get(FAILURE_CACHE_KEY):
        return None

    credentials = _get_credentials()
    if credentials is None:
        return None

    from google.auth.transport.requests import AuthorizedSession
    session = AuthorizedSession(credentials)

    end = date.today() - timedelta(days=2)  # GSC data has ~2 days of lag
    start = end - timedelta(days=days)
    date_range = {'startDate': start.isoformat(), 'endDate': end.isoformat()}

    try:
        totals = _query(session, site, {**date_range, 'rowLimit': 1})
        queries = _query(session, site, {
            **date_range,
            'dimensions': ['query'],
            'rowLimit': row_limit,
        })
    except Exception as e:
        from .models import SystemError
        SystemError.objects.create(
            error_type='api_failure',
            source='search_console',
            message=f'Search Console query failed for {site}: {e}',
        )
        cache.set(FAILURE_CACHE_KEY, True, FAILURE_CACHE_TTL)
        return None

    totals_row = (totals.get('rows') or [{}])[0]
    result = {
        'clicks': int(totals_row.get('clicks', 0)),
        'impressions': int(totals_row.get('impressions', 0)),
        'ctr': round(totals_row.get('ctr', 0) * 100, 2),
        'average_position': round(totals_row.get('position', 0), 1),
        'top_queries': [
            {
                'query': row['keys'][0],
                'clicks': int(row.get('clicks', 0)),
                'impressions': int(row.get('impressions', 0)),
                'position': round(row.get('position', 0), 1),
            }
            for row in queries.get('rows', [])
        ],
        'period_days': days,
    }
    cache.set(CACHE_KEY, result, CACHE_TTL)
    return result
