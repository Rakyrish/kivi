from rest_framework import serializers
from .models import Category, Product, SiteSetting, SavedProduct, TechnicalDataSheet, StockMovementLog


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = '__all__'


class TechnicalDataSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechnicalDataSheet
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    tds = TechnicalDataSheetSerializer(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def update(self, instance, validated_data):
        # URL preservation: a product's slug is permanent once created.
        # Content regeneration and admin edits must never move the page.
        validated_data.pop('slug', None)
        return super().update(instance, validated_data)


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = '__all__'


class SavedProductSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = SavedProduct
        fields = ['id', 'product', 'product_details', 'created_at']
        read_only_fields = ['id', 'created_at']


class StockMovementLogSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = StockMovementLog
        fields = '__all__'

