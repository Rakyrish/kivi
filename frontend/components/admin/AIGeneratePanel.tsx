'use client'

import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle, AlertCircle, Upload, Link2, ImageIcon, X, Plus, RefreshCw, Terminal, Cpu } from 'lucide-react'
import { api } from '@/lib/api'
import { Category } from '@/types'

interface AIGeneratePanelProps {
  categories: Category[]
  onGenerate: (data: any) => void
}

export default function AIGeneratePanel({ categories, onGenerate }: AIGeneratePanelProps) {
  const [productName, setProductName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  
  // Multiple files support
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [filePreviews, setFilePreviews] = useState<string[]>([])

  // Multiple URLs support
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [urlErrors, setUrlErrors] = useState<boolean[]>([false])

  // Ingestion Flow States
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'analyzed' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Extracted data and diagnostic logs
  const [extraction, setExtraction] = useState<any>(null)
  const [diagnostics, setDiagnostics] = useState<any>(null)

  // Add multiple file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setImageFiles((prev) => [...prev, ...filesArray])

      filesArray.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setFilePreviews((prev) => [...prev, ev.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setFilePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Add dynamic URLs
  const handleUrlChange = (index: number, val: string) => {
    setImageUrls((prev) => {
      const copy = [...prev]
      copy[index] = val
      return copy
    })
    setUrlErrors((prev) => {
      const copy = [...prev]
      copy[index] = false
      return copy
    })
  }

  const addUrlField = () => {
    setImageUrls((prev) => [...prev, ''])
    setUrlErrors((prev) => [...prev, false])
  }

  const removeUrlField = (index: number) => {
    if (imageUrls.length > 1) {
      setImageUrls((prev) => prev.filter((_, i) => i !== index))
      setUrlErrors((prev) => prev.filter((_, i) => i !== index))
    } else {
      setImageUrls([''])
      setUrlErrors([false])
    }
  }

  // Phase 1: Analyze Product Image Vision
  const handleAnalyzeImage = async () => {
    setStatus('analyzing')
    setErrorMsg('')
    setExtraction(null)
    setDiagnostics(null)

    if (imageFiles.length === 0 && imageUrls.filter(u => u.trim()).length === 0) {
      setErrorMsg('Please upload a product packaging image or provide an image URL.')
      setStatus('error')
      return
    }

    try {
      const formData = new FormData()
      imageFiles.forEach((file) => {
        formData.append('images', file)
      })
      imageUrls.forEach((url) => {
        if (url.trim()) {
          formData.append('image_urls', url.trim())
        }
      })

      const res = await api.analyzeProductImage(formData)
      if (res.success) {
        setExtraction(res.extraction)
        setDiagnostics(res.diagnostics)
        if (res.extraction.product_name) {
          setProductName(res.extraction.product_name)
        }
        setStatus('analyzed')
      } else {
        setDiagnostics(res.diagnostics)
        setErrorMsg(res.error || 'Image analysis failed. Unable to generate accurate product information.')
        setStatus('error')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Image analysis failed. Unable to generate accurate product information.')
      setStatus('error')
    }
  }

  // Phase 2: Generate Product Content
  const handleGenerateContent = async () => {
    if (!extraction) {
      setErrorMsg('Image analysis required before copy generation.')
      setStatus('error')
      return
    }

    setStatus('generating')
    setErrorMsg('')

    try {
      const payload = {
        product_name: productName || extraction.product_name || '',
        category: selectedCategory,
        vision_data: extraction
      }

      const content = await api.generateAIProductFromForm(payload)
      onGenerate(content)
      setStatus('done')
    } catch (err: any) {
      setErrorMsg(err.message || 'Copy generation failed.')
      setStatus('error')
    }
  }

  const handleReset = () => {
    setExtraction(null)
    setDiagnostics(null)
    setProductName('')
    setSelectedCategory('')
    setImageFiles([])
    setFilePreviews([])
    setImageUrls([''])
    setStatus('idle')
    setErrorMsg('')
  }

  const inputStyle = {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-input)',
    color: 'var(--text-primary)',
  }

  return (
    <div
      className="p-6 rounded-[4px] space-y-6 transition-all"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-card)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b pb-3"
        style={{ borderColor: 'var(--border-divider)' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} style={{ color: 'var(--kivi-cyan)' }} />
          <h3 className="font-display font-extrabold text-sm uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            AI Vision Ingestion Workflow
          </h3>
        </div>
        <span
          className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-[2px]"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-divider)', color: 'var(--kivi-cyan)' }}
        >
          Vision OCR Engine
        </span>
      </div>

      {status === 'idle' || status === 'analyzing' || status === 'error' && !extraction ? (
        <>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Upload one or more packaging photos (labels, spec sheets, front/back views) or paste direct image URLs. 
            The system will analyze raw image inputs using OpenAI Vision and extract text before generating copy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                Product Name (Optional: overwritten by image detection)
              </label>
              <input
                type="text"
                placeholder="e.g. Sodium Hydroxide"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 text-xs focus:outline-none transition-colors rounded-[2px]"
                style={inputStyle}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                Category Context
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs focus:outline-none transition-colors rounded-[2px]"
                style={inputStyle}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t" style={{ borderColor: 'var(--border-divider)' }}>
            {/* Files Area */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Upload size={12} style={{ color: 'var(--kivi-cyan)' }} /> Upload Packaging Images (Select Multiple)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full px-3 py-1.5 text-xs focus:outline-none rounded-[2px] file:mr-4 file:py-1 file:px-2.5 file:rounded-[2px] file:border-0 file:text-[10px] file:font-semibold file:cursor-pointer"
                style={inputStyle}
              />

              {filePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {filePreviews.map((preview, idx) => (
                    <div key={idx} className="relative rounded-[4px] overflow-hidden border p-1" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card-alt)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-20 object-contain" />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X size={10} />
                      </button>
                      <div className="text-[8px] text-center truncate mt-1" style={{ color: 'var(--text-muted)' }}>
                        {imageFiles[idx]?.name || `Image ${idx + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* URLs Area */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Link2 size={12} style={{ color: 'var(--kivi-cyan)' }} /> Image Source URLs
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="url"
                      placeholder="https://example.com/chemical-label.jpg"
                      value={url}
                      onChange={(e) => handleUrlChange(idx, e.target.value)}
                      className="flex-grow px-3 py-1.5 text-xs focus:outline-none transition-colors rounded-[2px]"
                      style={inputStyle}
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrlField(idx)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: 'var(--kivi-error)' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addUrlField}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-wider border rounded-[2px] transition-colors"
                style={{ borderColor: 'var(--border-divider)', color: 'var(--text-secondary)' }}
              >
                <Plus size={10} /> Add URL Field
              </button>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t" style={{ borderColor: 'var(--border-divider)' }}>
            <div>
              {status === 'analyzing' && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--kivi-cyan)' }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Executing Stage 1: Running OCR &amp; Vision Identification...</span>
                </div>
              )}
              {errorMsg && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--kivi-error)' }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
            {status !== 'analyzing' && (
              <button
                onClick={handleAnalyzeImage}
                className="inline-flex items-center gap-2 px-5 py-2.5 transition-colors text-xs font-bold uppercase tracking-wider rounded-[2px]"
                style={{ background: 'var(--kivi-cyan)', color: '#002040', boxShadow: 'var(--shadow-glow-cyan)' }}
              >
                <ImageIcon size={14} />
                Analyze Product Image
              </button>
            )}
          </div>
        </>
      ) : (
        /* ── PHASE 1 RESULTS DISPLAY (STAGE 2 OPTION) ── */
        <div className="space-y-6">
          {/* Diagnostic Metrics Log */}
          <div className="border rounded-[2px] overflow-hidden" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card-alt)' }}>
            <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'var(--border-divider)', background: 'var(--bg-table-head)' }}>
              <Cpu size={14} style={{ color: 'var(--kivi-cyan)' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--kivi-cyan)' }}>OpenAI Vision Verification &amp; Diagnostic Logs</span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[10px]">
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Image uploaded: </span>
                <span className="font-bold" style={{ color: diagnostics?.image_uploaded ? 'var(--kivi-success)' : 'var(--kivi-error)' }}>
                  {diagnostics?.image_uploaded ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Image sent to OpenAI: </span>
                <span className="font-bold" style={{ color: diagnostics?.image_sent ? 'var(--kivi-success)' : 'var(--kivi-error)' }}>
                  {diagnostics?.image_sent ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Vision response received: </span>
                <span className="font-bold" style={{ color: diagnostics?.vision_received ? 'var(--kivi-success)' : 'var(--kivi-error)' }}>
                  {diagnostics?.vision_received ? 'TRUE' : 'FALSE'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Product Detection Preview & Confidence */}
            <div className="md:col-span-1 space-y-4">
              <div className="p-4 border rounded-[2px]" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card-alt)' }}>
                <span className="text-[9px] uppercase tracking-wider font-bold block" style={{ color: 'var(--text-muted)' }}>Detected Product</span>
                <span className="text-sm font-bold block mt-1" style={{ color: 'var(--text-primary)' }}>
                  {extraction?.product_name || 'Unknown Chemical'}
                </span>

                <div className="mt-4">
                  <span className="text-[9px] uppercase tracking-wider font-bold block" style={{ color: 'var(--text-muted)' }}>Confidence Score</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-grow bg-gray-700 h-2 rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${extraction?.confidence_score || 0}%`,
                          background: (extraction?.confidence_score || 0) >= 80 ? 'var(--kivi-success)' : 'var(--kivi-error)'
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold" style={{ color: (extraction?.confidence_score || 0) >= 80 ? 'var(--kivi-success)' : 'var(--kivi-error)' }}>
                      {extraction?.confidence_score || 0}%
                    </span>
                  </div>
                  {(extraction?.confidence_score || 0) < 80 && (
                    <p className="text-[9px] mt-1.5" style={{ color: 'var(--kivi-error)' }}>
                      ⚠️ Low confidence extraction. Values will require verification.
                    </p>
                  )}
                </div>
              </div>

              {/* Vision Results Panel */}
              <div className="p-4 border rounded-[2px]" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card-alt)' }}>
                <span className="text-[9px] uppercase tracking-wider font-bold block mb-2" style={{ color: 'var(--text-muted)' }}>Vision Results Panel</span>
                <div className="space-y-2 text-[11px]">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Brand</span>
                    <span className="font-bold">{extraction?.brand || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Manufacturer</span>
                    <span className="font-bold">{extraction?.manufacturer || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Grade</span>
                    <span className="font-bold">{extraction?.grade || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Packaging / Weight</span>
                    <span className="font-bold">{extraction?.packaging || '—'} {extraction?.weight ? `(${extraction.weight})` : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Extracted Text Viewer */}
            <div className="md:col-span-2 space-y-4">
              <div className="border rounded-[2px] overflow-hidden flex flex-col h-full" style={{ borderColor: 'var(--border-card)', background: '#091522' }}>
                <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'var(--border-divider)', background: '#040B13' }}>
                  <Terminal size={13} style={{ color: 'var(--kivi-cyan)' }} />
                  <span className="text-[10px] font-mono uppercase font-bold" style={{ color: 'var(--kivi-cyan)' }}>Extracted Text Viewer (OCR Lines)</span>
                </div>
                <div className="p-4 font-mono text-[10px] leading-relaxed overflow-y-auto flex-grow space-y-1.5 text-emerald-400 max-h-64">
                  {extraction?.visible_text && extraction.visible_text.length > 0 ? (
                    extraction.visible_text.map((line: string, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <span className="opacity-35 select-none">{String(idx + 1).padStart(2, '0')}:</span>
                        <span>"{line}"</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 italic">No text extracted from the packaging.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Image Analysis Preview (thumbnails of images that were analyzed) */}
          {filePreviews.length > 0 && (
            <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--border-divider)' }}>
              <span className="text-[9px] uppercase tracking-wider font-bold block" style={{ color: 'var(--text-muted)' }}>Analyzed Image Preview</span>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {filePreviews.map((preview, idx) => (
                  <div key={idx} className="border rounded-[2px] p-1 bg-black/20 flex-shrink-0" style={{ borderColor: 'var(--border-card)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt={`Analyzed ${idx + 1}`} className="h-16 w-24 object-contain" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trigger Ingestion / Content Copy Generation */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-divider)' }}>
            <div>
              {status === 'generating' && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--kivi-cyan)' }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Executing Stage 2: Populating detailed marketing/B2B descriptors...</span>
                </div>
              )}
              {errorMsg && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--kivi-error)' }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={status === 'generating'}
                className="inline-flex items-center gap-1.5 px-4 py-2 border rounded-[2px] transition-colors text-[10px] font-bold uppercase tracking-wider disabled:opacity-60"
                style={{ borderColor: 'var(--border-divider)', color: 'var(--text-secondary)' }}
              >
                <RefreshCw size={11} />
                Regenerate Vision Analysis
              </button>

              {status !== 'generating' && (
                <button
                  onClick={handleGenerateContent}
                  className="inline-flex items-center gap-2 px-5 py-2.5 transition-colors text-xs font-bold uppercase tracking-wider rounded-[2px]"
                  style={{ background: 'var(--kivi-cyan)', color: '#002040', boxShadow: 'var(--shadow-glow-cyan)' }}
                >
                  <Sparkles size={14} />
                  Generate Content
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
