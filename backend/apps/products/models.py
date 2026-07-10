from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator


def _unique_slug(instance, name):
    """
    Slugifies `name` and truncates it to the instance's `slug` field max_length
    (SlugField defaults to 50, and AI-generated names routinely produce longer
    slugs than that, which previously caused a DB-level DataError on save).
    Appends a numeric suffix on collision so uniqueness is preserved even after
    truncation shortens two different names down to the same prefix.
    """
    max_len = instance._meta.get_field('slug').max_length
    base_slug = slugify(name)[:max_len] or 'item'
    ModelClass = type(instance)
    slug = base_slug
    counter = 1
    while ModelClass.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
        suffix = f'-{counter}'
        slug = f'{base_slug[:max_len - len(suffix)]}{suffix}'
        counter += 1
    return slug


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)

    # SEO
    seo_title = models.CharField(max_length=60, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)

    # Media
    image = models.URLField(blank=True)               # Listing card image
    featured_image = models.URLField(blank=True)      # Category landing hero
    header_image = models.URLField(blank=True)        # Wide banner image

    # Category landing page content (600+ words target for independent ranking)
    overview_content = models.TextField(
        blank=True,
        help_text="600+ word editorial content about this category. Used for SEO category landing page."
    )
    benefits = models.JSONField(
        default=list,
        help_text='[{"title": "...", "description": "...", "icon": "..."}, ...]'
    )
    industries_served = models.JSONField(
        default=list,
        help_text='["Manufacturing", "Water Treatment", ...]'
    )
    faq = models.JSONField(
        default=list,
        help_text='[{"question": "...", "answer": "..."}, ...]'
    )

    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug(self, self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    # ── Identity ──
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='products'
    )

    # ── Chemical Properties ──
    chemical_formula = models.CharField(max_length=100, blank=True)   # e.g. NaOH
    cas_number = models.CharField(max_length=20, blank=True)           # e.g. 1310-73-2
    un_number = models.CharField(max_length=30, blank=True)            # Hazmat UN number
    purity = models.CharField(max_length=50, blank=True)               # e.g. "99.0% min"
    molecular_weight = models.CharField(max_length=30, blank=True)     # e.g. "40.00 g/mol"
    appearance = models.CharField(max_length=150, blank=True)          # e.g. "White crystalline powder"
    grade = models.CharField(max_length=100, blank=True)               # Industrial / Food / Technical / Lab

    # ── Packaging ──
    packaging = models.JSONField(
        default=list,
        help_text='[{"size": "25kg", "type": "bag"}, {"size": "200L", "type": "drum"}]'
    )

    # ── Content ──
    short_description = models.CharField(max_length=300, blank=True)
    introduction = models.TextField(
        blank=True,
        help_text="Product introduction (150-300 words): what it is, why it's used, industries, commercial importance."
    )
    description = models.TextField(blank=True)        # Detailed overview (300-500 words)
    applications = models.JSONField(default=list)     # ["Water treatment", "Soap making"]
    applications_detailed = models.JSONField(
        default=list, blank=True,
        help_text='Each use case explained individually: [{"title": "Water Treatment", "description": "..."}]'
    )
    benefits_content = models.TextField(
        blank=True,
        help_text="Benefits and advantages in flowing paragraphs (cost, performance, operational, industry)."
    )
    packaging_info = models.TextField(
        blank=True,
        help_text="Prose explanation of packaging options, bulk supply, and commercial formats."
    )
    storage_handling = models.TextField(
        blank=True,
        help_text="Detailed storage conditions and handling guidance."
    )
    specifications = models.JSONField(default=dict)   # {"Purity": "99%", "Form": "Powder"}
    safety_info = models.TextField(blank=True)        # Handling, storage, hazard info

    # ── Documents (Cloudinary URLs) ──
    sds_pdf = models.URLField(blank=True, help_text="Safety Data Sheet — Cloudinary URL")
    datasheet_pdf = models.URLField(
        blank=True,
        help_text="Product Datasheet — auto-generated by Celery on save"
    )

    # ── SEO ──
    seo_title = models.CharField(max_length=60, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    keywords = models.CharField(max_length=300, blank=True)
    schema_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Auto-populated Product JSON-LD schema. Admin can override."
    )
    alt_text = models.CharField(
        max_length=200, blank=True,
        help_text="AI-generated image alt text for accessibility"
    )

    # ── AI-Generated Content ──
    ai_generated = models.BooleanField(default=False)
    ai_title = models.CharField(max_length=200, blank=True)
    ai_summary = models.CharField(max_length=500, blank=True)
    ai_benefits = models.JSONField(default=list, blank=True)
    ai_faq = models.JSONField(
        default=list, blank=True,
        help_text='[{"question": "...", "answer": "..."}, ...]'
    )
    ai_industries = models.JSONField(default=list, blank=True)
    internal_links = models.JSONField(
        default=list, blank=True,
        help_text='[{"title": "...", "slug": "..."}] — related products/categories'
    )
    external_references = models.JSONField(
        default=list, blank=True,
        help_text='[{"title": "PubChem", "url": "...", "nofollow": false}]'
    )

    # ── Media ──
    image = models.URLField(blank=True)
    images = models.JSONField(default=list)

    # ── Status Flags ──
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    in_stock = models.BooleanField(default=True)

    # ── Inventory ──
    current_stock = models.IntegerField(default=100)
    reserved_stock = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=10)
    supplier = models.CharField(max_length=200, blank=True)
    batch_number = models.CharField(max_length=100, blank=True)
    product_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    product_status = models.CharField(
        max_length=30,
        choices=[
            ('in_stock', 'In Stock'),
            ('low_stock', 'Low Stock'),
            ('out_of_stock', 'Out of Stock'),
            ('discontinued', 'Discontinued')
        ],
        default='in_stock'
    )

    # ── Analytics ──
    view_count = models.PositiveIntegerField(default=0)
    quote_request_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug(self, self.name)

        # Update product status based on stock level if not discontinued
        if self.product_status != 'discontinued':
            if self.current_stock <= 0:
                self.product_status = 'out_of_stock'
                self.in_stock = False
            elif self.current_stock <= self.reorder_level:
                self.product_status = 'low_stock'
                self.in_stock = True
            else:
                self.product_status = 'in_stock'
                self.in_stock = True
        else:
            self.in_stock = False
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class SiteSetting(models.Model):
    """Singleton model — only one row. Read via SiteSetting.get_solo()"""

    # ── Company ──
    company_name = models.CharField(max_length=200, default='')
    tagline = models.CharField(max_length=300, default='')
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    whatsapp_fr = models.CharField(
        max_length=20, blank=True,
        help_text="Optional separate WhatsApp number for French-speaking markets (DRC, Rwanda, Burundi)"
    )
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Kenya')
    opening_hours = models.CharField(max_length=200, blank=True)

    # ── Branding ──
    logo = models.URLField(blank=True)
    favicon = models.URLField(blank=True)

    # ── SEO Defaults ──
    default_seo_title = models.CharField(max_length=60, blank=True)
    default_seo_description = models.CharField(max_length=160, blank=True)
    default_keywords = models.CharField(max_length=500, blank=True)

    # ── Social ──
    linkedin_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)

    # ── Analytics (editable from admin; override env defaults) ──
    google_analytics_id = models.CharField(max_length=20, blank=True)
    google_site_verification = models.CharField(max_length=100, blank=True)

    # ── AI Blog Settings ──
    auto_publish_blogs = models.BooleanField(
        default=False,
        help_text="If True, AI-generated blogs are auto-published without admin review. Default: require approval."
    )
    blog_posts_per_week = models.IntegerField(
        default=2,
        validators=[MinValueValidator(0), MaxValueValidator(7)],
        help_text="Number of automated blog posts to generate per week (0 to disable)."
    )

    # ── Technical (stored here so they're editable, not hardcoded) ──
    revalidate_secret = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = 'Site Setting'

    @classmethod
    def get_solo(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return self.company_name or "Site Setting"


class SavedProduct(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='saved_products')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='saved_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username} saved {self.product.name}"


class TechnicalDataSheet(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='tds')
    chemical_formula = models.CharField(max_length=100, blank=True)
    product_description = models.TextField(blank=True)
    
    # JSON parameters
    technical_specifications = models.JSONField(default=dict, blank=True)
    physical_properties = models.JSONField(default=dict, blank=True)
    chemical_properties = models.JSONField(default=dict, blank=True)
    industrial_applications = models.JSONField(default=list, blank=True)
    
    purity = models.CharField(max_length=50, blank=True)
    appearance = models.CharField(max_length=150, blank=True)
    solubility = models.CharField(max_length=150, blank=True)
    density = models.CharField(max_length=50, blank=True)
    ph = models.CharField(max_length=20, blank=True)
    
    packaging = models.TextField(blank=True)
    storage_conditions = models.TextField(blank=True)
    shelf_life = models.CharField(max_length=100, blank=True)
    safety_notes = models.TextField(blank=True)
    handling_recommendations = models.TextField(blank=True)
    
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"TDS for {self.product.name}"


class StockMovementLog(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_movements')
    movement_type = models.CharField(
        max_length=20,
        choices=[
            ('in', 'Stock In'),
            ('out', 'Stock Out'),
            ('reserve', 'Stock Reserve'),
            ('release', 'Stock Release')
        ]
    )
    quantity = models.IntegerField()
    reference = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} - {self.movement_type} {self.quantity} ({self.created_at.strftime('%Y-%m-%d')})"

