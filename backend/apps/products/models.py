from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    seo_title = models.CharField(max_length=60, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    image = models.URLField(blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    # Identity
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='products'
    )

    # Chemical-specific fields
    chemical_formula = models.CharField(max_length=50, blank=True)   # e.g. NaOH
    cas_number = models.CharField(max_length=20, blank=True)          # e.g. 1310-73-2
    grade = models.CharField(max_length=100, blank=True)              # Industrial / Food / Technical
    un_number = models.CharField(max_length=10, blank=True)           # Hazmat UN number

    # Content
    short_description = models.CharField(max_length=300)
    description = models.TextField()
    applications = models.JSONField(default=list)    # ["Water treatment", "Soap making"]
    specifications = models.JSONField(default=dict)  # {"Purity": "99%", "Form": "Powder"}
    safety_info = models.TextField(blank=True)       # Handling, storage, hazard info

    # SEO
    seo_title = models.CharField(max_length=60, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    keywords = models.CharField(max_length=300, blank=True)

    # Media (Cloudinary or general URLs)
    image = models.URLField(blank=True)
    images = models.JSONField(default=list)

    # Flags
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    in_stock = models.BooleanField(default=True)
    ai_generated = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class SiteSetting(models.Model):
    """Singleton model — only one row. Read via SiteSetting.get_solo()"""
    company_name = models.CharField(max_length=200, default='')
    tagline = models.CharField(max_length=300, default='')
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Kenya')
    logo = models.URLField(blank=True)
    favicon = models.URLField(blank=True)
    default_seo_title = models.CharField(max_length=60, blank=True)
    default_seo_description = models.CharField(max_length=160, blank=True)
    default_keywords = models.CharField(max_length=500, blank=True)
    linkedin_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)

    class Meta:
        verbose_name = 'Site Setting'

    @classmethod
    def get_solo(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return self.company_name or "Site Setting"
