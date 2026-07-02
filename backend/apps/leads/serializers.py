from rest_framework import serializers
from .models import QuoteRequest, Lead


class QuoteRequestSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(read_only=True)
    chemical_formula = serializers.CharField(read_only=True)
    product_slug = serializers.CharField(read_only=True)

    class Meta:
        model = QuoteRequest
        fields = '__all__'


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'
