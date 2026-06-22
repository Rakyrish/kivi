import { Metadata } from 'next'
import { api } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import CatalogueClient from './CatalogueClient'
import type { Product, Category } from '@/types'

export const revalidate = 3600 // ISR every hour

export const metadata: Metadata = buildMetadata({
  title: 'Product Catalogue',
  description: 'Explore Kivi Chemicals B2B chemical catalog including industrial solvents, water treatment chemicals, and acids. Fast delivery in Kenya.',
  path: '/products',
})

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  let products: Product[] = []
  let categories: Category[] = []

  // Resolve searchParams promise in Next 15
  const resolvedSearchParams = await searchParams
  const initialCategory = resolvedSearchParams?.category || ''

  try {
    const prodRes = await api.getProducts({ page_size: 150 })
    products = prodRes.results || []
  } catch (e) {
    products = []
  }

  try {
    categories = await api.getCategories()
  } catch (e) {
    categories = []
  }

  return (
    <div className="bg-[#F4F7FA] min-h-screen py-16 border-t border-[#00A0C0]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-xl mb-12">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0] mb-2">
            Formulations Catalogue
          </div>
          <h1 className="font-display font-black text-3xl text-[#002040] uppercase tracking-wide">
            Industrial Chemicals
          </h1>
          <p className="text-xs text-[#606060] mt-2">
            High purity specifications, CAS registry index values, and safe transport UN tags.
          </p>
        </div>

        {/* Client side container */}
        <CatalogueClient
          initialProducts={products}
          categories={categories}
          initialCategory={initialCategory}
        />
      </div>
    </div>
  )
}
