from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from apps.seo.views import SitemapView, RobotsView, SEOAuditView, ContentQualityAuditView


class LoginView(ObtainAuthToken):
    """
    Plain credentials-in, token-out login. Deliberately does not include
    SessionAuthentication: if the browser happens to be carrying a valid
    Django session cookie (e.g. from /django-admin/), DRF's SessionAuthentication
    authenticates that session and then enforces CSRF on this request - which
    fails because the frontend never sends a CSRF token for this token-auth
    flow, turning a normal login attempt into a 403.

    JSONParser is added here because ObtainAuthToken's default parsers only
    include FormParser/MultiPartParser — the frontend POSTs application/json,
    so without JSONParser the body is unparseable and DRF returns 400.
    """
    authentication_classes = []
    parser_classes = [JSONParser, FormParser, MultiPartParser]


urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('sitemap.xml', SitemapView.as_view(), name='sitemap'),
    path('robots.txt', RobotsView.as_view(), name='robots'),
    path('api/auth/token/', LoginView.as_view(), name='api_token_auth'),
    path('api/products/', include('apps.products.urls')),
    path('api/blog/', include('apps.blog.urls')),
    path('api/contacts/', include('apps.contacts.urls')),
    path('api/ai/', include('apps.ai_generator.urls')),
    path('api/leads/', include('apps.leads.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/seo/audit/', SEOAuditView.as_view(), name='seo-audit'),
    path('api/seo/content-quality/', ContentQualityAuditView.as_view(), name='seo-content-quality'),
]

