import { MetadataRoute } from 'next'
import { api } from '@/lib/api'
import { SITE } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url

  let products: any[] = []
  let categories: any[] = []
  let posts: any[] = []

  try {
    const res = await api.getProducts({ page_size: 100 })
    products = res.results || []
  } catch (e) {
    // Fail silently to prevent build failures if backend is down
  }

  try {
    categories = await api.getCategories()
  } catch (e) {}

  try {
    posts = await api.getBlogPosts()
  } catch (e) {}

  const routes = [
    '',
    '/products',
    '/blog',
    '/about',
    '/contact',
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  const productRoutes = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(p.updated_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const categoryRoutes = categories.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  const postRoutes = posts.map((b) => ({
    url: `${base}/blog/${b.slug}`,
    lastModified: new Date(b.updated_at || Date.now()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...routes, ...productRoutes, ...categoryRoutes, ...postRoutes]
}
