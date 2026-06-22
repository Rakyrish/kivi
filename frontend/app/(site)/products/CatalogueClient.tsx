'use client'

import { useState } from 'react'
import { Product, Category } from '@/types'
import SearchBar from '@/components/site/SearchBar'
import CategoryFilter from '@/components/site/CategoryFilter'
import ProductGrid from '@/components/site/ProductGrid'

interface CatalogueClientProps {
  initialProducts: Product[]
  categories: Category[]
  initialCategory?: string
}

export default function CatalogueClient({
  initialProducts,
  categories,
  initialCategory = '',
}: CatalogueClientProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 24

  // Filter logic
  const filteredProducts = initialProducts.filter((product) => {
    const matchesCategory = category === '' || product.category_slug === category
    const matchesSearch =
      search === '' ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.chemical_formula.toLowerCase().includes(search.toLowerCase()) ||
      product.cas_number.toLowerCase().includes(search.toLowerCase()) ||
      product.short_description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'az') {
      return a.name.localeCompare(b.name)
    }
    if (sort === 'za') {
      return b.name.localeCompare(a.name)
    }
    if (sort === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    // 'featured' sorting (featured first, then created date)
    const aFeat = a.is_featured ? 1 : 0
    const bFeat = b.is_featured ? 1 : 0
    if (bFeat !== aFeat) {
      return bFeat - aFeat
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Pagination logic
  const totalItems = sortedProducts.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + PAGE_SIZE)

  const handleCategorySelect = (slug: string) => {
    setCategory(slug)
    setCurrentPage(1)
  }

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Category Sidebar */}
      <div className="md:col-span-1 space-y-6">
        <CategoryFilter
          categories={categories}
          selectedCategory={category}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* Main Listing Area */}
      <div className="md:col-span-3 space-y-6">
        {/* Search and Sort controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <SearchBar value={search} onChange={handleSearchChange} />
          
          {/* Sorting */}
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold text-[#606060] tracking-wider whitespace-nowrap">
              Sort By:
            </span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-[#081525] border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-3 py-2 text-xs focus:outline-none transition-all rounded-[2px] w-full sm:w-auto"
            >
              <option value="featured">Featured First</option>
              <option value="az">Name A-Z</option>
              <option value="za">Name Z-A</option>
              <option value="newest">Newest Added</option>
            </select>
          </div>
        </div>

        {/* Counter */}
        <div className="text-[10px] font-mono text-[#606060]">
          SHOWING {paginatedProducts.length} OF {totalItems} PRODUCT{totalItems === 1 ? '' : 'S'}
        </div>

        {/* Product Grid */}
        <ProductGrid products={paginatedProducts} />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-[#00A0C0]/20 text-[#00A0C0] disabled:text-[#606060] disabled:border-[#00A0C0]/5 text-xs font-bold uppercase rounded-[2px] transition-colors"
            >
              Previous
            </button>
            <span className="font-mono text-xs text-[#606060] px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-[#00A0C0]/20 text-[#00A0C0] disabled:text-[#606060] disabled:border-[#00A0C0]/5 text-xs font-bold uppercase rounded-[2px] transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
