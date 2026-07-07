from django.core.cache import cache
from django.db.models import Q
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Category, Product, SiteSetting, SavedProduct, TechnicalDataSheet, StockMovementLog
from .serializers import CategorySerializer, ProductSerializer, SiteSettingSerializer, SavedProductSerializer, TechnicalDataSheetSerializer, StockMovementLogSerializer
import cloudinary.uploader


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return Category.objects.all()
        return Category.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def list(self, request, *args, **kwargs):
        is_admin = bool(request.user and request.user.is_staff)
        cache_key = f'category_list_admin_{is_admin}'
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
    serializer_class = ProductSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return Product.objects.all().select_related('category')
        return Product.objects.filter(is_active=True).select_related('category')

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'slugs', 'featured']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def list(self, request, *args, **kwargs):
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
                
                # Log Search Query
                try:
                    from apps.analytics.models import SearchQueryLog
                    SearchQueryLog.objects.create(
                        query=search_query.strip(),
                        results_count=queryset.count()
                    )
                except Exception:
                    pass

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
        slugs = Product.objects.filter(is_active=True).values('slug')
        return Response(list(slugs))

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = Product.objects.filter(is_active=True, is_featured=True)[:4]
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'put'], url_path='tds')
    def tds(self, request, slug=None):
        product = self.get_object()
        
        # Get or create TDS
        tds, created = TechnicalDataSheet.objects.get_or_create(
            product=product,
            defaults={
                'chemical_formula': product.chemical_formula,
                'product_description': product.description,
                'purity': product.purity,
                'appearance': product.appearance,
                'grade': product.grade,
                'packaging': str(product.packaging),
                'safety_info': product.safety_info,
            }
        )
        
        if request.method == 'GET':
            serializer = TechnicalDataSheetSerializer(tds)
            return Response(serializer.data)
            
        elif request.method == 'PUT':
            serializer = TechnicalDataSheetSerializer(tds, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                # Re-trigger PDF generation task in the background
                try:
                    from .tasks import generate_product_datasheet_task
                    generate_product_datasheet_task.delay(product.id)
                except Exception:
                    pass
                
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='regenerate')
    def regenerate(self, request, slug=None):
        """Regenerate one product's content in place (URL preserved). Sync fallback if broker is down."""
        from .tasks import regenerate_product_content_task, regenerate_product_content
        product = self.get_object()
        try:
            regenerate_product_content_task.delay(product.id)
            return Response({'status': 'queued', 'slug': product.slug})
        except Exception:
            try:
                result = regenerate_product_content(product.id)
                return Response({'status': 'completed', 'slug': product.slug, 'detail': result})
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    @action(detail=False, methods=['post'], url_path='regenerate-bulk')
    def regenerate_bulk(self, request):
        """
        Queue content regeneration for selected products ({"slugs": [...]}) or the
        whole catalogue ({"all": true}). Tasks are staggered to respect OpenAI limits.
        """
        from .tasks import regenerate_product_content_task

        if request.data.get('all'):
            queryset = Product.objects.all()
        else:
            slugs = request.data.get('slugs') or []
            if not isinstance(slugs, list) or not slugs:
                return Response(
                    {'error': "Provide {'slugs': [...]} or {'all': true}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            queryset = Product.objects.filter(slug__in=slugs)

        ids = list(queryset.values_list('id', flat=True))
        if not ids:
            return Response({'error': 'No matching products found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            for i, product_id in enumerate(ids):
                regenerate_product_content_task.apply_async(args=[product_id], countdown=i * 8)
        except Exception as e:
            return Response(
                {'error': f'Task queue unavailable — start the Celery worker and retry. ({e})'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        return Response({
            'status': 'queued',
            'count': len(ids),
            'estimated_minutes': round(len(ids) * 8 / 60, 1),
        })

    @action(detail=True, methods=['post'], url_path='update-stock')
    def update_stock(self, request, slug=None):
        product = self.get_object()
        movement_type = request.data.get('movement_type')
        quantity = int(request.data.get('quantity', 0))
        reference = request.data.get('reference', '')

        if movement_type not in ['in', 'out', 'reserve', 'release']:
            return Response({'error': 'Invalid movement type'}, status=status.HTTP_400_BAD_REQUEST)
        if quantity <= 0:
            return Response({'error': 'Quantity must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

        if movement_type == 'in':
            product.current_stock += quantity
        elif movement_type == 'out':
            if product.current_stock < quantity:
                return Response({'error': 'Insufficient stock available'}, status=status.HTTP_400_BAD_REQUEST)
            product.current_stock -= quantity
        elif movement_type == 'reserve':
            if (product.current_stock - product.reserved_stock) < quantity:
                return Response({'error': 'Insufficient available stock to reserve'}, status=status.HTTP_400_BAD_REQUEST)
            product.reserved_stock += quantity
        elif movement_type == 'release':
            if product.reserved_stock < quantity:
                return Response({'error': 'Cannot release more than reserved stock'}, status=status.HTTP_400_BAD_REQUEST)
            product.reserved_stock -= quantity

        product.save()

        # Log movement
        StockMovementLog.objects.create(
            product=product,
            movement_type=movement_type,
            quantity=quantity,
            reference=reference,
            created_by=request.user if request.user.is_authenticated else None
        )

        return Response(ProductSerializer(product).data)

    @action(detail=False, methods=['get'], url_path='inventory-logs')
    def inventory_logs(self, request):
        logs = StockMovementLog.objects.all().select_related('product', 'created_by')
        
        page = self.paginate_queryset(logs)
        if page is not None:
            serializer = StockMovementLogSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = StockMovementLogSerializer(logs, many=True)
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


class SavedProductViewSet(viewsets.ModelViewSet):
    serializer_class = SavedProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedProduct.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Allow passing 'product_slug' in request body
        product_slug = request.data.get('product_slug')
        if product_slug:
            try:
                product = Product.objects.get(slug=product_slug)
                request.data['product'] = product.id
            except Product.DoesNotExist:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already saved
        product_id = request.data.get('product')
        if product_id:
            exists = SavedProduct.objects.filter(user=request.user, product_id=product_id).first()
            if exists:
                serializer = self.get_serializer(exists)
                return Response(serializer.data, status=status.HTTP_200_OK)
        
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='toggle')
    def toggle(self, request):
        product_slug = request.data.get('product_slug')
        product_id = request.data.get('product')
        
        if not product_slug and not product_id:
            return Response({'error': 'product or product_slug is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if product_slug:
                product = Product.objects.get(slug=product_slug)
            else:
                product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
            
        saved_item = SavedProduct.objects.filter(user=request.user, product=product).first()
        if saved_item:
            saved_item.delete()
            return Response({'saved': False, 'message': 'Product removed from saved list'}, status=status.HTTP_200_OK)
        else:
            saved_item = SavedProduct.objects.create(user=request.user, product=product)
            serializer = self.get_serializer(saved_item)
            return Response({'saved': True, 'data': serializer.data, 'message': 'Product saved successfully'}, status=status.HTTP_201_CREATED)


class ImageUploadView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file') or request.FILES.get('image')
        if not uploaded_file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Upload directly to Cloudinary
            upload_result = cloudinary.uploader.upload(
                uploaded_file,
                folder="products",
                resource_type="image"
            )
            
            secure_url = upload_result.get('secure_url')
            public_id = upload_result.get('public_id')
            
            # Generate optimized, webp, and thumbnail URLs using Cloudinary Transformations
            optimized_url = secure_url.replace('/upload/', '/upload/q_auto,f_auto/')
            webp_url = secure_url.replace('/upload/', '/upload/f_webp/')
            thumbnail_url = secure_url.replace('/upload/', '/upload/c_thumb,w_200,h_200,g_auto/')
            
            return Response({
                'original_url': secure_url,
                'optimized_url': optimized_url,
                'webp_url': webp_url,
                'thumbnail_url': thumbnail_url,
                'public_id': public_id,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log to system errors
            try:
                from apps.analytics.models import SystemError
                SystemError.objects.create(
                    error_type='cloudinary',
                    source='ImageUploadView',
                    message=str(e)
                )
            except Exception:
                pass
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

