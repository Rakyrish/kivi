'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Product, Category } from '@/types'
import AIGeneratePanel from '@/components/admin/AIGeneratePanel'
import ProductForm from '@/components/admin/ProductForm'
import { Loader2 } from 'lucide-react'

export default function EditProductPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [aiData, setAiData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [prod, cats] = await Promise.all([
          api.getProduct(slug),
          api.getCategories(),
        ])
        setProduct(prod)
        setCategories(cats)
      } catch (_) {
        setError('Failed to load product data.')
      } finally {
        setLoading(false)
      }
    }
    if (slug) load()
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--kivi-cyan)' }}>
        <Loader2 size={24} className="animate-spin mr-3" />
        <span className="text-xs uppercase font-bold tracking-wider">Loading product...</span>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-16 text-xs" style={{ color: 'var(--kivi-error)' }}>{error || 'Product not found.'}</div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
          Edit Product
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>/{slug}</p>
      </div>

      {/* AI Re-generate Panel */}
      <AIGeneratePanel categories={categories} onGenerate={setAiData} />

      {/* Pre-populated Form */}
      <ProductForm
        initialData={product}
        categories={categories}
        isEdit={true}
        aiData={aiData}
      />
    </div>
  )
}
