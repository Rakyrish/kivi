'use client'

import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { Category } from '@/types'

interface AIGeneratePanelProps {
  categories: Category[]
  onGenerate: (data: any) => void
}

export default function AIGeneratePanel({ categories, onGenerate }: AIGeneratePanelProps) {
  const [productName, setProductName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleGenerate = async () => {
    if (!productName) {
      setErrorMsg('Product name is required.')
      setStatus('error')
      return
    }

    setStatus('generating')
    setErrorMsg('')

    try {
      const data = await api.generateAIProduct(productName, selectedCategory)
      onGenerate(data)
      setStatus('done')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate product details.')
      setStatus('error')
    }
  }

  return (
    <div className="bg-[#081525] border border-[#00A0C0]/20 p-6 rounded-[4px] shadow-lg space-y-4">
      <div className="flex items-center gap-2 border-b border-[#00A0C0]/10 pb-3">
        <Sparkles size={18} className="text-[#00A0C0]" />
        <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-[#F4F7FA]">
          AI Product Generator Workspace
        </h3>
      </div>

      <p className="text-[11px] text-[#94A3B8] leading-relaxed">
        Input the chemical name and category. The AI will generate technical specs, CAS numbers, formulas, and SEO metadata.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold tracking-wider text-[#606060] block">
            Product Name
          </label>
          <input
            type="text"
            placeholder="e.g. Sodium Hydroxide"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-3 py-2 text-xs focus:outline-none transition-colors rounded-[2px]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold tracking-wider text-[#606060] block">
            Category Context
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-[#081525] border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-3 py-2 text-xs focus:outline-none transition-colors rounded-[2px]"
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

      <div className="flex items-center justify-between gap-4 pt-2">
        {status === 'generating' && (
          <div className="flex items-center gap-2 text-xs text-[#00A0C0]">
            <Loader2 size={16} className="animate-spin" />
            <span>Generating high-purity product profile...</span>
          </div>
        )}

        {status === 'done' && (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle size={16} />
            <span>Form populated successfully! Review specs below.</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {status !== 'generating' && (
          <button
            onClick={handleGenerate}
            className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] transition-colors text-xs font-bold uppercase tracking-wider rounded-[2px]"
          >
            <Sparkles size={14} />
            Generate with AI
          </button>
        )}
      </div>
    </div>
  )
}
