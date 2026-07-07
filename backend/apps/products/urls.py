from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, SiteSettingView, SavedProductViewSet, ImageUploadView

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('saved', SavedProductViewSet, basename='saved-product')
router.register('', ProductViewSet, basename='product')

urlpatterns = [
    path('settings/', SiteSettingView.as_view(), name='site_settings'),
    path('upload-image/', ImageUploadView.as_view(), name='image_upload'),
    path('', include(router.urls)),
]

