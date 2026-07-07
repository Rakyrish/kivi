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
        ('chat', 'Kivi Agent Chat'),
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


class ChatMessage(models.Model):
    """
    Stores every Kivi Agent (public chatbot) exchange.
    Used for the admin 'Chatbot Usage' dashboard section.
    session_id is a random client-generated UUID — not user-identifiable.
    """
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]

    session_id = models.CharField(max_length=64, db_index=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    tokens_used = models.IntegerField(default=0)
    escalated = models.BooleanField(
        default=False,
        help_text="True when the assistant surfaced contact options (high purchase intent)."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['session_id', 'created_at']),
        ]

    def __str__(self):
        return f"[{self.role}] {self.content[:40]} — {self.created_at:%Y-%m-%d %H:%M}"


class SystemError(models.Model):
    ERROR_TYPES = [
        ('404', '404 Not Found'),
        ('500', '500 Server Error'),
        ('api_failure', 'API Failure'),
        ('database', 'Database Error'),
        ('cloudinary', 'Cloudinary Error'),
        ('openai', 'OpenAI Error'),
        ('form_submission', 'Form Submission Failure'),
    ]
    
    STATUS_CHOICES = [
        ('unresolved', 'Unresolved'),
        ('resolved', 'Resolved'),
    ]

    error_type = models.CharField(max_length=50, choices=ERROR_TYPES)
    source = models.CharField(max_length=255, help_text="e.g. URL pathway, view function, task name")
    message = models.TextField()
    stack_trace = models.TextField(blank=True)
    count = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unresolved')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.error_type} in {self.source} ({self.status})"


class SearchQueryLog(models.Model):
    query = models.CharField(max_length=255)
    results_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"'{self.query}' - {self.results_count} results"


class PerformanceMetric(models.Model):
    """
    One row per real Lighthouse audit, fetched from the Google PageSpeed
    Insights API by apps.analytics.tasks.run_pagespeed_audit.
    """
    url = models.URLField(blank=True, help_text="Page that was audited")
    strategy = models.CharField(
        max_length=10,
        choices=[('mobile', 'Mobile'), ('desktop', 'Desktop')],
        default='mobile'
    )
    performance_score = models.IntegerField()
    seo_score = models.IntegerField()
    accessibility_score = models.IntegerField()
    best_practices_score = models.IntegerField()
    lcp = models.FloatField(help_text="Largest Contentful Paint in seconds")
    cls = models.FloatField(help_text="Cumulative Layout Shift")
    inp = models.FloatField(help_text="Interaction to Next Paint in seconds")
    fcp = models.FloatField(help_text="First Contentful Paint in seconds")
    ttfb = models.FloatField(help_text="Time to First Byte in seconds")
    recommendations = models.JSONField(
        default=list, blank=True,
        help_text='Lighthouse improvement opportunities: [{"title": "...", "detail": "..."}]'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Performance Audit — {self.created_at:%Y-%m-%d %H:%M} (Perf: {self.performance_score})"
