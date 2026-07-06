'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, LayoutList, SlidersHorizontal, X } from 'lucide-react'
import { Product, Category } from '@/types'
import SearchBar from '@/components/site/SearchBar'
import CategoryFilter from '@/components/site/CategoryFilter'
import ProductGrid from '@/components/site/ProductGrid'
import ProductCard from '@/components/site/ProductCard'

const CHEMICAL_TYPES = ['All Types', 'Acid', 'Base / Alkali', 'Salt', 'Solvent', 'Oxidizer', 'Surfactant', 'Polymer', 'Reagent', 'Specialty']
const INDUSTRIES_FILTER = ['All Industries', 'Water Treatment', 'Manufacturing', 'Agriculture', 'Food Processing', 'Mining', 'Construction', 'Hospitality', 'Laboratories']
const PAGE_SIZE = 24

interface CatalogueClientProps {
  initialProducts: Product[]
  categories: Category[]
  initialCategory?: string
  initialSearch?: string
}

export default function CatalogueClient({ initialProducts, categories, initialCategory = '', initialSearch = '' }: CatalogueClientProps) {
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [availability, setAvailability] = useState('all')
  const [chemType, setChemType] = useState('All Types')
  const [industry, setIndustry] = useState('All Industries')
  const [sort, setSort] = useState('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesCategory = category === '' || product.category_slug === category
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'in-stock' && product.in_stock) ||
        (availability === 'confirm' && !product.in_stock)
      const matchesSearch =
        search === '' ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.chemical_formula || '').toLowerCase().includes(search.toLowerCase()) ||
        (product.cas_number || '').toLowerCase().includes(search.toLowerCase()) ||
        (product.short_description || '').toLowerCase().includes(search.toLowerCase()) ||
        (product.category_name || '').toLowerCase().includes(search.toLowerCase())
      const matchesChemType =
        chemType === 'All Types' ||
        (product.grade || '').toLowerCase().includes(chemType.toLowerCase()) ||
        (product.name || '').toLowerCase().includes(chemType.toLowerCase())
      const matchesIndustry =
        industry === 'All Industries' ||
        (Array.isArray(product.applications) && product.applications.some((a: string) =>
          a.toLowerCase().includes(industry.toLowerCase())
        ))
      return matchesCategory && matchesAvailability && matchesSearch && matchesChemType && matchesIndustry
    })
  }, [initialProducts, category, availability, search, chemType, industry])

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sort === 'az') return a.name.localeCompare(b.name)
      if (sort === 'za') return b.name.localeCompare(a.name)
      if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === 'most-viewed') return (b.view_count || 0) - (a.view_count || 0)
      const aFeat = a.is_featured ? 1 : 0
      const bFeat = b.is_featured ? 1 : 0
      if (bFeat !== aFeat) return bFeat - aFeat
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [filteredProducts, sort])

  const totalItems = sortedProducts.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + PAGE_SIZE)

  const resetFilters = () => {
    setSearch(''); setCategory(''); setAvailability('all')
    setChemType('All Types'); setIndustry('All Industries'); setSort('featured')
    setCurrentPage(1)
  }

  const hasActiveFilters = category !== '' || availability !== 'all' || chemType !== 'All Types' || industry !== 'All Industries' || search !== ''

  const SelectFilter = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => { onChange(e.target.value); setCurrentPage(1) }}
        className="theme-input px-3 py-2 text-xs focus:outline-none rounded-[2px]"
        style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-input)', minWidth: '130px' }}
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* ── Category Sidebar ── */}
      <div className="md:col-span-1 space-y-5">
        <CategoryFilter
          categories={categories}
          selectedCategory={category}
          onSelectCategory={(slug) => { setCategory(slug); setCurrentPage(1) }}
        />
      </div>

      {/* ── Main Listing ── */}
      <div className="md:col-span-3 space-y-5">
        {/* Search + Controls bar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setCurrentPage(1) }} />

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Filter toggle mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase rounded-[2px] border transition-all"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-input)', background: 'var(--bg-input)' }}
              >
                <SlidersHorizontal size={13} /> Filters
              </button>

              {/* View mode toggle */}
              <div className="flex border rounded-[2px] overflow-hidden" style={{ borderColor: 'var(--border-input)' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className="p-2 transition-colors"
                  style={{ background: viewMode === 'grid' ? 'var(--kivi-cyan)' : 'var(--bg-input)', color: viewMode === 'grid' ? '#002040' : 'var(--text-secondary)' }}
                  title="Grid view"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className="p-2 transition-colors"
                  style={{ background: viewMode === 'table' ? 'var(--kivi-cyan)' : 'var(--bg-input)', color: viewMode === 'table' ? '#002040' : 'var(--text-secondary)' }}
                  title="Table / specifications view"
                >
                  <LayoutList size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters (desktop always visible, mobile toggle) */}
          <div className={`flex flex-wrap gap-3 items-end ${showFilters ? 'flex' : 'hidden sm:flex'}`}>
            <SelectFilter label="Availability" value={availability} onChange={setAvailability}
              options={['all', 'in-stock', 'confirm']} />
            <SelectFilter label="Chemical Type" value={chemType} onChange={setChemType}
              options={CHEMICAL_TYPES} />
            <SelectFilter label="Industry" value={industry} onChange={setIndustry}
              options={INDUSTRIES_FILTER} />
            <SelectFilter label="Sort By" value={sort} onChange={setSort}
              options={[
                { label: 'Featured First', value: 'featured' },
                { label: 'Name A–Z', value: 'az' },
                { label: 'Name Z–A', value: 'za' },
                { label: 'Newest Added', value: 'newest' },
                { label: 'Most Viewed', value: 'most-viewed' },
              ].map(o => o.value)} />

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase rounded-[2px] border transition-all"
                style={{ color: 'var(--kivi-error)', borderColor: 'var(--kivi-error)', background: 'var(--kivi-error-bg)' }}
              >
                <X size={12} /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Count indicator */}
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {paginatedProducts.length > 0 ? (
              <>Showing {startIndex + 1}–{Math.min(startIndex + paginatedProducts.length, totalItems)} of {totalItems} product{totalItems === 1 ? '' : 's'}</>
            ) : (
              <>No products match the current filters</>
            )}
          </div>
        </div>

        {/* Product Grid or Table */}
        {paginatedProducts.length === 0 ? (
          <div className="py-16 text-center border rounded-[4px]" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No products match your filters.</p>
            <button onClick={resetFilters} className="mt-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--kivi-cyan)' }}>
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="border rounded-[4px] overflow-hidden" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-table)' }}>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Product</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Formula</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>CAS Number</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Grade</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Stock</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} view="table" />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <ProductGrid products={paginatedProducts} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-xs font-bold uppercase rounded-[2px] border transition-all disabled:opacity-40"
              style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-input)', background: 'var(--bg-input)' }}
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page = i + 1
                if (totalPages > 7) {
                  if (currentPage <= 4) page = i + 1
                  else if (currentPage >= totalPages - 3) page = totalPages - 6 + i
                  else page = currentPage - 3 + i
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 flex items-center justify-center text-xs font-mono rounded-[2px] transition-all border"
                    style={{
                      background: currentPage === page ? 'var(--kivi-cyan)' : 'var(--bg-input)',
                      color: currentPage === page ? '#002040' : 'var(--text-secondary)',
                      borderColor: currentPage === page ? 'var(--kivi-cyan)' : 'var(--border-input)',
                    }}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-xs font-bold uppercase rounded-[2px] border transition-all disabled:opacity-40"
              style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-input)', background: 'var(--bg-input)' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
