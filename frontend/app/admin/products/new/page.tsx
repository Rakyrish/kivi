'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Category } from '@/types'
import AIGeneratePanel from '@/components/admin/AIGeneratePanel'
import ProductForm from '@/components/admin/ProductForm'
import { useEffect } from 'react'

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [aiData, setAiData] = useState<any>(null)

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {})
  }, [])

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl text-[#F4F7FA] uppercase tracking-wide">Add New Product</h1>
        <p className="text-xs text-[#606060] mt-1">Use the AI generator to auto-populate technical details, then review and publish.</p>
      </div>

      {/* AI Generator Panel */}
      <AIGeneratePanel categories={categories} onGenerate={setAiData} />

      {/* Product Form */}
      <ProductForm categories={categories} isEdit={false} aiData={aiData} />
    </div>
  )
}
