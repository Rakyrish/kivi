from django.contrib import admin
from .models import PageView, ProductView, AIGenerationLog, SystemError, SearchQueryLog, PerformanceMetric, ChatMessage


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ('path', 'referrer', 'country', 'device_type', 'session_id', 'created_at')
    list_filter = ('country', 'device_type', 'created_at')
    search_fields = ('path', 'referrer', 'session_id')
    readonly_fields = ('created_at',)


@admin.register(ProductView)
class ProductViewAdmin(admin.ModelAdmin):
    list_display = ('product', 'referrer', 'country', 'device_type', 'session_id', 'created_at')
    list_filter = ('country', 'device_type', 'created_at', 'product')
    search_fields = ('referrer', 'session_id', 'product__name')
    readonly_fields = ('created_at',)


@admin.register(AIGenerationLog)
class AIGenerationLogAdmin(admin.ModelAdmin):
    list_display = ('action_type', 'target_name', 'status', 'tokens_used', 'triggered_by', 'created_at', 'completed_at')
    list_filter = ('action_type', 'status', 'triggered_by', 'created_at')
    search_fields = ('target_name', 'error_message')
    readonly_fields = ('created_at', 'completed_at')


@admin.register(SystemError)
class SystemErrorAdmin(admin.ModelAdmin):
    list_display = ('error_type', 'source', 'message', 'count', 'status', 'created_at', 'updated_at')
    list_filter = ('error_type', 'status', 'created_at')
    search_fields = ('source', 'message', 'stack_trace')


@admin.register(SearchQueryLog)
class SearchQueryLogAdmin(admin.ModelAdmin):
    list_display = ('query', 'results_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('query',)


@admin.register(PerformanceMetric)
class PerformanceMetricAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'performance_score', 'seo_score', 'accessibility_score', 'best_practices_score')
    readonly_fields = ('created_at',)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'role', 'content', 'escalated', 'tokens_used', 'created_at')
    list_filter = ('role', 'escalated', 'created_at')
    search_fields = ('content', 'session_id')
    readonly_fields = ('created_at',)
