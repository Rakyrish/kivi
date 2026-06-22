import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Product } from '@/types'
import ProductCard from './ProductCard'

interface FeaturedProductsProps {
  products: Product[]
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  // Take up to 4 featured products
  const featured = products.slice(0, 4)

  if (featured.length === 0) return null

  return (
    <section className="py-20 bg-[#002040]/10 border-t border-b border-[#00A0C0]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0] mb-2">
              Premium Solutions
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-[#002040] uppercase tracking-wide">
              Featured Chemicals
            </h2>
          </div>
          
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00A0C0] hover:text-[#00A0E0] transition-colors"
          >
            View Entire Catalogue
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
