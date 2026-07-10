import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Product, Category } from '@/types'
import ProductCard from './ProductCard'

interface FeaturedProductsProps {
  groups: { category: Category; products: Product[] }[]
}

// Each category renders one clean row per breakpoint — 2 on mobile, 3 on
// tablet (md), 5 on desktop (lg). The grid columns match (`grid-cols-2
// md:grid-cols-3 lg:grid-cols-5`), so trailing cards beyond the breakpoint's
// count are hidden rather than wrapped.
function hideClass(index: number) {
  if (index >= 3) return 'hidden lg:block'
  if (index === 2) return 'hidden md:block'
  return ''
}

export default function FeaturedProducts({ groups }: FeaturedProductsProps) {
  if (!groups || groups.length === 0) return null

  return (
    <section
      className="py-20 border-y"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-divider)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="overline mb-2">Premium Solutions</div>
            <h2
              className="font-display font-black text-2xl md:text-3xl uppercase tracking-wide"
              style={{ color: 'var(--text-heading)' }}
            >
              Featured Chemicals
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
            style={{ color: 'var(--kivi-cyan)' }}
          >
            View Entire Catalogue
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-16">
          {groups.map(({ category, products }) => (
            <div key={category.id}>
              <div className="flex items-center justify-between gap-4 mb-6">
                <h3
                  className="font-display font-bold text-sm uppercase tracking-wide"
                  style={{ color: 'var(--text-heading)' }}
                >
                  {category.name}
                </h3>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--kivi-cyan)' }}
                >
                  View All
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {products.map((product, i) => (
                  <div key={product.id} className={hideClass(i)}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
