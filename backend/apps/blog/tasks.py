import random
import json
import openai
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from apps.products.models import SiteSetting
from apps.analytics.views import log_ai_action
from .models import BlogPost, BlogCategory


# Topics pool representing industry trends, regulatory updates, procurement guides, water treatment, etc.
TOPICS_POOL = [
    {
        "topic": "KEBS chemical standards compliance checklist for Kenyan factories",
        "keywords": "KEBS standards, chemical compliance Kenya, factory inspection Nairobi",
    },
    {
        "topic": "Safe handling and storage protocols for Sodium Hydroxide in municipal water systems",
        "keywords": "Sodium Hydroxide handling, water treatment chemicals, chlorine storage",
    },
    {
        "topic": "How East African cosmetics manufacturers optimize raw solvent procurement paths",
        "keywords": "cosmetics raw materials, solvent sourcing East Africa, industrial grade chemicals",
    },
    {
        "topic": "NEMA waste water environmental regulations: pH neutralization requirements",
        "keywords": "NEMA waste water, pH neutralization, acid neutralizing agents Kenya",
    },
    {
        "topic": "Procurement officer handbook: checking purity grade credentials for bulk imports",
        "keywords": "chemical bulk imports, certificate of analysis, purity verification",
    },
    {
        "topic": "Comparative guide: Food Grade vs Laboratory Grade Hydrochloric Acid",
        "keywords": "Food grade Hydrochloric, Laboratory chemicals Kenya, chemical grade differences",
    },
    {
        "topic": "Mitigating hazmat transportation risks across Northern Corridor shipping lanes",
        "keywords": "hazmat shipping East Africa, Northern corridor logistics, chemical transport guidelines",
    }
]


@shared_task(name="apps.blog.tasks.automated_weekly_blog_generation")
def automated_weekly_blog_generation():
    # 1. Fetch site settings to check toggle
    settings_obj = SiteSetting.get_solo()
    posts_per_week = settings_obj.blog_posts_per_week
    
    if posts_per_week <= 0:
        return "Automated blog post generation is disabled via Site Settings."

    # Choose a random topic from the pool
    chosen = random.choice(TOPICS_POOL)
    topic = chosen['topic']
    keywords = chosen['keywords']

    # Get blog category "Industrial Compliance" or create it
    category, _ = BlogCategory.objects.get_or_create(
        name="Industrial & Compliance",
        defaults={"description": "Updates on regulations, safety compliance, and regional procurement paths."}
    )

    api_key = getattr(settings, 'OPENAI_API_KEY', '')
    use_mock = not api_key or 'mock' in api_key.lower() or api_key == ''

    if use_mock:
        title = f"Guide to {topic}"
        content = f"<h2>Executive Summary</h2><p>For modern manufacturers in Kenya, maintaining compliance with safety frameworks is paramount. Sourcing certified chemical compounds prevents catalytic contamination during large batch mixings. Let's analyze how {topic} optimizes operations and reduces long-term operational expenditures.</p><h3>The Role of Purity Grades</h3><p>Whether utilizing alkalies or solvents, procurement officers must inspect Certificates of Analysis to avoid caking and regulatory delays at ports of entry.</p>"
        summary = f"An automated guide reviewing key compliance parameters of {topic} for local B2B manufacturers."
        seo_title = f"{title} | Kivi Industrial Chemicals"
        seo_description = f"Read our expert technical guidelines on {topic} for industries across East Africa."
        img_prompt = f"Professional corporate photography, technical chemistry lab setup, deep navy background"
        
        post = BlogPost.objects.create(
            title=title,
            content=content,
            summary=summary,
            seo_title=seo_title[:60],
            seo_description=seo_description[:160],
            keywords=keywords,
            featured_image_prompt=img_prompt,
            category=category,
            ai_generated=True,
            quality_score=90,
            is_published=settings_obj.auto_publish_blogs,
            auto_published=settings_obj.auto_publish_blogs,
            published_at=timezone.now() if settings_obj.auto_publish_blogs else None
        )
        log_ai_action("blog_auto", topic, "success", 0, triggered_by="scheduler")
        return f"Successfully created automated blog post '{title}' (Published: {post.is_published})"

    client = openai.OpenAI(api_key=api_key)
    prompt = f"""
You are an expert technical content writer for a premium B2B chemical brand in Kenya.
Generate a comprehensive, professional, search-optimized blog post about: "{topic}"
Keywords to include: {keywords}

The article must be highly technical, authoritative, and cover safety, storage, regional standards (KEBS, TBS, UN guidelines), and industrial applications. It must be between 1500 and 3000 words.

Return ONLY a valid JSON object with this exact structure, no markdown wrappers, no preamble, no tail text:
{{
  "title": "Compelling search-optimized title",
  "slug": "url-friendly-slug",
  "content": "Full article content in valid HTML formatting (h2, h3, p, strong, ul, li). High-density technical writing.",
  "summary": "1-2 sentence overview of the article",
  "seo_title": "SEO title under 60 chars",
  "seo_description": "Meta description under 160 chars",
  "keywords": "comma-separated keyword string",
  "featured_image_prompt": "Detailed AI image generation prompt matching this article",
  "faq": [{{"question": "...", "answer": "..."}}],
  "internal_links": [],
  "external_references": [{{"title": "...", "url": "...", "nofollow": true}}],
  "article_schema": {{}}
}}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You output JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            response_format={"type": "json_object"},
            max_tokens=3000,
        )
        content_str = response.choices[0].message.content.strip()
        data = json.loads(content_str)
        
        post = BlogPost.objects.create(
            title=data.get('title'),
            slug=data.get('slug') or slugify(data.get('title')),
            content=data.get('content'),
            summary=data.get('summary', ''),
            seo_title=data.get('seo_title', '')[:60],
            seo_description=data.get('seo_description', '')[:160],
            keywords=data.get('keywords', ''),
            featured_image_prompt=data.get('featured_image_prompt', ''),
            faq=data.get('faq', []),
            external_references=data.get('external_references', []),
            article_schema=data.get('article_schema', {}),
            category=category,
            ai_generated=True,
            quality_score=85,
            is_published=settings_obj.auto_publish_blogs,
            auto_published=settings_obj.auto_publish_blogs,
            published_at=timezone.now() if settings_obj.auto_publish_blogs else None
        )
        tokens = getattr(response.usage, 'total_tokens', 0)
        log_ai_action("blog_auto", topic, "success", tokens, triggered_by="scheduler")
        return f"Successfully created automated blog post '{post.title}' (Published: {post.is_published})"
    except Exception as e:
        log_ai_action("blog_auto", topic, "error", 0, str(e), triggered_by="scheduler")
        return f"Failed to generate automated blog post: {str(e)}"
