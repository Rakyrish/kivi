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
    } catch {
      setNotice({ kind: 'err', text: 'Bulk regeneration failed to queue. Is the Celery worker running?' })
    } finally {
      setBulkBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => regenerateBulk(false)}
            disabled={bulkBusy || selected.size === 0}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-all disabled:opacity-40"
            style={{ background: 'var(--kivi-cyan-muted)', color: 'var(--kivi-cyan)', border: '1px solid var(--kivi-cyan)' }}
          >
            <Sparkles size={13} />
            <span>Regen Selected ({selected.size})</span>
          </button>
          <button
            onClick={() => regenerateBulk(true)}
            disabled={bulkBusy || products.length === 0}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-all disabled:opacity-40"
            style={{ background: 'var(--bg-card-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}
          >
            <RefreshCw size={13} className={bulkBusy ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Regenerate</span> All
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

      {/* ── Desktop table (hidden on mobile) ── */}
      <div className="hidden md:block border rounded-[4px] overflow-hidden shadow-lg" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
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
                <th className="px-3 py-3 w-12">Img</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Formula</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3 text-center">Active</th>
                <th className="px-4 py-3 text-center">Featured</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
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
                        className="w-9 h-9 rounded-[2px] border flex-shrink-0 flex items-center justify-center overflow-hidden"
                        style={{ background: 'var(--kivi-cyan-muted)', borderColor: 'var(--border-card)' }}
                      >
                        {product.image ? (
                          <Image src={product.image} alt={product.name} width={36} height={36} className="object-cover w-full h-full" />
                        ) : (
                          <FlaskConical size={14} style={{ color: 'var(--kivi-cyan)' }} />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold max-w-[180px] truncate" style={{ color: 'var(--text-primary)' }}>
                      {product.name}
                    </td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--kivi-cyan)' }}>{product.chemical_formula || '—'}</td>
                    <td className="px-4 py-3">{product.category_name || '—'}</td>
                    <td className="px-4 py-3">{product.grade || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {product.is_active
                        ? <CheckCircle size={14} className="text-emerald-400 inline" />
                        : <XCircle size={14} className="text-red-400 inline" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {product.is_featured
                        ? <Star size={14} className="text-yellow-400 inline" />
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {product.in_stock
                        ? <CheckCircle size={14} className="text-emerald-400 inline" />
                        : <XCircle size={14} className="text-red-400 inline" />}
                    </td>
                    <td className="px-4 py-3 text-right">
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

      {/* ── Mobile card list (shown only on mobile) ── */}
      <div className="md:hidden space-y-3">
        {products.length === 0 ? (
          <div className="p-8 text-center text-xs rounded-[4px] border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)', color: 'var(--text-muted)' }}>
            No products yet. Tap &ldquo;Add Product&rdquo; to get started.
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="rounded-[4px] border p-3 flex items-start gap-3"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.has(product.slug)}
                onChange={() => toggle(product.slug)}
                aria-label={`Select ${product.name}`}
                className="mt-1"
              />

              {/* Product image */}
              <div
                className="w-12 h-12 rounded-[2px] border flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ background: 'var(--kivi-cyan-muted)', borderColor: 'var(--border-card)' }}
              >
                {product.image ? (
                  <Image src={product.image} alt={product.name} width={48} height={48} className="object-cover w-full h-full" />
                ) : (
                  <FlaskConical size={18} style={{ color: 'var(--kivi-cyan)' }} />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs truncate mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  {product.name}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {product.chemical_formula && (
                    <span className="font-mono" style={{ color: 'var(--kivi-cyan)' }}>{product.chemical_formula}</span>
                  )}
                  {product.category_name && <span>{product.category_name}</span>}
                  {product.grade && <span>{product.grade}</span>}
                </div>
                {/* Status badges */}
                <div className="flex items-center gap-2 mt-1.5">
                  {product.is_active
                    ? <span className="badge-in-stock text-[9px] px-1.5 py-0.5 rounded font-bold">Active</span>
                    : <span className="badge-out-of-stock text-[9px] px-1.5 py-0.5 rounded font-bold">Inactive</span>}
                  {product.in_stock
                    ? <span className="badge-in-stock text-[9px] px-1.5 py-0.5 rounded font-bold">In Stock</span>
                    : <span className="badge-out-of-stock text-[9px] px-1.5 py-0.5 rounded font-bold">Out of Stock</span>}
                  {product.is_featured && (
                    <Star size={11} className="text-yellow-400" />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  onClick={() => regenerateOne(product.slug)}
                  disabled={busySlug === product.slug}
                  className="p-1.5 rounded-[2px] transition-colors disabled:opacity-40"
                  style={{ color: 'var(--kivi-cyan)', background: 'var(--kivi-cyan-muted)' }}
                  title="Regenerate AI content"
                >
                  <RefreshCw size={13} className={busySlug === product.slug ? 'animate-spin' : ''} />
                </button>
                <Link
                  href={ROUTES.admin.productEdit(product.slug)}
                  className="p-1.5 rounded-[2px] transition-colors"
                  style={{ color: 'var(--kivi-cyan)', background: 'var(--kivi-cyan-muted)' }}
                  title="Edit product"
                >
                  <Pencil size={13} />
                </Link>
              </div>
            </div>
          ))
        )}

        {/* Mobile select all */}
        {products.length > 0 && (
          <button
            onClick={toggleAll}
            className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-[2px] border w-full text-center"
            style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-card)', background: 'var(--bg-card-alt)' }}
          >
            {selected.size === products.length ? 'Deselect All' : `Select All (${products.length})`}
          </button>
        )}
      </div>
    </div>
  )
}
