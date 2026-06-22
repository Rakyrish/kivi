from django.http import HttpResponse
from django.views import View
from django.conf import settings
from apps.products.models import Product, Category
from apps.blog.models import BlogPost


class SitemapView(View):
    def get(self, request):
        base = getattr(settings, 'SITE_URL', 'https://kivichemicals.com')
        products = Product.objects.filter(is_active=True).values('slug', 'updated_at')
        categories = Category.objects.filter(is_active=True).values('slug')
        posts = BlogPost.objects.filter(is_published=True).values('slug', 'updated_at')

        lines = ['<?xml version="1.0" encoding="UTF-8"?>',
                 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']

        # Static pages
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

        for c in categories:
            lines += [f'<url><loc>{base}/categories/{c["slug"]}</loc>'
                      f'<changefreq>weekly</changefreq><priority>0.75</priority></url>']

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
Disallow: /django-admin/
Disallow: /api/
Disallow: /_next/

Sitemap: {base}/sitemap.xml
"""
        return HttpResponse(content, content_type='text/plain')
