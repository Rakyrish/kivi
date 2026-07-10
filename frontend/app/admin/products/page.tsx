import Link from 'next/link'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
import ProductsTable from '@/components/admin/ProductsTable'
import type { Product } from '@/types'

export default async function AdminProductsPage() {
  let products: Product[] = []

  try {
    const res = await api.getProducts({ page_size: 200 })
    products = res.results || []
  } catch (_) {}

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Products</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{products.length} products in catalogue</p>
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

      <ProductsTable products={products} />
    </div>
  )
}
