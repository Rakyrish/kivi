from django.http import HttpResponse
from django.views import View
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.products.models import Product
from apps.blog.models import BlogPost


class SitemapView(View):
    def get(self, request):
        base = getattr(settings, 'SITE_URL', 'https://kivichemicals.com')
        products = Product.objects.filter(is_active=True).values('slug', 'updated_at')
        posts = BlogPost.objects.filter(is_published=True).values('slug', 'updated_at')

        lines = ['<?xml version="1.0" encoding="UTF-8"?>',
                 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']

        for path, priority, freq in [
            ('', '1.0', 'weekly'),
            ('/products', '0.9', 'daily'),
            ('/about', '0.7', 'monthly'),
            ('/contact', '0.7', 'monthly'),
            ('/blog', '0.8', 'weekly'),
        ]:
            lines += [f'<url><loc>{base}{path}</loc>'
                      f'<changefreq>{freq}</changefreq>'
                      f'<priority>{priority}</priority></url>']

        for p in products:
            lines += [f'<url><loc>{base}/products/{p["slug"]}</loc>'
                      f'<lastmod>{p["updated_at"].date()}</lastmod>'
                      f'<changefreq>weekly</changefreq><priority>0.85</priority></url>']

        # /products?category=… URLs are intentionally excluded: they canonicalise
        # to /products, and sitemaps should only list canonical URLs.

        for b in posts:
            lines += [f'<url><loc>{base}/blog/{b["slug"]}</loc>'
                      f'<lastmod>{b["updated_at"].date()}</lastmod>'
                      f'<changefreq>monthly</changefreq><priority>0.7</priority></url>']

        lines.append('</urlset>')
        return HttpResponse('\n'.join(lines), content_type='application/xml')


class RobotsView(View):
    def get(self, request):
        base = getattr(settings, 'SITE_URL', 'https://kivichemicals.com')
        content = f"""User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /django-admin/
Disallow: /api/
Disallow: /_next/

Sitemap: {base}/sitemap.xml
"""
        return HttpResponse(content, content_type='text/plain')


class SEOAuditView(APIView):
    """
    Admin-only SEO audit endpoint.
    Scans products and blog posts for common SEO issues and returns actionable recommendations.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        issues = []
        recommendations = []

        # ── Product SEO Audit ──
        products = Product.objects.filter(is_active=True)
        product_count = products.count()

        missing_seo_title = products.filter(seo_title='').count()
        missing_seo_desc = products.filter(seo_description='').count()
        missing_image = products.filter(image='').count()
        missing_alt = products.filter(alt_text='').count()
        missing_keywords = products.filter(keywords='').count()
        missing_short_desc = products.filter(short_description='').count()

        # Duplicate title detection
        from django.db.models import Count
        dup_titles = (
            products.exclude(seo_title='')
            .values('seo_title')
            .annotate(count=Count('id'))
            .filter(count__gt=1)
        )
        dup_descs = (
            products.exclude(seo_description='')
            .values('seo_description')
            .annotate(count=Count('id'))
            .filter(count__gt=1)
        )

        # ── Blog SEO Audit ──
        posts = BlogPost.objects.filter(is_published=True)
        post_count = posts.count()
        posts_missing_seo_title = posts.filter(seo_title='').count()
        posts_missing_seo_desc = posts.filter(seo_description='').count()
        posts_missing_image = posts.filter(image='').count()
        posts_missing_summary = posts.filter(summary='').count()

        # ── Sitemap ──
        sitemap_url = f"{getattr(settings, 'SITE_URL', 'https://kivichemicals.com')}/sitemap.xml"
        total_indexed = product_count + post_count + 5  # static pages

        # ── Issues list ──
        if missing_seo_title > 0:
            issues.append({'type': 'products', 'issue': 'Missing SEO Title', 'count': missing_seo_title, 'severity': 'high'})
            recommendations.append(f'Add SEO titles to {missing_seo_title} products to improve search result click-through rates.')
        if missing_seo_desc > 0:
            issues.append({'type': 'products', 'issue': 'Missing Meta Description', 'count': missing_seo_desc, 'severity': 'high'})
        if missing_image > 0:
            issues.append({'type': 'products', 'issue': 'Missing Product Image', 'count': missing_image, 'severity': 'medium'})
        if missing_alt > 0:
            issues.append({'type': 'products', 'issue': 'Missing Image Alt Text', 'count': missing_alt, 'severity': 'medium'})
        if missing_keywords > 0:
            issues.append({'type': 'products', 'issue': 'Missing Keywords', 'count': missing_keywords, 'severity': 'low'})
        if missing_short_desc > 0:
            issues.append({'type': 'products', 'issue': 'Missing Short Description', 'count': missing_short_desc, 'severity': 'medium'})
        if dup_titles.exists():
            issues.append({'type': 'products', 'issue': 'Duplicate SEO Titles', 'count': dup_titles.count(), 'severity': 'high'})
        if dup_descs.exists():
            issues.append({'type': 'products', 'issue': 'Duplicate Meta Descriptions', 'count': dup_descs.count(), 'severity': 'medium'})
        if posts_missing_seo_title > 0:
            issues.append({'type': 'blog', 'issue': 'Missing Blog SEO Title', 'count': posts_missing_seo_title, 'severity': 'high'})
        if posts_missing_image > 0:
            issues.append({'type': 'blog', 'issue': 'Missing Blog Featured Image', 'count': posts_missing_image, 'severity': 'medium'})
        if posts_missing_summary > 0:
            issues.append({'type': 'blog', 'issue': 'Missing Blog Summary', 'count': posts_missing_summary, 'severity': 'medium'})

        seo_score = max(0, 100 - (len(issues) * 6))

        return Response({
            'summary': {
                'seo_score': seo_score,
                'total_products': product_count,
                'total_posts': post_count,
                'total_indexed_pages': total_indexed,
                'total_issues': len(issues),
                'sitemap_url': sitemap_url,
                'sitemap_status': 'active',
            },
            'issues': issues,
            'recommendations': recommendations,
            'product_audit': {
                'missing_seo_title': missing_seo_title,
                'missing_seo_description': missing_seo_desc,
                'missing_image': missing_image,
                'missing_alt_text': missing_alt,
                'missing_keywords': missing_keywords,
                'missing_short_description': missing_short_desc,
                'duplicate_titles': dup_titles.count(),
                'duplicate_descriptions': dup_descs.count(),
            },
            'blog_audit': {
                'missing_seo_title': posts_missing_seo_title,
                'missing_seo_description': posts_missing_seo_desc,
                'missing_image': posts_missing_image,
                'missing_summary': posts_missing_summary,
            },
        })
