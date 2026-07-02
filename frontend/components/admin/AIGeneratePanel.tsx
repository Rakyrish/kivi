'use client'

import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle, AlertCircle, Upload, Link2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Category } from '@/types'

interface AIGeneratePanelProps {
  categories: Category[]
  onGenerate: (data: any) => void
}

export default function AIGeneratePanel({ categories, onGenerate }: AIGeneratePanelProps) {
  const [productName, setProductName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleGenerate = async () => {
    setStatus('generating')
    setErrorMsg('')

    try {
      const formData = new FormData()
      if (productName) formData.append('product_name', productName)
      if (selectedCategory) formData.append('category', selectedCategory)
      if (imageUrl) formData.append('image_url', imageUrl)
      if (imageFile) formData.append('image', imageFile)

      const data = await api.generateAIProductFromForm(formData)
      onGenerate(data)
      setStatus('done')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate product details.')
      setStatus('error')
    }
  }

  return (
    <div className="bg-kivi-surface border border-kivi-cyan/20 p-6 rounded-kivi shadow-glow-cyan space-y-4 text-kivi-white">
      <div className="flex items-center gap-2 border-b border-kivi-cyan/10 pb-3">
        <Sparkles size={18} className="text-kivi-cyan" />
        <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-kivi-white">
          AI Vision Product Ingestion
        </h3>
      </div>

      <p className="text-[11px] text-kivi-mid leading-relaxed">
        Let AI infer chemical specs. Upload an image of a chemical drum, sack label, or spec-sheet, or specify the name & category directly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold tracking-wider text-kivi-mid block">
            Product Name (Optional if uploading image)
          </label>
          <input
            type="text"
            placeholder="e.g. Sodium Hydroxide"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-3 py-2 text-xs focus:outline-none transition-colors rounded-kivi-sm"
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold tracking-wider text-kivi-mid block">
            Category Context
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-kivi-surface border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-3 py-2 text-xs focus:outline-none transition-colors rounded-kivi-sm"
          >
            <option value="">Select Category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Image Upload/URL Tab Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-kivi-cyan/5">
        {/* File Upload */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold tracking-wider text-kivi-mid flex items-center gap-1.5 mb-1">
            <Upload size={12} className="text-kivi-cyan" /> Upload Sack/Label Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 text-kivi-white px-3 py-1.5 text-xs focus:outline-none focus:border-kivi-cyan rounded-kivi-sm file:mr-4 file:py-1 file:px-2.5 file:rounded-kivi-sm file:border-0 file:text-[10px] file:font-semibold file:bg-kivi-cyan file:text-kivi-navy file:cursor-pointer"
          />
        </div>

        {/* URL Input */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold tracking-wider text-kivi-mid flex items-center gap-1.5">
            <Link2 size={12} className="text-kivi-cyan" /> Image Source URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/chemical-label.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-3 py-2 text-xs focus:outline-none transition-colors rounded-kivi-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2 border-t border-kivi-cyan/10">
        {status === 'generating' && (
          <div className="flex items-center gap-2 text-xs text-kivi-cyan">
            <Loader2 size={16} className="animate-spin" />
            <span>Analyzing image & generating compound specifications...</span>
          </div>
        )}

        {status === 'done' && (
          <div className="flex items-center gap-2 text-xs text-kivi-success">
            <CheckCircle size={16} />
            <span>Specifications inferred! Verify & save.</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-xs text-kivi-error">
            <AlertCircle size={16} />
            <span className="truncate max-w-[250px]">{errorMsg}</span>
          </div>
        )}

        {status !== 'generating' && (
          <button
            onClick={handleGenerate}
            className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-kivi-cyan hover:bg-kivi-cyan-hover text-kivi-navy transition-colors text-xs font-bold uppercase tracking-wider rounded-kivi-sm shadow-glow-cyan"
          >
            <Sparkles size={14} />
            Run AI Inference
          </button>
        )}
      </div>
    </div>
  )
}
