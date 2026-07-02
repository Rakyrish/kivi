'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
import type { BlogPost, Category, Product } from '@/types'

const includesTerm = (values: Array<string | undefined>, term: string) => {
  return values.some((value) => value ? value.toLowerCase().includes(term) : false)
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    Promise.allSettled([
      api.getProducts({ page_size: 80 }),
      api.getCategories(),
      api.getBlogPosts(),
    ]).then(([productResult, categoryResult, postResult]) => {
      if (!isMounted) return
      if (productResult.status === 'fulfilled') setProducts(productResult.value.results || [])
      if (categoryResult.status === 'fulfilled') setCategories(categoryResult.value || [])
      if (postResult.status === 'fulfilled') setPosts(postResult.value || [])
    })

    return () => {
      isMounted = false
    }
  }, [])

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term.length < 2) return { products: [], categories: [], posts: [] }

    return {
      products: products.filter((product) =>
        includesTerm([product.name, product.chemical_formula, product.cas_number, product.short_description], term)
      ).slice(0, 4),
      categories: categories.filter((category) =>
        includesTerm([category.name, category.description], term)
      ).slice(0, 3),
      posts: posts.filter((post) =>
        includesTerm([post.title, post.summary, post.keywords], term)
      ).slice(0, 3),
    }
  }, [categories, posts, products, query])

  const hasResults = results.products.length + results.categories.length + results.posts.length > 0

  return (
    <div className="relative hidden lg:block w-72">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00A0C0]" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search chemicals, CAS, insights"
          className="nav-surface w-full rounded-kivi-sm border border-[#00A0C0]/20 bg-[#081525] py-2.5 pl-9 pr-9 text-xs text-[#F4F7FA] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#00A0C0]"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#00A0C0]"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute right-0 top-12 z-50 w-[28rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-kivi border border-[#00A0C0]/25 bg-[#081525] shadow-2xl">
          <div className="max-h-96 overflow-y-auto p-3">
            {!hasResults && (
              <p className="px-3 py-4 text-xs text-[#94A3B8]">No matching products, categories, or insights.</p>
            )}

            {results.products.length > 0 && (
              <SearchGroup title="Products">
                {results.products.map((product) => (
                  <SearchLink
                    key={product.id}
                    href={`${ROUTES.products}/${product.slug}`}
                    label={product.name}
                    meta={product.chemical_formula || product.category_name || 'Product'}
                    onClick={() => setIsOpen(false)}
                  />
                ))}
              </SearchGroup>
            )}

            {results.categories.length > 0 && (
              <SearchGroup title="Categories">
                {results.categories.map((category) => (
                  <SearchLink
                    key={category.id}
                    href={`${ROUTES.products}?category=${category.slug}`}
                    label={category.name}
                    meta={`${category.product_count || 0} products`}
                    onClick={() => setIsOpen(false)}
                  />
                ))}
              </SearchGroup>
            )}

            {results.posts.length > 0 && (
              <SearchGroup title="Kivi Insights">
                {results.posts.map((post) => (
                  <SearchLink
                    key={post.id}
                    href={`${ROUTES.blog}/${post.slug}`}
                    label={post.title}
                    meta={new Date(post.created_at).toLocaleDateString('en-KE')}
                    onClick={() => setIsOpen(false)}
                  />
                ))}
              </SearchGroup>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SearchGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <div className="px-3 pb-1 text-[9px] uppercase tracking-widest text-[#00A0C0]">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function SearchLink({
  href,
  label,
  meta,
  onClick,
}: {
  href: string
  label: string
  meta: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-kivi-sm px-3 py-2 text-xs text-[#F4F7FA] transition-colors hover:bg-[#00A0C0]/10"
    >
      <span className="block truncate">{label}</span>
      <span className="font-mono text-[10px] text-[#94A3B8]">{meta}</span>
    </Link>
  )
}
