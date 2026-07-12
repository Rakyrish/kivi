import Link from 'next/link'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
import ProductsTable from '@/components/admin/ProductsTable'
import AdminPagination from '@/components/admin/AdminPagination'
import type { Product } from '@/types'

const PAGE_SIZE = 25

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  let products: Product[] = []
  let count = 0
  let error: string | null = null

  const resolvedSearchParams = await searchParams
  const page = Math.max(1, parseInt(resolvedSearchParams?.page || '1', 10) || 1)

  try {
    const res = await api.getProducts({ page, page_size: PAGE_SIZE }, { forwardAuth: true })
    products = res.results || []
    count = res.count || 0
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load products'
    console.error('AdminProductsPage: failed to load products', err)
  }

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Products</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{count} products in catalogue</p>
        </div>
        <Link
          href={ROUTES.admin.productNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 transition-colors text-xs font-bold uppercase tracking-wider rounded-[2px]"
          style={{ background: 'var(--kivi-cyan)', color: '#002040' }}
        >
          <Plus size={14} />
          Add Product
        </Link>
      </div>

      {error && (
        <div className="px-4 py-3 text-xs rounded-[2px]" style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>
          Could not load products: {error}
        </div>
      )}

      <ProductsTable products={products} />

      <AdminPagination currentPage={page} totalPages={totalPages} basePath={ROUTES.admin.products} />
    </div>
  )
}
