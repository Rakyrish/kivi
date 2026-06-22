from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from apps.seo.views import SitemapView, RobotsView

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('sitemap.xml', SitemapView.as_view(), name='sitemap'),
    path('robots.txt', RobotsView.as_view(), name='robots'),
    path('api/auth/token/', obtain_auth_token, name='api_token_auth'),
    path('api/products/', include('apps.products.urls')),
    path('api/blog/', include('apps.blog.urls')),
    path('api/contacts/', include('apps.contacts.urls')),
    path('api/ai/', include('apps.ai_generator.urls')),
]
