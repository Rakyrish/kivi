'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Pencil, CheckCircle, XCircle, Star, RefreshCw, Sparkles, FlaskConical } from 'lucide-react'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
import type { Product } from '@/types'

export default function ProductsTable({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const toggle = (slug: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(prev =>
      prev.size === products.length ? new Set() : new Set(products.map(p => p.slug))
    )
  }

  const regenerateOne = async (slug: string) => {
    setBusySlug(slug)
    setNotice(null)
    try {
      const res = await api.regenerateProduct(slug)
      setNotice({
        kind: 'ok',
        text: res.status === 'completed'
          ? `Content regenerated for "${slug}" — URL unchanged.`
          : `Regeneration queued for "${slug}" — content updates in the background.`,
      })
    } catch {
      setNotice({ kind: 'err', text: `Regeneration failed for "${slug}". Check the Error Center.` })
    } finally {
      setBusySlug(null)
    }
  }

  const regenerateBulk = async (all: boolean) => {
    const count = all ? products.length : selected.size
    if (count === 0) return
    // Bulk regeneration rewrites live content — make the admin confirm scope.
    const confirmed = window.confirm(
      all
        ? `Regenerate content for ALL ${count} products? URLs, images, and categories are preserved. This runs in the background over ~${Math.ceil(count * 8 / 60)} minutes.`
        : `Regenerate content for ${count} selected product(s)? URLs, images, and categories are preserved.`
    )
    if (!confirmed) return

    setBulkBusy(true)
    setNotice(null)
    try {
      const res = await api.regenerateProductsBulk(all ? { all: true } : { slugs: Array.from(selected) })
      setNotice({
        kind: 'ok',
        text: `${res.count} regeneration task(s) queued — estimated ${res.estimated_minutes} min. Content and SEO update in place; no URL changes.`,
      })
      setSelected(new Set())
    } catch (e) {
      setNotice({ kind: 'err', text: 'Bulk regeneration failed to queue. Is the Celery worker running?' })
    } finally {
      setBulkBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => regenerateBulk(false)}
            disabled={bulkBusy || selected.size === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-all disabled:opacity-40"
            style={{ background: 'var(--kivi-cyan-muted)', color: 'var(--kivi-cyan)', border: '1px solid var(--kivi-cyan)' }}
          >
            <Sparkles size={13} />
            Regenerate Selected ({selected.size})
          </button>
          <button
            onClick={() => regenerateBulk(true)}
            disabled={bulkBusy || products.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-all disabled:opacity-40"
            style={{ background: 'var(--bg-card-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}
          >
            <RefreshCw size={13} className={bulkBusy ? 'animate-spin' : ''} />
            Regenerate All
          </button>
        </div>
        {notice && (
          <p
            className="text-xs font-semibold px-3 py-1.5 rounded"
            style={{
              color: notice.kind === 'ok' ? 'var(--kivi-success)' : 'var(--kivi-error)',
              background: notice.kind === 'ok' ? 'var(--kivi-success-bg)' : 'var(--kivi-error-bg)',
            }}
          >
            {notice.text}
          </p>
        )}
      </div>

      {/* Products Table */}
      <div className="border rounded-[4px] overflow-hidden shadow-lg" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" style={{ color: 'var(--text-secondary)' }}>
            <thead>
              <tr className="font-display uppercase tracking-wider text-[10px]" style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-divider)', color: 'var(--kivi-cyan)' }}>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selected.size === products.length}
                    onChange={toggleAll}
                    aria-label="Select all products"
                  />
                </th>
                <th className="px-3 py-3 w-12">Image</th>
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
                  <td colSpan={9} className="px-5 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    No products yet. Click &ldquo;Add Product&rdquo; to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b transition-colors hover:bg-[var(--bg-table-row-alt)]" style={{ borderColor: 'var(--border-table)' }}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(product.slug)}
                        onChange={() => toggle(product.slug)}
                        aria-label={`Select ${product.name}`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div
                        className="w-10 h-10 rounded-[2px] border flex-shrink-0 flex items-center justify-center overflow-hidden"
                        style={{ background: 'var(--kivi-cyan-muted)', borderColor: 'var(--border-card)' }}
                      >
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <FlaskConical size={16} style={{ color: 'var(--kivi-cyan)' }} />
                        )}
                      </div>
                    </td>
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
                        <button
                          onClick={() => regenerateOne(product.slug)}
                          disabled={busySlug === product.slug}
                          className="transition-colors disabled:opacity-40"
                          style={{ color: 'var(--kivi-cyan)' }}
                          title="Regenerate AI content (URL preserved)"
                        >
                          <RefreshCw size={14} className={busySlug === product.slug ? 'animate-spin' : ''} />
                        </button>
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
