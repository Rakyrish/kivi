from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PageViewViewSet, ProductViewViewSet, DashboardMetricsView

router = DefaultRouter()
router.register(r'page-views', PageViewViewSet, basename='pageview')
router.register(r'product-views', ProductViewViewSet, basename='productview')

urlpatterns = [
    path('dashboard-metrics/', DashboardMetricsView.as_view(), name='dashboard-metrics'),
    path('', include(router.urls)),
]
