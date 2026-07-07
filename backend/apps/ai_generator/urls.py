from django.urls import path
from .views import GenerateProductContentView, GenerateBlogContentView, AIBusinessAssistantView, KiviAgentView, AnalyzeProductImageView

urlpatterns = [
    path('analyze-image/', AnalyzeProductImageView.as_view(), name='analyze_image'),
    path('generate-product/', GenerateProductContentView.as_view(), name='generate_product'),
    path('generate-blog/', GenerateBlogContentView.as_view(), name='generate_blog'),
    path('assistant/', AIBusinessAssistantView.as_view(), name='ai_assistant'),
    path('kivi-agent/', KiviAgentView.as_view(), name='kivi_agent'),
]
