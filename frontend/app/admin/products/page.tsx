import Link from 'next/link'
import { Plus, Pencil, CheckCircle, XCircle, Star } from 'lucide-react'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
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

      {/* Products Table */}
      <div className="border rounded-[4px] overflow-hidden shadow-lg" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" style={{ color: 'var(--text-secondary)' }}>
            <thead>
              <tr className="font-display uppercase tracking-wider text-[10px]" style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-divider)', color: 'var(--kivi-cyan)' }}>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3">Formula</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3 text-center">Active</th>
                <th className="px-5 py-3 text-center">Featured</th>
                <th className="px-5 py-3 text-center">In Stock</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    No products yet. Click &ldquo;Add Product&rdquo; to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b transition-colors" style={{ borderColor: 'var(--border-table)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-table-row-alt)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="px-5 py-3 font-bold max-w-xs truncate" style={{ color: 'var(--text-primary)' }}>
                      {product.name}
                    </td>
                    <td className="px-5 py-3 font-mono" style={{ color: 'var(--kivi-cyan)' }}>{product.chemical_formula || '—'}</td>
                    <td className="px-5 py-3">{product.category_name || '—'}</td>
                    <td className="px-5 py-3">{product.grade || '—'}</td>
                    <td className="px-5 py-3 text-center">
                      {product.is_active
                        ? <CheckCircle size={14} className="text-emerald-400 inline" />
                        : <XCircle size={14} className="text-red-400 inline" />}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {product.is_featured
                        ? <Star size={14} className="text-yellow-400 inline" />
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {product.in_stock
                        ? <CheckCircle size={14} className="text-emerald-400 inline" />
                        : <XCircle size={14} className="text-red-400 inline" />}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={ROUTES.admin.productEdit(product.slug)}
                          className="transition-colors"
                          style={{ color: 'var(--kivi-cyan)' }}
                          title="Edit product"
                        >
                          <Pencil size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

