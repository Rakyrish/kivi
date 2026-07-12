from django.contrib import admin

from .models import ContactSubmission


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'name', 'email', 'company_name', 'inquiry_type', 'status', 'created_at')
    list_filter = ('status', 'inquiry_type', 'created_at')
    search_fields = ('name', 'email', 'company_name', 'subject', 'message', 'reference_number')
    readonly_fields = (
        'name', 'email', 'phone', 'company_name', 'subject', 'message',
        'reference_number', 'inquiry_type', 'country', 'product_interest', 'quantity',
        'attachment_url', 'attachment_filename', 'created_at', 'updated_at',
    )

    def has_add_permission(self, request):
        return False
