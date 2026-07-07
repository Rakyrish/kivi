from django.contrib import admin
from .models import Category, Product, SiteSetting, SavedProduct, TechnicalDataSheet, StockMovementLog


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order', 'is_featured', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('order', 'is_featured', 'is_active')
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'chemical_formula', 'cas_number',
        'grade', 'category', 'current_stock', 'product_status',
        'is_active', 'is_featured', 'in_stock'
    )
    list_filter = ('category', 'is_active', 'is_featured', 'in_stock', 'grade', 'product_status')
    search_fields = ('name', 'chemical_formula', 'cas_number', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active', 'is_featured', 'in_stock', 'current_stock', 'product_status')


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'email', 'phone', 'city', 'country')

    def has_add_permission(self, request):
        # Limit to single instance
        return not SiteSetting.objects.exists()


@admin.register(SavedProduct)
class SavedProductAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at')
    list_filter = ('user', 'created_at')
    search_fields = ('user__username', 'product__name')


@admin.register(TechnicalDataSheet)
class TechnicalDataSheetAdmin(admin.ModelAdmin):
    list_display = ('product', 'chemical_formula', 'purity', 'appearance', 'is_published')
    list_filter = ('is_published',)
    search_fields = ('product__name', 'chemical_formula', 'purity')


@admin.register(StockMovementLog)
class StockMovementLogAdmin(admin.ModelAdmin):
    list_display = ('product', 'movement_type', 'quantity', 'reference', 'created_at')
    list_filter = ('movement_type', 'created_at')
    search_fields = ('product__name', 'reference')

