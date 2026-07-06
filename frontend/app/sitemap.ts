import { MetadataRoute } from 'next'
import { api } from '@/lib/api'
import { SITE } from '@/lib/constants'
import type { Product, BlogPost } from '@/types'

async function getAllProducts(): Promise<Product[]> {
  const all: Product[] = []
  let page = 1
  // Follow pagination so the sitemap never silently truncates the catalogue
  while (page <= 20) {
    try {
      const res = await api.getProducts({ page, page_size: 100 })
      const results = res.results || []
      all.push(...results)
      if (all.length >= (res.count || 0) || results.length === 0) break
      page += 1
    } catch {
      break
    }
  }
  return all
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url

  const products = await getAllProducts()

  let posts: BlogPost[] = []
  try {
    posts = (await api.getBlogPosts()).filter((p) => p.is_published !== false)
  } catch {}

  const routes: MetadataRoute.Sitemap = [
    { url: `${base}`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.7 },
  ]

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  const postRoutes: MetadataRoute.Sitemap = posts.map((b) => ({
    url: `${base}/blog/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...routes, ...productRoutes, ...postRoutes]
}
