import { MetadataRoute } from 'next'
import { SITE } from '@/lib/constants'

// NOTE: In production nginx proxies /robots.txt to the Django backend
// (apps/seo/views.py RobotsView) — keep both in sync.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/django-admin/', '/api/'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
