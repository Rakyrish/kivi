import uuid

from django.db import models
from django.utils import timezone

INQUIRY_TYPE_CHOICES = [
    ('quotation', 'Request Quotation'),
    ('product_info', 'Product Information'),
    ('technical_support', 'Technical Support'),
    ('bulk_order', 'Bulk Order'),
    ('partnership', 'Partnership Inquiry'),
    ('general', 'General Inquiry'),
]

STATUS_CHOICES = [
    ('new', 'New'),
    ('in_progress', 'In Progress'),
    ('replied', 'Replied'),
    ('closed', 'Closed'),
]


def generate_reference_number():
    return f"KIVI-{timezone.now():%Y%m%d}-{uuid.uuid4().hex[:6].upper()}"


class ContactSubmission(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    company_name = models.CharField(max_length=150, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    reference_number = models.CharField(max_length=32, unique=True, blank=True, db_index=True)
    inquiry_type = models.CharField(max_length=30, choices=INQUIRY_TYPE_CHOICES, default='general')
    country = models.CharField(max_length=100, blank=True)
    product_interest = models.CharField(max_length=200, blank=True)
    quantity = models.CharField(max_length=100, blank=True)
    attachment_url = models.URLField(blank=True)
    attachment_filename = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Inquiry'
        verbose_name_plural = 'Inquiries'

    def __str__(self):
        return f"[{self.reference_number}] {self.name} - {self.subject}"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            for _ in range(5):
                candidate = generate_reference_number()
                if not ContactSubmission.objects.filter(reference_number=candidate).exists():
                    self.reference_number = candidate
                    break
        super().save(*args, **kwargs)
