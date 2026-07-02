from django.db import models


DEVICE_CHOICES = [
    ('desktop', 'Desktop'),
    ('mobile', 'Mobile'),
    ('tablet', 'Tablet'),
    ('unknown', 'Unknown'),
]


class QuoteRequest(models.Model):
    """
    Tracks product-specific quote requests from the public product pages.
    Distinct from ContactSubmission (general inquiries) — this is tied to a specific product.
    """
    # Product context — denormalized so records survive product deletion
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='quote_requests'
    )
    product_name = models.CharField(max_length=200, blank=True)         # Denormalized snapshot
    chemical_formula = models.CharField(max_length=100, blank=True)     # Denormalized snapshot
    product_slug = models.CharField(max_length=200, blank=True)         # Denormalized snapshot

    # ── Requester Details ──
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    company = models.CharField(max_length=150, blank=True)
    country = models.CharField(max_length=100, blank=True)

    # ── Request Details ──
    quantity = models.CharField(max_length=100, blank=True)     # e.g. "500 kg", "2 drums"
    message = models.TextField(blank=True)

    # ── Source Tracking ──
    source_page = models.CharField(max_length=500, blank=True)  # URL of product page
    referrer = models.CharField(max_length=500, blank=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_CHOICES, default='unknown')
    utm_source = models.CharField(max_length=100, blank=True)
    utm_medium = models.CharField(max_length=100, blank=True)
    utm_campaign = models.CharField(max_length=100, blank=True)

    # ── CRM ──
    is_processed = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Quote Request'
        verbose_name_plural = 'Quote Requests'

    def __str__(self):
        prod = self.product_name or 'Unknown product'
        return f"Quote: {prod} — {self.name} ({self.company or self.email})"

    def save(self, *args, **kwargs):
        # Denormalize product fields on first save
        if self.product and not self.product_name:
            self.product_name = self.product.name
            self.chemical_formula = self.product.chemical_formula
            self.product_slug = self.product.slug
        super().save(*args, **kwargs)


class Lead(models.Model):
    """
    General lead capture — e.g. newsletter, whitepaper, event.
    Separate from QuoteRequest (product-specific) and ContactSubmission (support).
    """
    LEAD_SOURCES = [
        ('website', 'Website'),
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email Campaign'),
        ('referral', 'Referral'),
        ('trade_show', 'Trade Show'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    company = models.CharField(max_length=150, blank=True)
    country = models.CharField(max_length=100, blank=True)
    interest = models.CharField(max_length=300, blank=True)
    source = models.CharField(max_length=20, choices=LEAD_SOURCES, default='website')
    is_converted = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} — {self.email}"
