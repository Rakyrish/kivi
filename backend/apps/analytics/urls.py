from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PageViewViewSet, ProductViewViewSet, DashboardMetricsView, SystemErrorViewSet, PerformanceMetricViewSet

router = DefaultRouter()
router.register(r'page-views', PageViewViewSet, basename='pageview')
router.register(r'product-views', ProductViewViewSet, basename='productview')
router.register(r'errors', SystemErrorViewSet, basename='systemerror')
router.register(r'performance', PerformanceMetricViewSet, basename='performancemetric')

urlpatterns = [
    path('dashboard-metrics/', DashboardMetricsView.as_view(), name='dashboard-metrics'),
    path('', include(router.urls)),
]
