'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
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
    <div ref={containerRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] border transition-all duration-200"
        style={{ background: 'var(--bg-input)', borderColor: 'var(--border-input)', color: 'var(--kivi-cyan)' }}
        aria-label="Search"
        aria-expanded={isOpen}
      >
        <Search size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[24rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-kivi border border-[var(--border-default)] bg-[var(--bg-dropdown)] shadow-2xl animate-fade-in">
          <div className="relative p-3 border-b" style={{ borderColor: 'var(--border-divider)' }}>
            <Search size={15} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--kivi-cyan)]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chemicals, CAS, insights"
              className="nav-surface w-full rounded-kivi-sm border border-[var(--border-input)] py-2.5 pl-9 pr-9 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none transition-colors focus:border-[var(--kivi-cyan)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--kivi-cyan)]"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {query.trim().length < 2 && (
            <p className="px-6 py-4 text-xs text-[var(--text-secondary)]">Type at least 2 characters to search.</p>
          )}

          {query.trim().length >= 2 && (
          <div className="max-h-96 overflow-y-auto p-3">
            {!hasResults && (
              <p className="px-3 py-4 text-xs text-[var(--text-secondary)]">No matching products, categories, or insights.</p>
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
                    href={`${ROUTES.categories}/${category.slug}`}
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
          )}
        </div>
      )}
    </div>
  )
}

function SearchGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <div className="px-3 pb-1 text-[9px] uppercase tracking-widest text-[var(--kivi-cyan)]">{title}</div>
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
      className="block rounded-kivi-sm px-3 py-2 text-xs text-[var(--text-primary)] transition-colors hover:bg-[var(--kivi-cyan-muted)]"
    >
      <span className="block truncate">{label}</span>
      <span className="font-mono text-[10px] text-[var(--text-secondary)]">{meta}</span>
    </Link>
  )
}
