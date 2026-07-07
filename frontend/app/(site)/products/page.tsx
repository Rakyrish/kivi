import { Metadata } from 'next'
import { api } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import CatalogueClient from './CatalogueClient'
import type { Product, Category } from '@/types'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({
  title: 'Product Catalogue — Industrial Chemicals Kenya',
  description: 'Explore Kivi Chemicals B2B chemical catalog: industrial solvents, water treatment chemicals, acids, salts and specialty additives. Fast delivery across Kenya and East Africa.',
  path: '/products',
})

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  let products: Product[] = []
  let categories: Category[] = []
  const resolvedSearchParams = await searchParams
  const initialCategory = resolvedSearchParams?.category || ''
  const initialSearch = resolvedSearchParams?.search || ''

  try { const res = await api.getProducts({ page_size: 150 }); products = res.results || [] } catch {}
  try { categories = await api.getCategories() } catch {}

  return (
    <div className="min-h-screen py-12" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="overline mb-2">Formulations Catalogue</div>
          <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>
            Industrial Chemicals
          </h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            High-purity specifications, CAS registry numbers, UN hazmat codes, and verified grade standards. Filter by category, availability, or industry to find the exact formulation you need.
          </p>
        </div>

        <CatalogueClient
          initialProducts={products}
          categories={categories}
          initialCategory={initialCategory}
          initialSearch={initialSearch}
        />
      </div>
    </div>
  )
}
