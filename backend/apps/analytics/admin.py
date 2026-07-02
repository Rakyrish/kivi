from django.contrib import admin
from .models import PageView, ProductView, AIGenerationLog


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
