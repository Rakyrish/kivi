from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuoteRequestViewSet, LeadViewSet

router = DefaultRouter()
router.register(r'quote-requests', QuoteRequestViewSet, basename='quoterequest')
router.register(r'leads', LeadViewSet, basename='lead')

urlpatterns = [
    path('', include(router.urls)),
]
