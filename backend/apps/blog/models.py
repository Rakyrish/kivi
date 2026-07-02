from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()


class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Blog Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    # ── Identity ──
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    category = models.ForeignKey(
        BlogCategory, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='posts'
    )
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='blog_posts'
    )

    # ── Content ──
    content = models.TextField()
    summary = models.CharField(max_length=300, blank=True)
    image = models.URLField(blank=True)
    featured_image_prompt = models.TextField(
        blank=True,
        help_text="AI prompt used to generate the featured image (for audit/regeneration)"
    )

    # ── SEO ──
    seo_title = models.CharField(max_length=60, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    keywords = models.CharField(max_length=300, blank=True)
    article_schema = models.JSONField(
        default=dict, blank=True,
        help_text="Auto-populated Article JSON-LD schema"
    )

    # ── AI-generated extras ──
    ai_generated = models.BooleanField(default=False)
    faq = models.JSONField(
        default=list, blank=True,
        help_text='[{"question": "...", "answer": "..."}, ...]'
    )
    internal_links = models.JSONField(
        default=list, blank=True,
        help_text='[{"title": "...", "slug": "...", "type": "product|category|blog"}]'
    )
    external_references = models.JSONField(
        default=list, blank=True,
        help_text='[{"title": "WHO", "url": "...", "nofollow": false}]'
    )

    # ── Quality & Metrics ──
    quality_score = models.IntegerField(
        default=0,
        help_text="0-100 score computed by AI quality audit (readability, depth, SEO)"
    )
    reading_time = models.IntegerField(
        default=0,
        help_text="Estimated reading time in minutes (computed on save)"
    )
    view_count = models.PositiveIntegerField(default=0)

    # ── Publishing ──
    is_published = models.BooleanField(default=False)
    auto_published = models.BooleanField(
        default=False,
        help_text="True if published automatically via scheduler without admin review"
    )
    published_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        # Compute reading time: average 200 wpm
        if self.content:
            word_count = len(self.content.split())
            self.reading_time = max(1, round(word_count / 200))
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
