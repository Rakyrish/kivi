import ProductCard from './ProductCard'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  view?: 'grid' | 'table'
}

// Mobile: 2 columns · Tablet: 3 columns · Desktop: 5 columns
export default function ProductGrid({ products, view = 'grid' }: ProductGridProps) {
  if (!products || products.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} view={view} />
      ))}
    </div>
  )
}
