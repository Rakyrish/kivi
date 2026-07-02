'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, MessageSquare, Bookmark, FlaskConical } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { Product } from '@/types'
import { api } from '@/lib/api'

interface ProductCardProps {
  product: Product
  view?: 'grid' | 'table'
}

export default function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedList = JSON.parse(localStorage.getItem('kivi-saved') || '[]')
      if (savedList.includes(product.slug)) {
        setIsSaved(true)
      } else {
        // Also check if logged in and check saved list from DB if possible
        const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/)
        if (match?.[1]) {
          api.getSavedProducts()
            .then((res: any[]) => {
              const hasIt = res.some((item) => item.product_details?.slug === product.slug)
              if (hasIt) setIsSaved(true)
            })
            .catch(() => {})
        }
      }
    }
  }, [product.slug])

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/)
    const isLoggedIn = Boolean(match?.[1])

    if (isLoggedIn) {
      try {
        const res = await api.toggleSavedProduct(product.slug)
        setIsSaved(res.saved)
        // sync with local storage too
        const savedList = JSON.parse(localStorage.getItem('kivi-saved') || '[]')
        let nextList
        if (res.saved) {
          nextList = [...new Set([...savedList, product.slug])]
        } else {
          nextList = savedList.filter((s: string) => s !== product.slug)
        }
        localStorage.setItem('kivi-saved', JSON.stringify(nextList))
      } catch (err) {
        toggleLocalSave()
      }
    } else {
      toggleLocalSave()
    }
  }

  const toggleLocalSave = () => {
    const savedList = JSON.parse(localStorage.getItem('kivi-saved') || '[]')
    let nextList
    if (savedList.includes(product.slug)) {
      nextList = savedList.filter((s: string) => s !== product.slug)
      setIsSaved(false)
    } else {
      nextList = [...savedList, product.slug]
      setIsSaved(true)
    }
    localStorage.setItem('kivi-saved', JSON.stringify(nextList))
  }

  if (view === 'table') {
    return (
      <tr
        className="border-b transition-colors"
        style={{ borderColor: 'var(--border-table)' }}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] border flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--kivi-cyan-muted)', borderColor: 'var(--border-card)' }}>
              {product.image ? (
                <Image src={product.image} alt={product.name} width={36} height={36} className="object-cover rounded-[2px]" />
              ) : (
                <FlaskConical size={16} style={{ color: 'var(--kivi-cyan)' }} />
              )}
            </div>
            <div>
              <Link href={`${ROUTES.products}/${product.slug}`} className="font-bold text-sm hover:text-[var(--kivi-cyan)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                {product.name}
              </Link>
              {product.category_name && (
                <div className="text-[10px] uppercase font-bold" style={{ color: 'var(--kivi-cyan)' }}>{product.category_name}</div>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="font-mono text-xs" style={{ color: 'var(--kivi-cyan)' }}>{product.chemical_formula || '—'}</span>
        </td>
        <td className="px-4 py-3">
          <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{product.cas_number || '—'}</span>
        </td>
        <td className="px-4 py-3">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{product.grade || '—'}</span>
        </td>
        <td className="px-4 py-3">
          <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-[2px] ${product.in_stock ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
            {product.in_stock ? 'Available' : 'Confirm'}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href={`${ROUTES.products}/${product.slug}`} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-[2px] border transition-all" style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-input)' }}>
              View
            </Link>
            <Link href={`${ROUTES.contact}?product=${product.slug}`} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-[2px] transition-all" style={{ background: 'var(--kivi-cyan)', color: '#002040' }}>
              Quote
            </Link>
            <button
              onClick={handleSave}
              className="p-1.5 rounded-[2px] border transition-all"
              style={{
                borderColor: 'var(--border-input)',
                color: isSaved ? 'var(--kivi-cyan)' : 'var(--text-secondary)',
                background: 'var(--bg-input)'
              }}
              title={isSaved ? "Saved to favorites" : "Save product"}
            >
              <Bookmark size={13} fill={isSaved ? "var(--kivi-cyan)" : "none"} />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div
      className="group border rounded-[4px] overflow-hidden flex flex-col h-full transition-all duration-300"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-card)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Product Image */}
      <div className="relative aspect-video w-full overflow-hidden" style={{ background: 'var(--bg-card-alt)' }}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.alt_text || product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FlaskConical size={40} style={{ color: 'var(--kivi-cyan)', opacity: 0.25 }} />
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-[2px] backdrop-blur-md transition-all duration-200 z-10"
          style={{
            background: 'rgba(0,32,64,0.4)',
            border: '1px solid rgba(0,160,192,0.2)',
            color: isSaved ? 'var(--kivi-cyan)' : 'var(--kivi-white)',
          }}
          title={isSaved ? "Saved to favorites" : "Save product"}
        >
          <Bookmark size={14} fill={isSaved ? "var(--kivi-cyan)" : "none"} />
        </button>

        {/* Tags */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between">
          {product.is_featured && (
            <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-[2px]" style={{ background: 'var(--kivi-cyan)', color: '#002040' }}>
              Featured
            </span>
          )}
          {!product.in_stock && (
            <span className="ml-auto text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-[2px] badge-out-of-stock">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Quote overlay on hover */}
        <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }}>
          <Link
            href={`${ROUTES.contact}?product=${product.slug}`}
            className="w-full mx-2.5 mb-2.5 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-[2px] transition-all"
            style={{ background: 'var(--kivi-cyan)', color: '#002040' }}
          >
            <MessageSquare size={12} /> Quick Quote
          </Link>
        </div>
      </div>


      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category & Formula */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--kivi-cyan)' }}>
            {product.category_name || 'Chemicals'}
          </span>
          {product.chemical_formula && (
            <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-[2px] border" style={{ color: 'var(--kivi-cyan)', background: 'var(--kivi-cyan-muted)', borderColor: 'rgba(0,160,192,0.25)' }}>
              {product.chemical_formula}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-display font-bold text-sm mb-1.5 line-clamp-1 group-hover:text-[var(--kivi-cyan)] transition-colors" style={{ color: 'var(--text-primary)' }}>
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs line-clamp-2 mb-4 leading-relaxed flex-grow" style={{ color: 'var(--text-secondary)' }}>
          {product.short_description}
        </p>

        {/* Stock & CAS */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className={`rounded-[2px] px-2 py-1 text-[9px] uppercase tracking-wider font-bold ${product.in_stock ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
            {product.in_stock ? 'Available' : 'Confirm Supply'}
          </span>
          {product.cas_number && (
            <span className="cas-number truncate">{product.cas_number}</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link
            href={`${ROUTES.products}/${product.slug}`}
            className="inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] border transition-all duration-300"
            style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-input)', background: 'transparent' }}
          >
            Details <ArrowUpRight size={13} />
          </Link>
          <Link
            href={`${ROUTES.contact}?product=${product.slug}`}
            className="inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-all duration-300"
            style={{ background: 'var(--kivi-cyan)', color: '#002040' }}
          >
            Quote <MessageSquare size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}
