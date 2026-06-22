from django.urls import path
from .views import GenerateProductContentView

urlpatterns = [
    path('generate-product/', GenerateProductContentView.as_view(), name='generate_product'),
]
