import time
from django.db import connection, models
from django.db.models import Count, Sum, F
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.products.models import Product, Category, SiteSetting
from apps.blog.models import BlogPost
from apps.contacts.models import ContactSubmission
from apps.leads.models import QuoteRequest, Lead
from .models import PageView, ProductView, AIGenerationLog, SystemError, SearchQueryLog, PerformanceMetric, ChatMessage
from .serializers import (
    PageViewSerializer, ProductViewSerializer, AIGenerationLogSerializer,
    SystemErrorSerializer, SearchQueryLogSerializer, PerformanceMetricSerializer
)
from .search_console import fetch_search_analytics
from .tasks import run_pagespeed_audit
import cloudinary
import cloudinary.api


class PageViewViewSet(viewsets.ModelViewSet):
    queryset = PageView.objects.all()
    serializer_class = PageViewSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        user_agent = self.request.META.get('HTTP_USER_AGENT', '').lower()
        device_type = 'unknown'
        if 'mobile' in user_agent:
            device_type = 'mobile'
        elif 'tablet' in user_agent or 'ipad' in user_agent:
            device_type = 'tablet'
        elif any(x in user_agent for x in ['windows', 'macintosh', 'linux', 'cros']):
            device_type = 'desktop'

        country = self.request.META.get('HTTP_CF_IPCOUNTRY', '') or self.request.META.get('HTTP_X_COUNTRY', '')
        
        extra_fields = {}
        if not serializer.validated_data.get('device_type') or serializer.validated_data.get('device_type') == 'unknown':
            extra_fields['device_type'] = device_type
        if not serializer.validated_data.get('country') and country:
            extra_fields['country'] = country
        if not serializer.validated_data.get('referrer'):
            extra_fields['referrer'] = self.request.META.get('HTTP_REFERER', '')[:500]

        serializer.save(**extra_fields)


class ProductViewViewSet(viewsets.ModelViewSet):
    queryset = ProductView.objects.all()
    serializer_class = ProductViewSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        user_agent = self.request.META.get('HTTP_USER_AGENT', '').lower()
        device_type = 'unknown'
        if 'mobile' in user_agent:
            device_type = 'mobile'
        elif 'tablet' in user_agent or 'ipad' in user_agent:
            device_type = 'tablet'
        elif any(x in user_agent for x in ['windows', 'macintosh', 'linux', 'cros']):
            device_type = 'desktop'

        country = self.request.META.get('HTTP_CF_IPCOUNTRY', '') or self.request.META.get('HTTP_X_COUNTRY', '')
        
        extra_fields = {}
        if not serializer.validated_data.get('device_type') or serializer.validated_data.get('device_type') == 'unknown':
            extra_fields['device_type'] = device_type
        if not serializer.validated_data.get('country') and country:
            extra_fields['country'] = country
        if not serializer.validated_data.get('referrer'):
            extra_fields['referrer'] = self.request.META.get('HTTP_REFERER', '')[:500]

        product_view = serializer.save(**extra_fields)
        
        # Increment denormalized view count on Product
        if product_view.product:
            Product.objects.filter(id=product_view.product.id).update(view_count=Count('product_views'))


class DashboardMetricsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # 1. Core Counts
        counts = {
            'products': Product.objects.count(),
            'categories': Category.objects.count(),
            'blog_posts': BlogPost.objects.count(),
            'leads': Lead.objects.count(),
            'quote_requests': QuoteRequest.objects.count(),
            'contacts': ContactSubmission.objects.count(),
            'unresolved_errors': SystemError.objects.filter(status='unresolved').count(),
        }

        # 2. Activity Trends (Last 30 Days)
        views_count = PageView.objects.filter(created_at__gte=thirty_days_ago).count()
        quotes_count = QuoteRequest.objects.filter(created_at__gte=thirty_days_ago).count()
        leads_count = Lead.objects.filter(created_at__gte=thirty_days_ago).count()

        # 3. Product Analytics
        most_viewed = Product.objects.filter(is_active=True).order_by('-view_count')[:5]
        most_viewed_data = [{'id': p.id, 'name': p.name, 'slug': p.slug, 'view_count': p.view_count} for p in most_viewed]

        most_requested = Product.objects.filter(is_active=True).order_by('-quote_request_count')[:5]
        most_requested_data = [{'id': p.id, 'name': p.name, 'slug': p.slug, 'quote_request_count': p.quote_request_count} for p in most_requested]

        # 4. Device and Country Breakdown (Last 30 Days)
        devices = PageView.objects.filter(created_at__gte=thirty_days_ago).values('device_type').annotate(count=Count('id')).order_by('-count')
        countries = PageView.objects.filter(created_at__gte=thirty_days_ago).values('country').annotate(count=Count('id')).order_by('-count')[:5]

        # 5. AI Generation Audit Stats
        ai_stats = {
            'total_calls': AIGenerationLog.objects.count(),
            'success_calls': AIGenerationLog.objects.filter(status='success').count(),
            'failed_calls': AIGenerationLog.objects.filter(status='error').count(),
            'total_tokens': AIGenerationLog.objects.aggregate(total=Sum('tokens_used'))['total'] or 0
        }

        # 6. Site Health Check
        health = {}
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            health['db'] = 'healthy'
        except Exception:
            health['db'] = 'unhealthy'

        try:
            cache.set('ping', 'pong', 5)
            health['redis'] = 'healthy' if cache.get('ping') == 'pong' else 'unhealthy'
        except Exception:
            health['redis'] = 'unhealthy'

        try:
            cloudinary.api.ping()
            health['cloudinary'] = 'healthy'
        except Exception:
            health['cloudinary'] = 'unhealthy'

        # 7. Search analytics — live Google Search Console when configured,
        # otherwise the site's own internal search logs. Never fabricated.
        gsc_data = fetch_search_analytics()
        if gsc_data:
            search_analytics = {**gsc_data, 'source': 'search_console'}
        else:
            top_searches = SearchQueryLog.objects.values('query').annotate(
                searches=Count('id'),
                avg_results=Sum('results_count') / Count('id')
            ).order_by('-searches')[:10]
            search_analytics = {
                'clicks': sum(s['searches'] for s in top_searches),
                'impressions': None,
                'ctr': None,
                'average_position': None,
                'top_queries': [
                    {
                        'query': s['query'],
                        'clicks': s['searches'],
                        'impressions': None,
                        'results_count': int(s['avg_results'] or 0),
                    } for s in top_searches
                ],
                'source': 'internal_search',
            }

        # 8. Performance Metrics (real Lighthouse audits via PageSpeed Insights).
        # None until the first audit runs — the dashboard offers a manual trigger.
        perf_metric = PerformanceMetric.objects.first()
        performance_data = None
        if perf_metric:
            performance_data = {
                'performance_score': perf_metric.performance_score,
                'seo_score': perf_metric.seo_score,
                'accessibility_score': perf_metric.accessibility_score,
                'best_practices_score': perf_metric.best_practices_score,
                'lcp': perf_metric.lcp,
                'cls': perf_metric.cls,
                'inp': perf_metric.inp,
                'fcp': perf_metric.fcp,
                'ttfb': perf_metric.ttfb,
                'url': perf_metric.url,
                'strategy': perf_metric.strategy,
                'recommendations': perf_metric.recommendations,
                'audited_at': perf_metric.created_at,
            }

        return Response({
            'counts': counts,
            'trends': {
                'pageviews_30d': views_count,
                'quotes_30d': quotes_count,
                'leads_30d': leads_count,
            },
            'product_analytics': {
                'most_viewed': most_viewed_data,
                'most_requested': most_requested_data,
            },
            'demographics': {
                'devices': list(devices),
                'countries': list(countries),
            },
            'ai_stats': ai_stats,
            'chatbot': self._get_chatbot_stats(thirty_days_ago),
            'health': health,
            'google_search_console': search_analytics,
            'lighthouse': performance_data,
            'inventory': self._get_inventory_stats(),
            'security': self._get_security_stats(),
        })

    def _get_chatbot_stats(self, since):
        """Kivi Agent usage stats for the dashboard, from real chat logs."""
        recent = ChatMessage.objects.filter(created_at__gte=since)
        return {
            'total_messages': ChatMessage.objects.count(),
            'messages_30d': recent.count(),
            'sessions_30d': recent.values('session_id').distinct().count(),
            'escalations_30d': recent.filter(escalated=True).count(),
            'tokens_30d': recent.aggregate(total=Sum('tokens_used'))['total'] or 0,
        }

    def _get_inventory_stats(self):
        """Real inventory stats calculated from DB product stock."""
        total = Product.objects.filter(is_active=True).count()
        in_stock = Product.objects.filter(is_active=True, product_status='in_stock').count()
        low_stock = Product.objects.filter(is_active=True, product_status='low_stock').count()
        out_of_stock = Product.objects.filter(is_active=True, product_status='out_of_stock').count()
        discontinued = Product.objects.filter(is_active=True, product_status='discontinued').count()
        featured = Product.objects.filter(is_active=True, is_featured=True).count()
        
        # Calculate total asset valuation
        total_valuation = Product.objects.filter(is_active=True).aggregate(
            total_val=Sum(F('current_stock') * F('product_cost'), output_field=models.DecimalField())
        )['total_val'] or 0.00
        
        return {
            'total_active': total,
            'in_stock': in_stock,
            'low_stock': low_stock,
            'out_of_stock': out_of_stock,
            'discontinued': discontinued,
            'featured': featured,
            'stock_rate': round(((in_stock + low_stock) / total * 100) if total > 0 else 100, 1),
            'total_valuation': float(total_valuation)
        }

    def _get_security_stats(self):
        """Security monitoring — using available auth token and failed login data."""
        from django.contrib.auth.models import User
        now = timezone.now()
        seven_days_ago = now - timedelta(days=7)
        recent_users = User.objects.filter(date_joined__gte=seven_days_ago).count()
        active_admins = User.objects.filter(is_staff=True, is_active=True).count()
        return {
            'active_admin_users': active_admins,
            'new_users_7d': recent_users,
            'failed_login_note': 'Enable django-axes for detailed failed login monitoring.',
            'rate_limit_note': 'DRF throttle: 60req/min anon, 200req/min authenticated.',
        }


class SystemErrorViewSet(viewsets.ModelViewSet):
    queryset = SystemError.objects.all()
    serializer_class = SystemErrorSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, pk=None):
        error = self.get_object()
        error.status = 'resolved'
        error.save()
        return Response({'status': 'resolved', 'message': f'Error {pk} marked as resolved'})

    @action(detail=False, methods=['post'], url_path='resolve-all')
    def resolve_all(self, request):
        SystemError.objects.filter(status='unresolved').update(status='resolved')
        return Response({'status': 'resolved', 'message': 'All unresolved errors marked as resolved'})


class PerformanceMetricViewSet(viewsets.ModelViewSet):
    queryset = PerformanceMetric.objects.all()
    serializer_class = PerformanceMetricSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['post'], url_path='run-audit')
    def run_audit(self, request):
        """Queue a real Lighthouse audit via PageSpeed Insights (sync fallback if broker is down)."""
        strategy = request.data.get('strategy', 'mobile')
        if strategy not in ('mobile', 'desktop'):
            return Response({'error': "strategy must be 'mobile' or 'desktop'"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            run_pagespeed_audit.delay(strategy=strategy)
            return Response({'status': 'queued', 'strategy': strategy})
        except Exception:
            result = run_pagespeed_audit(strategy=strategy)
            if result.get('status') == 'success':
                return Response({'status': 'completed', **result})
            return Response(result, status=status.HTTP_502_BAD_GATEWAY)

