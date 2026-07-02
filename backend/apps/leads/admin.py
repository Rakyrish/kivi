from django.contrib import admin
from .models import QuoteRequest, Lead


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'email', 'company', 'product_name',
        'quantity', 'country', 'device_type', 'is_processed', 'created_at'
    )
    list_filter = ('is_processed', 'country', 'device_type', 'created_at')
    search_fields = ('name', 'email', 'company', 'product_name', 'message')
    list_editable = ('is_processed',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'country', 'source', 'is_converted', 'created_at')
    list_filter = ('is_converted', 'source', 'country', 'created_at')
    search_fields = ('name', 'email', 'company', 'interest')
    list_editable = ('is_converted',)
    readonly_fields = ('created_at',)
