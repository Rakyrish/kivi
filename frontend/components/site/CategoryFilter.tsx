'use client'

import { Category } from '@/types'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (slug: string) => void
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-xs uppercase tracking-wider border-l-2 border-[#00A0C0] pl-2.5" style={{ color: 'var(--text-heading)' }}>
        Browse Categories
      </h3>
      
      {/* Mobile view flex slider, Desktop view stack */}
      <div className="flex flex-wrap md:flex-col gap-2">
        <button
          onClick={() => onSelectCategory('')}
          className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider transition-all rounded-[2px] border"
          style={{
            background: selectedCategory === '' ? 'var(--kivi-cyan)' : 'var(--bg-card)',
            borderColor: selectedCategory === '' ? 'var(--kivi-cyan)' : 'var(--border-card)',
            color: selectedCategory === '' ? '#002040' : 'var(--text-secondary)',
          }}
        >
          All Products
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.slug)}
            className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider transition-all rounded-[2px] border flex justify-between items-center gap-4"
            style={{
              background: selectedCategory === category.slug ? 'var(--kivi-cyan)' : 'var(--bg-card)',
              borderColor: selectedCategory === category.slug ? 'var(--kivi-cyan)' : 'var(--border-card)',
              color: selectedCategory === category.slug ? '#002040' : 'var(--text-secondary)',
            }}
          >
            <span>{category.name}</span>
            {category.product_count !== undefined && (
              <span
                className="font-mono text-[9px] px-1.5 py-0.5 rounded-[2px]"
                style={{
                  background: selectedCategory === category.slug ? 'rgba(0,32,64,0.15)' : 'var(--bg-card-alt)',
                  color: selectedCategory === category.slug ? '#002040' : 'var(--kivi-cyan)',
                }}
              >
                {category.product_count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
