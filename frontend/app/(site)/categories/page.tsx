import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowRight, Layers } from 'lucide-react'
import { api } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import type { Category } from '@/types'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({
  title: 'Chemical Categories — Industrial Chemicals Kenya',
  description:
    'Browse Kivi Chemicals product categories: industrial solvents, water treatment chemicals, acids, salts and specialty additives, delivered across Kenya, Uganda and Tanzania.',
  path: '/categories',
})

async function getCategories(): Promise<Category[]> {
  try {
    return (await api.getCategories()) || []
  } catch {
    return []
  }
}

export default async function CategoriesIndexPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen py-12" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <div className="overline mb-2">Sector Catalogues</div>
          <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>
            Chemical Categories
          </h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Explore our chemical formulations grouped by industrial application — water treatment,
            manufacturing, agriculture, and more. Each category page covers grade options, industry
            uses, and buying guidance for procurement teams across Kenya, Uganda and Tanzania.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group border rounded-[4px] p-6 text-left transition-all duration-300 flex flex-col h-full justify-between"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-card)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div>
                  <div className="mb-4 p-2.5 rounded-[2px] w-fit transition-all duration-300" style={{ background: 'var(--kivi-cyan-muted)' }}>
                    <Layers size={20} style={{ color: 'var(--kivi-cyan)' }} />
                  </div>
                  {cat.image && (
                    <div className="relative mb-4 h-24 rounded-[2px] border overflow-hidden" style={{ borderColor: 'var(--border-card)' }}>
                      <Image
                        src={cat.image}
                        alt={`${cat.name} — Kivi Chemicals`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h2
                    className="font-display font-bold text-sm mb-2 uppercase group-hover:text-[var(--kivi-cyan)] transition-colors"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    {cat.name}
                  </h2>
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {cat.description || 'High-purity specifications suitable for professional formulations.'}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="text-[10px] font-mono font-bold" style={{ color: 'var(--kivi-cyan)' }}>
                    {cat.product_count || 0} PRODUCTS
                  </div>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--kivi-cyan)' }} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No categories available right now.</p>
        )}
      </div>
    </div>
  )
}
