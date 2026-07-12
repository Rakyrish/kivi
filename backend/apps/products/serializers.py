from rest_framework import serializers
from .models import Category, Product, SiteSetting, SavedProduct, TechnicalDataSheet, StockMovementLog
from .media import rehost_image_url, rehost_image_urls


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

    def create(self, validated_data):
        # Any pasted/external image URL is re-hosted onto our own Cloudinary
        # account so the product never hotlinks a third-party domain.
        name_hint = validated_data.get('name', '')
        if validated_data.get('image'):
            validated_data['image'] = rehost_image_url(validated_data['image'], name_hint)
        if validated_data.get('images'):
            validated_data['images'] = rehost_image_urls(validated_data['images'], name_hint)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # URL preservation: a product's slug is permanent once created.
        # Content regeneration and admin edits must never move the page.
        validated_data.pop('slug', None)
        name_hint = validated_data.get('name') or instance.name
        if validated_data.get('image'):
            validated_data['image'] = rehost_image_url(validated_data['image'], name_hint)
        if validated_data.get('images'):
            validated_data['images'] = rehost_image_urls(validated_data['images'], name_hint)
        return super().update(instance, validated_data)


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        # revalidate_secret is a server-to-server webhook credential — GET on this
        # endpoint is AllowAny (public site settings like phone/address), so it must
        # never round-trip through this serializer or it'd be readable by anyone.
        exclude = ['revalidate_secret']


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

