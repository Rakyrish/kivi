from django.core.cache import cache
from django.db.models import Q
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Category, Product, SiteSetting
from .serializers import CategorySerializer, ProductSerializer, SiteSettingSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def list(self, request, *args, **kwargs):
        cache_key = 'category_list'
        data = cache.get(cache_key)
        if not data:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            data = serializer.data
            cache.set(cache_key, data, timeout=3600)
        return Response(data)

    def perform_create(self, serializer):
        serializer.save()
        cache.clear()

    def perform_update(self, serializer):
        serializer.save()
        cache.clear()

    def perform_destroy(self, instance):
        instance.delete()
        cache.clear()


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('category')
    serializer_class = ProductSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'slugs', 'featured']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def list(self, request, *args, **kwargs):
        # Handle query params in cache key
        query_params = request.query_params.urlencode()
        cache_key = f'product_list_{query_params}'
        data = cache.get(cache_key)

        if not data:
            queryset = self.get_queryset()

            # Filter by Category slug
            category_slug = request.query_params.get('category')
            if category_slug:
                queryset = queryset.filter(category__slug=category_slug)

            # Search by name, description, formula, cas_number
            search_query = request.query_params.get('search')
            if search_query:
                queryset = queryset.filter(
                    Q(name__icontains=search_query) |
                    Q(description__icontains=search_query) |
                    Q(chemical_formula__icontains=search_query) |
                    Q(cas_number__icontains=search_query)
                )

            # Ordering
            ordering = request.query_params.get('ordering', '-is_featured')
            if ordering == 'name_asc':
                queryset = queryset.order_by('name')
            elif ordering == 'name_desc':
                queryset = queryset.order_by('-name')
            elif ordering == 'created_at':
                queryset = queryset.order_by('-created_at')
            else:
                queryset = queryset.order_by('-is_featured', '-created_at')

            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            data = serializer.data
            cache.set(cache_key, data, timeout=3600)

        return Response(data)

    @action(detail=False, methods=['get'])
    def slugs(self, request):
        # Public slug endpoint for generateStaticParams in SSG
        slugs = Product.objects.filter(is_active=True).values('slug')
        return Response(list(slugs))

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = Product.objects.filter(is_active=True, is_featured=True)[:4]
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save()
        cache.clear()

    def perform_update(self, serializer):
        serializer.save()
        cache.clear()

    def perform_destroy(self, instance):
        instance.delete()
        cache.clear()


class SiteSettingView(APIView):
    """
    Get or Update singleton SiteSetting instance.
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get(self, request):
        setting = SiteSetting.get_solo()
        serializer = SiteSettingSerializer(setting)
        return Response(serializer.data)

    def put(self, request):
        setting = SiteSetting.get_solo()
        serializer = SiteSettingSerializer(setting, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
