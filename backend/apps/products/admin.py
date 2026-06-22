from django.contrib import admin
from .models import Category, Product, SiteSetting


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('order', 'is_active')
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'chemical_formula', 'cas_number',
        'grade', 'category', 'is_active', 'is_featured', 'in_stock'
    )
    list_filter = ('category', 'is_active', 'is_featured', 'in_stock', 'grade')
    search_fields = ('name', 'chemical_formula', 'cas_number', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active', 'is_featured', 'in_stock')


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'email', 'phone', 'city', 'country')

    def has_add_permission(self, request):
        # Limit to single instance
        return not SiteSetting.objects.exists()
