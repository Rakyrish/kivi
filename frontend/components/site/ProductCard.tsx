import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  // Use a default image if not specified
  const imageUrl = product.image || '/placeholder.png'

  return (
    <div className="group bg-[#081525] border border-[#00A0C0]/10 hover:border-[#00A0C0] transition-all duration-300 rounded-[4px] overflow-hidden flex flex-col h-full shadow-lg">
      {/* Product Image */}
      <div className="relative aspect-video w-full bg-[#002040]/30 overflow-hidden">
        {product.image ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#00A0C0]/20">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
        )}

        {/* Featured Tag */}
        {product.is_featured && (
          <span className="absolute top-3 left-3 bg-[#00A0C0] text-[#002040] text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-[2px]">
            Featured
          </span>
        )}

        {/* Stock status tag */}
        {!product.in_stock && (
          <span className="absolute top-3 right-3 bg-red-900/80 border border-red-500/30 text-red-200 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-[2px]">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category & Formula Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] text-[#00A0C0] uppercase tracking-wider font-bold">
            {product.category_name || 'Chemicals'}
          </span>
          {product.chemical_formula && (
            <span className="font-mono font-bold text-[10px] bg-[#00A0C0]/15 text-[#00A0C0] px-2 py-0.5 rounded-[2px] border border-[#00A0C0]/25">
              {product.chemical_formula}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-display font-bold text-base text-[#F4F7FA] mb-2 line-clamp-1 group-hover:text-[#00A0C0] transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#94A3B8] line-clamp-2 mb-6 leading-relaxed flex-grow">
          {product.short_description}
        </p>

        {/* Button */}
        <Link
          href={`/products/${product.slug}`}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 py-2.5 border border-[#00A0C0]/35 hover:border-[#00A0C0] bg-transparent hover:bg-[#00A0C0] text-[#00A0C0] hover:text-[#002040] text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-[2px]"
        >
          View Details
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  )
}
