'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Product, Category } from '@/types'
import ProductCard from './ProductCard'
import SearchBar from './SearchBar'

interface FeaturedProductsDesktopProps {
  groups: { category: Category; products: Product[] }[]
}

// Desktop-only (rendered inside a `hidden lg:block` wrapper by the parent):
// a vertical category tab list on the left, hovering a tab swaps the product
// panel on the right to that category's first 2 rows (8 items @ 4 cols). The
// search box filters within the active category's already-loaded products
// (name/formula/CAS) — it's a homepage teaser, not a full catalogue search,
// so it only searches what's already on screen rather than hitting the API.
export default function FeaturedProductsDesktop({ groups }: FeaturedProductsDesktopProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [query, setQuery] = useState('')
  const active = groups[activeIndex]

  const selectCategory = (i: number) => {
    setActiveIndex(i)
    setQuery('')
  }

  const filteredProducts = useMemo(() => {
    if (!active) return []
    const term = query.trim().toLowerCase()
    if (!term) return active.products.slice(0, 8)
    return active.products
      .filter((p) =>
        [p.name, p.chemical_formula, p.cas_number].some((v) => v?.toLowerCase().includes(term))
      )
      .slice(0, 8)
  }, [active, query])

  if (!active) return null

  return (
    <div className="flex gap-8 items-start">
      <div
        className="w-64 flex-shrink-0 rounded-[4px] border overflow-hidden"
        style={{ borderColor: 'var(--border-card)' }}
      >
        {groups.map(({ category }, i) => (
          <button
            key={category.id}
            type="button"
            onMouseEnter={() => selectCategory(i)}
            onFocus={() => selectCategory(i)}
            className="w-full text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wide transition-colors border-b last:border-b-0 flex items-center justify-between gap-2"
            style={{
              background: i === activeIndex ? 'var(--kivi-cyan-muted)' : 'var(--bg-page)',
              color: i === activeIndex ? 'var(--kivi-cyan)' : 'var(--text-heading)',
              borderColor: 'var(--border-card)',
            }}
          >
            <span className="truncate">{category.name}</span>
            <ArrowRight size={13} className="flex-shrink-0" style={{ opacity: i === activeIndex ? 1 : 0 }} />
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="font-display font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>
            {active.category.name}
          </h3>
          <Link
            href={`/products?category=${active.category.slug}`}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
            style={{ color: 'var(--kivi-cyan)' }}
          >
            View All
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mb-5 max-w-sm">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>
            No matching products in {active.category.name}.
          </p>
        )}
      </div>
    </div>
  )
}
