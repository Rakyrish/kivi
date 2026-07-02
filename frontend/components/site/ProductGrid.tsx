import ProductCard from './ProductCard'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  view?: 'grid' | 'table'
  columns?: 2 | 3 | 4
}

export default function ProductGrid({ products, view = 'grid', columns = 4 }: ProductGridProps) {
  if (!products || products.length === 0) return null

  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns]

  return (
    <div className={`grid ${colClass} gap-5`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} view={view} />
      ))}
    </div>
  )
}
