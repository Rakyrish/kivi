from django.db import models


class PageView(models.Model):
    """
    Lightweight anonymous page view tracker.
    Stored server-side for GA-independent analytics.
    No PII — session_id is a random UUID, not user-identifiable.
    """
    path = models.CharField(max_length=500)
    referrer = models.CharField(max_length=500, blank=True)
    country = models.CharField(max_length=100, blank=True)
    device_type = models.CharField(max_length=20, blank=True)
    session_id = models.CharField(max_length=64, blank=True)  # Random UUID — not user-identifiable
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['path', 'created_at']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.path} — {self.created_at:%Y-%m-%d %H:%M}"


class ProductView(models.Model):
    """
    Tracks views of individual product pages.
    Used for admin 'most viewed products' metric.
    """
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='product_views'
    )
    session_id = models.CharField(max_length=64, blank=True)
    country = models.CharField(max_length=100, blank=True)
    device_type = models.CharField(max_length=20, blank=True)
    referrer = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', 'created_at']),
        ]

    def __str__(self):
        return f"{self.product.name} — {self.created_at:%Y-%m-%d}"


class AIGenerationLog(models.Model):
    """
    Audit log for every AI generation call — product content, blog, image prompt.
    Used for admin AI metrics dashboard section.
    """
    ACTION_TYPES = [
        ('product_text', 'Product Content (text)'),
        ('product_image', 'Product Content (image analysis)'),
        ('blog_manual', 'Blog (manual)'),
        ('blog_auto', 'Blog (automated scheduler)'),
        ('datasheet', 'Product Datasheet PDF'),
    ]

    STATUS_CHOICES = [
        ('success', 'Success'),
        ('error', 'Error'),
        ('pending', 'Pending'),
    ]

    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    target_id = models.IntegerField(null=True, blank=True)    # Product or Blog ID
    target_name = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    tokens_used = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    triggered_by = models.CharField(max_length=100, blank=True)  # 'admin', 'scheduler', 'signal'
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Generation Log'

    def __str__(self):
        return f"{self.action_type} — {self.target_name} — {self.status}"
