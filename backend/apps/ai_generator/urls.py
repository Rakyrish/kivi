from django.urls import path
from .views import GenerateProductContentView, GenerateBlogContentView, AIBusinessAssistantView

urlpatterns = [
    path('generate-product/', GenerateProductContentView.as_view(), name='generate_product'),
    path('generate-blog/', GenerateBlogContentView.as_view(), name='generate_blog'),
    path('assistant/', AIBusinessAssistantView.as_view(), name='ai_assistant'),
]
