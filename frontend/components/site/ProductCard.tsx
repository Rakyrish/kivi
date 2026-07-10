'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, Bookmark, FlaskConical } from 'lucide-react'
import { ROUTES, SITE } from '@/lib/constants'
import { Product } from '@/types'
import { api } from '@/lib/api'

interface ProductCardProps {
  product: Product
  view?: 'grid' | 'table'
}

// Builds a pre-filled WhatsApp enquiry link containing the product name, key specs,
// and the full product page URL. Falls back to the in-site contact form when no
// WhatsApp number is configured.
function buildEnquiryHref(product: Product): { href: string; isWhatsApp: boolean } {
  const digits = SITE.whatsapp.replace(/\D/g, '')
  const productUrl = `${SITE.url}${ROUTES.products}/${product.slug}`

  if (!digits) {
    return { href: `${ROUTES.contact}?product=${product.slug}`, isWhatsApp: false }
  }

  const message = [
    'Hello Kivi Chemicals, I would like to enquire about a product.',
    '',
    `Product: ${product.name}`,
    product.chemical_formula ? `Formula: ${product.chemical_formula}` : '',
    product.cas_number ? `CAS: ${product.cas_number}` : '',
    product.grade ? `Grade: ${product.grade}` : '',
    '',
    `Link: ${productUrl}`,
  ].filter(Boolean).join('\n')

  return { href: `https://wa.me/${digits}?text=${encodeURIComponent(message)}`, isWhatsApp: true }
}

export default function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const enquiry = buildEnquiryHref(product)
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
            .catch(() => { })
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
            {enquiry.isWhatsApp ? (
              <a
                href={enquiry.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-[2px] transition-all hover:brightness-110"
                style={{ background: 'var(--kivi-success)', color: 'var(--kivi-white)' }}
              >
                WhatsApp
              </a>
            ) : (
              <Link href={enquiry.href} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-[2px] transition-all" style={{ background: 'var(--kivi-cyan)', color: '#002040' }}>
                Quote
              </Link>
            )}
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
    <div className="group relative theme-card rounded-[4px] overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1">
      {/* Product image — full picture, never cropped */}
      <div className="relative aspect-square w-full overflow-hidden" style={{ background: 'var(--bg-card-alt)' }}>
        <div className="absolute inset-3 sm:inset-4">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.alt_text || product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-contain group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FlaskConical size={48} style={{ color: 'var(--kivi-cyan)', opacity: 0.25 }} />
            </div>
          )}
        </div>

        {/* Status tags */}
        {/* {(product.is_featured || !product.in_stock) && (
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">

            {!product.in_stock && (
              <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-[2px] badge-out-of-stock">
                Out of Stock
              </span>
            )}
          </div>
        )} */}

        {/* Save / favourites */}
        <button
          onClick={handleSave}
          className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-[2px] backdrop-blur-md transition-all duration-200"
          style={{
            background: 'rgba(0,32,64,0.4)',
            border: '1px solid rgba(0,160,192,0.2)',
            color: isSaved ? 'var(--kivi-cyan)' : 'var(--kivi-white)',
          }}
          title={isSaved ? 'Saved to favorites' : 'Save product'}
          aria-label={isSaved ? 'Remove from saved' : 'Save product'}
          aria-pressed={isSaved}
        >
          <Bookmark size={14} fill={isSaved ? 'var(--kivi-cyan)' : 'none'} />
        </button>
      </div>

      {/* Card body */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
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
        <h3 className="font-display font-bold text-sm mb-1.5 line-clamp-2 group-hover:text-[var(--kivi-cyan)] transition-colors" style={{ color: 'var(--text-primary)' }}>
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs line-clamp-2 mb-3 leading-relaxed flex-grow" style={{ color: 'var(--text-secondary)' }}>
          {product.short_description}
        </p>

        {/* Stock & CAS */}
        {/* <div className="flex items-center justify-between gap-3 mb-3">
          <span className={`rounded-[2px] px-2 py-1 text-[9px] uppercase tracking-wider font-bold ${product.in_stock ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
            {product.in_stock ? 'Available' : 'Available'}
          </span>
          {product.cas_number && (
            <span className="cas-number truncate">{product.cas_number}</span>
          )}
        </div> */}

        {/* WhatsApp enquiry — single, always-visible CTA */}
        {enquiry.isWhatsApp ? (
          <a
            href={enquiry.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-all duration-300 hover:brightness-110"
            style={{ background: 'var(--kivi-success)', color: 'var(--kivi-white)' }}
            title={`Enquire about ${product.name} on WhatsApp`}
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        ) : (
          <Link
            href={enquiry.href}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-all duration-300"
            style={{ background: 'var(--kivi-cyan)', color: '#002040' }}
            title={`Request a quote for ${product.name}`}
          >
            <MessageCircle size={14} /> Get Quote
          </Link>
        )}
      </div>

      {/* Whole-card click → product details */}
      <Link
        href={`${ROUTES.products}/${product.slug}`}
        className="absolute inset-0"
        aria-label={`View ${product.name} details`}
      />
    </div>
  )
}
