from django.contrib import admin
from .models import ContactSubmission


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'company_name', 'subject', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email', 'company_name', 'subject', 'message')
    readonly_fields = ('name', 'email', 'phone', 'company_name', 'subject', 'message', 'created_at')

    def has_add_permission(self, request):
        return False
