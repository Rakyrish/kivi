from rest_framework import serializers
from .models import PageView, ProductView, AIGenerationLog, SystemError, SearchQueryLog, PerformanceMetric


class PageViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageView
        fields = '__all__'


class ProductViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductView
        fields = '__all__'


class AIGenerationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIGenerationLog
        fields = '__all__'


class SystemErrorSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemError
        fields = '__all__'


class SearchQueryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchQueryLog
        fields = '__all__'


class PerformanceMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceMetric
        fields = '__all__'
