import Link from 'next/link'
import { Plus, Pencil, CheckCircle, XCircle, Star } from 'lucide-react'
import { api } from '@/lib/api'
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
          <h1 className="font-display font-black text-2xl text-[#F4F7FA] uppercase tracking-wide">Products</h1>
          <p className="text-xs text-[#606060] mt-1">{products.length} products in catalogue</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] transition-colors text-xs font-bold uppercase tracking-wider rounded-[2px]"
        >
          <Plus size={14} />
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-[#081525] border border-[#00A0C0]/15 rounded-[4px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#94A3B8]">
            <thead>
              <tr className="bg-[#002040]/60 border-b border-[#00A0C0]/15 font-display text-[#00A0C0] uppercase tracking-wider text-[10px]">
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
                  <td colSpan={8} className="px-5 py-12 text-center text-[#606060]">
                    No products yet. Click &ldquo;Add Product&rdquo; to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-[#00A0C0]/5 hover:bg-[#002040]/20 transition-colors">
                    <td className="px-5 py-3 font-bold text-[#F4F7FA] max-w-xs truncate">
                      {product.name}
                    </td>
                    <td className="px-5 py-3 font-mono text-[#00A0C0]">{product.chemical_formula || '—'}</td>
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
                        : <span className="text-[#606060]">—</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {product.in_stock
                        ? <CheckCircle size={14} className="text-emerald-400 inline" />
                        : <XCircle size={14} className="text-red-400 inline" />}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/products/${product.slug}/edit`}
                          className="text-[#00A0C0] hover:text-[#00A0E0] transition-colors"
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
