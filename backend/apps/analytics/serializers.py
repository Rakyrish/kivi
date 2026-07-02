from rest_framework import serializers
from .models import PageView, ProductView, AIGenerationLog


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
