'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, AlertCircle, CheckCircle, ImageIcon, X, RefreshCw, Eye, Edit3, ShieldAlert } from 'lucide-react'
import { Product, Category } from '@/types'
import { api } from '@/lib/api'
import { hasRealValue } from '@/lib/productDisplay'

interface ProductFormProps {
  initialData?: Product
  categories: Category[]
  isEdit: boolean
  aiData?: any
}

// shared input style (theme-aware via CSS vars)
const INPUT_CLS =
  'w-full px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]'

const inputStyle = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border-input)',
  color: 'var(--text-primary)',
}

export default function ProductForm({ initialData, categories, isEdit, aiData }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    category: undefined,
    chemical_formula: '',
    cas_number: '',
    grade: '',
    un_number: '',
    brand: '',
    manufacturer: '',
    hazard_classification: '',
    grades_available: [],
    regulatory_compliance: [],
    short_description: '',
    description: '',
    applications: [],
    specifications: {},
    safety_info: '',
    seo_title: '',
    seo_description: '',
    keywords: '',
    image: '',
    images: [],
    is_active: true,
    is_featured: false,
    in_stock: true,
    ai_generated: false,
  })

  const [newApplication, setNewApplication] = useState('')
  const [specKey, setSpecKey] = useState('')
  const [specVal, setSpecVal] = useState('')
  const [newCompliance, setNewCompliance] = useState('')
  const [gradeKey, setGradeKey] = useState('')
  const [gradeNote, setGradeNote] = useState('')

  const [loading, setLoading] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // View state: 'edit' or 'preview'
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  // Confidence scores and validation state
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({})
  const [requiresReviewFields, setRequiresReviewFields] = useState<string[]>([])

  // Image preview states
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageError, setImageError] = useState(false)

  // Bind initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      if (initialData.image) {
        setImagePreview(initialData.image)
      }
    }
  }, [initialData])

  // Bind AI generated data when it arrives
  useEffect(() => {
    if (aiData) {
      setFormData((prev) => ({
        ...prev,
        ...aiData,
        name: prev.name || aiData.name,
        ai_generated: true,
      }))
      if (aiData.image) {
        setImagePreview(aiData.image)
      }
      if (aiData.confidence_scores) {
        setConfidenceScores(aiData.confidence_scores)
        
        // Find fields that require manual review (confidence < 80 or exact text)
        const reviewList: string[] = []
        Object.entries(aiData.confidence_scores).forEach(([field, val]) => {
          if (Number(val) < 80) {
            reviewList.push(field)
          }
        })
        
        // Also check if any string field has the placeholder text
        Object.entries(aiData).forEach(([key, val]) => {
          if (typeof val === 'string' && val && !hasRealValue(val)) {
            if (!reviewList.includes(key)) {
              reviewList.push(key)
            }
          }
        })
        setRequiresReviewFields(reviewList)
      }
    }
  }, [aiData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData((prev) => ({ ...prev, [name]: val }))

    // Remove field from review list when changed
    if (requiresReviewFields.includes(name)) {
      setRequiresReviewFields((prev) => prev.filter((f) => f !== name))
    }

    // Live image preview when URL changes
    if (name === 'image') {
      setImageError(false)
      setImagePreview(value.trim())
    }
  }

  const handleToggle = (name: keyof Product) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  // Applications tags logic
  const addApplication = () => {
    if (newApplication.trim() && !formData.applications?.includes(newApplication.trim())) {
      setFormData((prev) => ({
        ...prev,
        applications: [...(prev.applications || []), newApplication.trim()],
      }))
      setNewApplication('')
    }
  }

  const removeApplication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      applications: prev.applications?.filter((_, i) => i !== index) || [],
    }))
  }

  // Specifications dict logic
  const addSpecification = () => {
    if (specKey.trim() && specVal.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...(prev.specifications || {}),
          [specKey.trim()]: specVal.trim(),
        },
      }))
      setSpecKey('')
      setSpecVal('')
    }
  }

  const removeSpecification = (key: string) => {
    setFormData((prev) => {
      const copy = { ...(prev.specifications || {}) }
      delete copy[key]
      return { ...prev, specifications: copy }
    })
  }

  // Regulatory compliance tags logic
  const addCompliance = () => {
    if (newCompliance.trim() && !formData.regulatory_compliance?.includes(newCompliance.trim())) {
      setFormData((prev) => ({
        ...prev,
        regulatory_compliance: [...(prev.regulatory_compliance || []), newCompliance.trim()],
      }))
      setNewCompliance('')
    }
  }

  const removeCompliance = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      regulatory_compliance: prev.regulatory_compliance?.filter((_, i) => i !== index) || [],
    }))
  }

  // Grades available logic
  const addGradeAvailable = () => {
    if (gradeKey.trim()) {
      setFormData((prev) => ({
        ...prev,
        grades_available: [...(prev.grades_available || []), { grade: gradeKey.trim(), note: gradeNote.trim() }],
      }))
      setGradeKey('')
      setGradeNote('')
    }
  }

  const removeGradeAvailable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      grades_available: prev.grades_available?.filter((_, i) => i !== index) || [],
    }))
  }

  // Content regeneration trigger
  const handleRegenerate = async () => {
    if (!formData.name && !formData.image) {
      setErrorMsg('Need a product name or image URL to regenerate content.')
      return
    }

    setRegenLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const payload = new FormData()
      if (formData.name) payload.append('product_name', formData.name)
      if (formData.category) {
        const catObj = categories.find((c) => c.id === formData.category)
        if (catObj) payload.append('category', catObj.name)
      }
      if (formData.image) payload.append('image_url', formData.image)

      const freshData = await api.generateAIProductFromForm(payload)
      setFormData((prev) => ({
        ...prev,
        ...freshData,
        ai_generated: true,
      }))
      if (freshData.image) {
        setImagePreview(freshData.image)
      }
      if (freshData.confidence_scores) {
        setConfidenceScores(freshData.confidence_scores)
        const reviewList: string[] = []
        Object.entries(freshData.confidence_scores).forEach(([field, val]) => {
          if (Number(val) < 80) {
            reviewList.push(field)
          }
        })
        setRequiresReviewFields(reviewList)
      }
      setSuccessMsg('Product content successfully regenerated via AI Vision.')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to regenerate product details.')
    } finally {
      setRegenLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (!formData.name || !formData.short_description || !formData.description) {
      setErrorMsg('Please fill in Name, Short Description, and Full Description.')
      setLoading(false)
      return
    }

    try {
      const saved = await api.saveProduct(formData, isEdit, initialData?.slug)
      setSuccessMsg(isEdit ? 'Product updated successfully.' : 'Product created successfully.')
      // Keep the saved data (including anything populated by the AI vision
      // workflow) visible on screen instead of wiping the form back to blank —
      // admins need to see what was actually saved, not lose it immediately.
      setFormData(saved)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product.')
    } finally {
      setLoading(false)
    }
  }

  const shortDescCount = formData.short_description?.length || 0
  const seoTitleCount = formData.seo_title?.length || 0

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <h3
      className="font-display font-black text-sm uppercase tracking-wider border-b pb-3"
      style={{ color: 'var(--text-primary)', borderColor: 'var(--border-divider)' }}
    >
      {children}
    </h3>
  )

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label
      className="text-[10px] uppercase font-bold tracking-wider block"
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </label>
  )

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--kivi-cyan)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const isError = requiresReviewFields.includes(e.target.name)
    e.target.style.borderColor = isError ? 'var(--kivi-error)' : 'var(--border-input)'
  }

  // Confidence Score Indicator Badge
  const ConfidenceBadge = ({ field }: { field: string }) => {
    const score = confidenceScores[field]
    if (score === undefined) return null

    let color = 'text-gray-400 border-gray-400 bg-gray-400/10'
    let text = `${score}%`

    if (score >= 90) {
      color = 'text-emerald-500 border-emerald-500 bg-emerald-500/10'
    } else if (score >= 70) {
      color = 'text-amber-500 border-amber-500 bg-amber-500/10'
    } else {
      color = 'text-red-500 border-red-500 bg-red-500/10 animate-pulse'
      text = `${score}%`
    }

    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono border ml-2 font-bold uppercase`}
        style={{
          color: score >= 90 ? 'var(--kivi-success)' : score >= 70 ? 'var(--kivi-hazard)' : 'var(--kivi-error)',
          borderColor: score >= 90 ? 'var(--kivi-success)' : score >= 70 ? 'var(--kivi-hazard)' : 'var(--kivi-error)',
          background: score >= 90 ? 'var(--kivi-success-bg)' : score >= 70 ? 'var(--kivi-hazard-bg)' : 'var(--kivi-error-bg)',
        }}
      >
        AI Confidence: {text}
      </span>
    )
  }

  // Helper to determine styling of input with review issues
  const getFieldInputStyle = (name: string) => {
    const fieldVal = formData[name as keyof Product]
    const isError = requiresReviewFields.includes(name) || (typeof fieldVal === 'string' && fieldVal.length > 0 && !hasRealValue(fieldVal))
    return {
      ...inputStyle,
      borderColor: isError ? 'var(--kivi-error)' : 'var(--border-input)',
      boxShadow: isError ? '0 0 4px rgba(239, 68, 68, 0.25)' : 'none',
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Feedback banners */}
      {successMsg && (
        <div
          className="flex items-center gap-3 p-4 rounded-[2px] text-xs"
          style={{ background: 'var(--kivi-success-bg)', border: '1px solid var(--kivi-success)', color: 'var(--kivi-success)' }}
        >
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          className="flex items-center gap-3 p-4 rounded-[2px] text-xs"
          style={{ background: 'var(--kivi-error-bg)', border: '1px solid var(--kivi-error)', color: 'var(--kivi-error)' }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Manual Approval / Review Banner */}
      {requiresReviewFields.length > 0 && (
        <div
          className="flex items-start gap-3 p-4 rounded-[4px] border"
          style={{
            background: 'var(--kivi-error-bg)',
            borderColor: 'var(--kivi-error)',
            color: 'var(--text-primary)',
          }}
        >
          <ShieldAlert className="mt-0.5 flex-shrink-0" style={{ color: 'var(--kivi-error)' }} size={18} />
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider block">Manual Approval &amp; Review Workflow</span>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              AI has ingested product data, but some fields have low confidence or require manual validation. 
              Review the fields highlighted in red below, correct them as needed, and approve by saving the product.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {requiresReviewFields.map((field) => (
                <span
                  key={field}
                  className="text-[8px] font-mono uppercase px-2 py-0.5 rounded-[2px] font-bold"
                  style={{ background: 'var(--kivi-error-bg)', border: '1px solid var(--kivi-error)', color: 'var(--kivi-error)' }}
                >
                  {field.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Selector & Actions bar */}
      <div className="flex flex-wrap items-center gap-y-2 justify-between border-b pb-2" style={{ borderColor: 'var(--border-divider)' }}>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
            style={{
              borderColor: activeTab === 'edit' ? 'var(--kivi-cyan)' : 'transparent',
              color: activeTab === 'edit' ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            <Edit3 size={13} />
            <span className="hidden sm:inline">Edit Form</span>
            <span className="sm:hidden">Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
            style={{
              borderColor: activeTab === 'preview' ? 'var(--kivi-cyan)' : 'transparent',
              color: activeTab === 'preview' ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            <Eye size={13} />
            <span className="hidden sm:inline">Preview Catalog Page</span>
            <span className="sm:hidden">Preview</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenLoading || loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-[2px] transition-colors text-[10px] font-bold uppercase tracking-wider disabled:opacity-60 shrink-0"
          style={{ borderColor: 'var(--border-divider)', color: 'var(--text-secondary)' }}
        >
          <RefreshCw size={11} className={regenLoading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Regenerate Content</span>
          <span className="sm:hidden">Regen</span>
        </button>
      </div>

      {activeTab === 'edit' ? (
        /* ── EDIT TAB ── */
        <div
          className="p-6 rounded-[4px] space-y-6"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--shadow-card)',
            color: 'var(--text-primary)',
          }}
        >
          <SectionHeading>Product Identity &amp; Properties</SectionHeading>

          {/* Row 1: Name + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center">
                <Label>Product Name <span style={{ color: 'var(--kivi-error)' }}>*</span></Label>
                <ConfidenceBadge field="name" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                required
                disabled={loading}
                className={INPUT_CLS}
                style={getFieldInputStyle('name')}
              />
              {formData.name && !hasRealValue(formData.name) && (
                <p className="text-[10px]" style={{ color: 'var(--kivi-error)' }}>⚠️ Please provide a valid product name.</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center">
                <Label>Slug (URL segment, auto-generated if blank)</Label>
              </div>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                placeholder="e.g. sodium-hydroxide"
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={loading}
                className={INPUT_CLS}
                style={getFieldInputStyle('slug')}
              />
            </div>
          </div>

          {/* Row 2: Category + Grade + Image URL */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center">
                <Label>Category</Label>
                <ConfidenceBadge field="suggested_category" />
              </div>
              <select
                name="category"
                value={formData.category || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={loading}
                className={INPUT_CLS}
                style={getFieldInputStyle('category')}
              >
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center">
                <Label>Chemical Grade</Label>
                <ConfidenceBadge field="grade" />
              </div>
              <input
                type="text"
                name="grade"
                placeholder="e.g. Technical / Food / Industrial"
                value={formData.grade}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={loading}
                className={INPUT_CLS}
                style={getFieldInputStyle('grade')}
              />
            </div>

            {/* Image URL with live preview */}
            <div className="space-y-1">
              <Label>Image URL</Label>
              <input
                type="text"
                name="image"
                placeholder="Cloudinary / External URL"
                value={formData.image}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={loading}
                className={INPUT_CLS}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Image preview */}
          {imagePreview && !imageError && (
            <div
              className="relative rounded-[4px] overflow-hidden border"
              style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card-alt)' }}
            >
              <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'var(--border-divider)' }}>
                <ImageIcon size={13} style={{ color: 'var(--kivi-cyan)' }} />
                <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Image Preview
                </span>
                <button
                  type="button"
                  className="ml-auto p-1 rounded transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => {
                    setImagePreview('')
                    setFormData((prev) => ({ ...prev, image: '' }))
                  }}
                  title="Clear image"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="relative w-full" style={{ height: '180px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-full object-contain p-2"
                  onError={() => setImageError(true)}
                />
              </div>
            </div>
          )}

          {/* Row 3: Formula + CAS + UN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="flex items-center">
                <Label>Chemical Formula</Label>
                <ConfidenceBadge field="chemical_formula" />
              </div>
              <input
                type="text"
                name="chemical_formula"
                placeholder="e.g. NaOH"
                value={formData.chemical_formula}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={loading}
                className={`${INPUT_CLS} font-mono`}
                style={getFieldInputStyle('chemical_formula')}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center">
                <Label>CAS Registry Number</Label>
                <ConfidenceBadge field="cas_number" />
              </div>
              <input
                type="text"
                name="cas_number"
                placeholder="e.g. 1310-73-2"
                value={formData.cas_number}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={loading}
                className={`${INPUT_CLS} font-mono`}
                style={getFieldInputStyle('cas_number')}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center">
                <Label>UN Hazmat Number</Label>
                <ConfidenceBadge field="un_number" />
              </div>
              <input
                type="text"
                name="un_number"
                placeholder="e.g. UN1823"
                value={formData.un_number}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={loading}
                className={`${INPUT_CLS} font-mono`}
                style={getFieldInputStyle('un_number')}
              />
            </div>
          </div>

          {/* Row 4: Brand + Manufacturer + Hazard Classification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="flex items-center">
                <Label>Brand</Label>
                <ConfidenceBadge field="brand" />
              </div>
              <input
                type="text"
                name="brand"
                placeholder="Brand shown on original packaging"
                value={formData.brand || ''}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={loading}
                className={INPUT_CLS}
                style={getFieldInputStyle('brand')}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center">
                <Label>Manufacturer</Label>
                <ConfidenceBadge field="manufacturer" />
              </div>
              <input
                type="text"
                name="manufacturer"
                placeholder="e.g. Original manufacturer name"
                value={formData.manufacturer || ''}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={loading}
                className={INPUT_CLS}
                style={getFieldInputStyle('manufacturer')}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center">
                <Label>Hazard Classification</Label>
                <ConfidenceBadge field="hazard_classification" />
              </div>
              <input
                type="text"
                name="hazard_classification"
                placeholder="e.g. GHS Category 1B – Corrosive (H314)"
                value={formData.hazard_classification || ''}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={loading}
                className={INPUT_CLS}
                style={getFieldInputStyle('hazard_classification')}
              />
            </div>
          </div>

          {/* Grades Available */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label>Grades Available</Label>
              <ConfidenceBadge field="grades_available" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.grades_available || []).map((g, i) => (
                <span
                  key={i}
                  title={g.note}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[2px]"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                >
                  {g.grade}
                  <button type="button" onClick={() => removeGradeAvailable(i)} disabled={loading}>
                    <Trash2 size={11} style={{ color: 'var(--kivi-error)' }} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Grade e.g. Food Grade"
                value={gradeKey}
                onChange={(e) => setGradeKey(e.target.value)}
                disabled={loading}
                className={INPUT_CLS}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Note (optional)"
                value={gradeNote}
                onChange={(e) => setGradeNote(e.target.value)}
                disabled={loading}
                className={INPUT_CLS}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={addGradeAvailable}
                disabled={loading}
                className="px-3 rounded-[2px]"
                style={{ background: 'var(--kivi-cyan)', color: '#fff' }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Regulatory Compliance & Standards */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label>Regulatory Compliance &amp; Standards</Label>
              <ConfidenceBadge field="regulatory_compliance" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.regulatory_compliance || []).map((standard, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[2px]"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                >
                  {standard}
                  <button type="button" onClick={() => removeCompliance(i)} disabled={loading}>
                    <Trash2 size={11} style={{ color: 'var(--kivi-error)' }} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Meets ISO 3696 Grade 2"
                value={newCompliance}
                onChange={(e) => setNewCompliance(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompliance())}
                disabled={loading}
                className={INPUT_CLS}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={addCompliance}
                disabled={loading}
                className="px-3 rounded-[2px]"
                style={{ background: 'var(--kivi-cyan)', color: '#fff' }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* ── Descriptions & Applications ── */}
          <SectionHeading>Descriptions &amp; Applications</SectionHeading>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Label>
                  Short Description (max 280 characters) <span style={{ color: 'var(--kivi-error)' }}>*</span>
                </Label>
                <ConfidenceBadge field="short_description" />
              </div>
              <span
                className="text-[10px] font-mono"
                style={{ color: shortDescCount > 280 ? 'var(--kivi-error)' : 'var(--text-muted)' }}
              >
                {shortDescCount}/280
              </span>
            </div>
            <input
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              onFocus={onFocus}
              onBlur={onBlur}
              maxLength={280}
              required
              disabled={loading}
              className={INPUT_CLS}
              style={getFieldInputStyle('short_description')}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center mb-1">
              <Label>
                Full Description <span style={{ color: 'var(--kivi-error)' }}>*</span>
              </Label>
              <ConfidenceBadge field="description" />
            </div>
            <textarea
              name="description"
              rows={8}
              value={formData.description}
              onChange={handleChange}
              onFocus={onFocus}
              onBlur={onBlur}
              required
              disabled={loading}
              className="w-full px-4 py-3 text-xs focus:outline-none transition-colors rounded-[2px] resize-none h-48"
              style={getFieldInputStyle('description')}
            />
          </div>

          {/* Applications tag builder */}
          <div className="space-y-2">
            <Label>Applications</Label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add application e.g. Soap manufacturing"
                value={newApplication}
                onChange={(e) => setNewApplication(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addApplication())}
                className="flex-grow px-4 py-2 text-xs focus:outline-none transition-colors rounded-[2px]"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <button
                type="button"
                onClick={addApplication}
                className="px-4 py-2 text-xs font-bold uppercase rounded-[2px] transition-colors"
                style={{ background: 'var(--kivi-cyan)', color: '#002040' }}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.applications?.map((app, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-xs border"
                  style={{
                    background: 'var(--bg-card-alt)',
                    borderColor: 'var(--border-card)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {app}
                  <button
                    type="button"
                    onClick={() => removeApplication(i)}
                    className="ml-1 transition-colors"
                    style={{ color: 'var(--kivi-error)' }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Specifications dictionary builder */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Label>Technical Specifications</Label>
              <ConfidenceBadge field="specifications" />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Specification Key (e.g. Purity)"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                className="w-1/3 px-4 py-2 text-xs focus:outline-none transition-colors rounded-[2px]"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <input
                type="text"
                placeholder="Specification Value (e.g. 99% min)"
                value={specVal}
                onChange={(e) => setSpecVal(e.target.value)}
                className="flex-grow px-4 py-2 text-xs focus:outline-none transition-colors rounded-[2px]"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <button
                type="button"
                onClick={addSpecification}
                className="px-4 py-2 text-xs font-bold uppercase rounded-[2px] transition-colors"
                style={{ background: 'var(--kivi-cyan)', color: '#002040' }}
              >
                Add Spec
              </button>
            </div>
            <div
              className="border rounded-[2px] overflow-hidden mt-3"
              style={{ borderColor: 'var(--border-card)' }}
            >
              <table className="w-full text-xs text-left">
                <thead>
                  <tr
                    className="font-display"
                    style={{
                      background: 'var(--bg-table-head)',
                      borderBottom: '1px solid var(--border-divider)',
                      color: 'var(--kivi-cyan)',
                    }}
                  >
                    <th className="px-4 py-2">Parameter</th>
                    <th className="px-4 py-2">Value</th>
                    <th className="px-4 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(formData.specifications || {}).map(([key, val]) => (
                    <tr
                      key={key}
                      className="border-b font-mono"
                      style={{ borderColor: 'var(--border-table)' }}
                    >
                      <td className="px-4 py-2 font-bold" style={{ color: 'var(--text-primary)' }}>{key}</td>
                      <td className="px-4 py-2" style={{ color: 'var(--text-secondary)' }}>{String(val)}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeSpecification(key)}
                          style={{ color: 'var(--kivi-error)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {Object.keys(formData.specifications || {}).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                        No technical specifications added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Safety &amp; Handling Information</Label>
            <textarea
              name="safety_info"
              rows={3}
              placeholder="Handling guidelines, hazards, storage recommendations..."
              value={formData.safety_info}
              onChange={handleChange}
              onFocus={onFocus}
              onBlur={onBlur}
              disabled={loading}
              className="w-full px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px] h-24"
              style={inputStyle}
            />
          </div>

          {/* ── SEO ── */}
          <SectionHeading>SEO &amp; Search Meta Tags</SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>SEO Title (max 60 characters)</Label>
                <span
                  className="text-[10px] font-mono"
                  style={{ color: seoTitleCount > 60 ? 'var(--kivi-error)' : 'var(--text-muted)' }}
                >
                  {seoTitleCount}/60
                </span>
              </div>
              <input
                type="text"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                maxLength={60}
                disabled={loading}
                className={INPUT_CLS}
                style={inputStyle}
              />
            </div>

            <div className="space-y-2">
              <Label>Keywords (comma-separated list)</Label>
              <input
                type="text"
                name="keywords"
                placeholder="e.g. sodium hydroxide Kenya, buy caustic soda Nairobi"
                value={formData.keywords}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={loading}
                className={INPUT_CLS}
                style={inputStyle}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>SEO Meta Description (max 160 characters)</Label>
            <input
              type="text"
              name="seo_description"
              value={formData.seo_description}
              onChange={handleChange}
              onFocus={onFocus}
              onBlur={onBlur}
              maxLength={160}
              disabled={loading}
              className={INPUT_CLS}
              style={inputStyle}
            />
          </div>

          {/* ── Toggles ── */}
          <SectionHeading>Toggles &amp; Statuses</SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { field: 'is_active', label: 'Active Catalog', sub: 'Visible to site visitors' },
              { field: 'is_featured', label: 'Featured Product', sub: 'Show on home page grid' },
              { field: 'in_stock', label: 'In Stock', sub: 'Available for ordering' },
            ].map(({ field, label, sub }) => (
              <label key={field} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData[field as keyof Product])}
                  onChange={() => handleToggle(field as keyof Product)}
                  disabled={loading}
                  className="w-4 h-4 rounded-[2px]"
                  style={{ accentColor: 'var(--kivi-cyan)' }}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{label}</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{sub}</span>
                </div>
              </label>
            ))}

            <label className="flex items-center gap-3 opacity-50">
              <input
                type="checkbox"
                checked={formData.ai_generated}
                disabled
                className="w-4 h-4 rounded-[2px]"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>AI Generated</span>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Populated by OpenAI LLM</span>
              </div>
            </label>
          </div>

          {/* ── Submit ── */}
          <div
            className="flex justify-end gap-4 pt-6 border-t"
            style={{ borderColor: 'var(--border-divider)' }}
          >
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 transition-colors text-xs font-bold uppercase tracking-wider rounded-[2px] disabled:opacity-60"
              style={{ background: 'var(--kivi-cyan)', color: '#002040' }}
            >
              <Save size={14} />
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </div>
      ) : (
        /* ── PREVIEW TAB ── */
        <div
          className="p-6 rounded-[4px] space-y-6"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--shadow-card)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Header */}
          <div className="border-b pb-4" style={{ borderColor: 'var(--border-divider)' }}>
            <span
              className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-[2px] inline-block mb-2"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-divider)', color: 'var(--kivi-cyan)' }}
            >
              Catalog Page Live Preview
            </span>
            <h1 className="font-display font-black text-2xl uppercase tracking-wide">
              {formData.name || 'Untitled Chemical'}
            </h1>
            <p className="text-xs font-mono mt-1" style={{ color: 'var(--kivi-cyan)' }}>
              Formula: {formData.chemical_formula || '—'} | CAS: {formData.cas_number || '—'} | UN: {formData.un_number || '—'}
            </p>
          </div>

          {/* Product Intro & image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border rounded p-4 flex items-center justify-center min-h-[220px]" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card-alt)' }}>
              {imagePreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imagePreview} alt={formData.name} className="max-h-48 object-contain" />
              ) : (
                <div className="text-center" style={{ color: 'var(--text-muted)' }}>
                  <ImageIcon size={40} className="mx-auto mb-2 opacity-55" />
                  <span className="text-xs">No image provided</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Short Description</h4>
                <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>{formData.short_description || '—'}</p>
              </div>

              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Introduction</h4>
                <p className="text-xs leading-relaxed mt-1">{formData.introduction || '—'}</p>
              </div>
            </div>
          </div>

          {/* Technical properties */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-sm uppercase" style={{ color: 'var(--text-primary)' }}>Technical Specifications</h3>
            <div className="border rounded overflow-hidden" style={{ borderColor: 'var(--border-card)' }}>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-divider)' }}>
                    <th className="px-4 py-2">Property / Parameter</th>
                    <th className="px-4 py-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b" style={{ borderColor: 'var(--border-table)' }}>
                    <td className="px-4 py-2 font-bold">Grade</td>
                    <td className="px-4 py-2">{formData.grade || '—'}</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'var(--border-table)' }}>
                    <td className="px-4 py-2 font-bold">Purity</td>
                    <td className="px-4 py-2">{formData.purity || '—'}</td>
                  </tr>
                  {Object.entries(formData.specifications || {}).map(([k, v]) => (
                    <tr key={k} className="border-b" style={{ borderColor: 'var(--border-table)' }}>
                      <td className="px-4 py-2 font-bold">{k}</td>
                      <td className="px-4 py-2">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full description */}
          <div className="space-y-2">
            <h3 className="font-display font-bold text-sm uppercase" style={{ color: 'var(--text-primary)' }}>Detailed Overview</h3>
            <div className="text-xs leading-relaxed space-y-3" style={{ color: 'var(--text-secondary)' }}>
              {formData.description ? (
                formData.description.split('\n\n').map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <p>No full description provided.</p>
              )}
            </div>
          </div>

          {/* Applications list */}
          {formData.applications && formData.applications.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-display font-bold text-sm uppercase" style={{ color: 'var(--text-primary)' }}>Industrial Applications</h3>
              <div className="flex flex-wrap gap-2">
                {formData.applications.map((app, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-[2px] text-xs border"
                    style={{ background: 'var(--bg-card-alt)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Safety info */}
          {formData.safety_info && (
            <div className="space-y-2">
              <h3 className="font-display font-bold text-sm uppercase" style={{ color: 'var(--kivi-hazard)' }}>Safety &amp; Hazards</h3>
              <div className="p-4 rounded-[2px] text-xs leading-relaxed" style={{ background: 'var(--kivi-hazard-bg)', border: '1px solid var(--kivi-hazard)', color: 'var(--text-primary)' }}>
                {formData.safety_info}
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  )
}
