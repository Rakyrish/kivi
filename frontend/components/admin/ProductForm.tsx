'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { Product, Category } from '@/types'
import { api } from '@/lib/api'

interface ProductFormProps {
  initialData?: Product
  categories: Category[]
  isEdit: boolean
  aiData?: any
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

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Bind initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  // Bind AI generated data when it arrives
  useEffect(() => {
    if (aiData) {
      setFormData((prev) => ({
        ...prev,
        ...aiData,
        name: prev.name || aiData.name, // Keep existing name if typed
        ai_generated: true,
      }))
    }
  }, [aiData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData((prev) => ({ ...prev, [name]: val }))
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
      if (!isEdit) {
        // Redirect or clear
        setFormData({
          name: '',
          slug: '',
          category: undefined,
          chemical_formula: '',
          cas_number: '',
          grade: '',
          un_number: '',
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
      } else {
        setFormData(saved)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product.')
    } finally {
      setLoading(false)
    }
  }

  const shortDescCount = formData.short_description?.length || 0
  const seoTitleCount = formData.seo_title?.length || 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 p-4 rounded-[2px] text-xs">
          <CheckCircle size={18} className="text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 bg-red-950/60 border border-red-500/30 text-red-200 p-4 rounded-[2px] text-xs">
          <AlertCircle size={18} className="text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main product form */}
      <div className="bg-[#081525] border border-[#00A0C0]/15 p-6 rounded-[4px] shadow-lg text-[#F4F7FA] space-y-6">
        <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#F4F7FA] border-b border-[#00A0C0]/10 pb-3">
          Product Identity & Properties
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
              Slug (URL segment, auto-generated if blank)
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              placeholder="e.g. sodium-hydroxide"
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
              Category
            </label>
            <select
              name="category"
              value={formData.category || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              disabled={loading}
              className="w-full bg-[#081525] border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
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
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
              Chemical Grade
            </label>
            <input
              type="text"
              name="grade"
              placeholder="e.g. Technical / Food / Industrial"
              value={formData.grade}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              placeholder="Cloudinary/External URL"
              value={formData.image}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
              Chemical Formula
            </label>
            <input
              type="text"
              name="chemical_formula"
              placeholder="e.g. NaOH"
              value={formData.chemical_formula}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px] font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
              CAS Registry Number
            </label>
            <input
              type="text"
              name="cas_number"
              placeholder="e.g. 1310-73-2"
              value={formData.cas_number}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px] font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
              UN Hazmat Number
            </label>
            <input
              type="text"
              name="un_number"
              placeholder="e.g. UN1823"
              value={formData.un_number}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px] font-mono"
            />
          </div>
        </div>

        {/* Content Section */}
        <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#F4F7FA] border-b border-[#00A0C0]/10 pt-4 pb-3">
          Descriptions & Applications
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060]">
              Short Description (max 280 characters) <span className="text-red-500">*</span>
            </label>
            <span className={`text-[10px] font-mono ${shortDescCount > 280 ? 'text-red-400' : 'text-[#606060]'}`}>
              {shortDescCount}/280
            </span>
          </div>
          <input
            type="text"
            name="short_description"
            value={formData.short_description}
            onChange={handleChange}
            maxLength={280}
            required
            disabled={loading}
            className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
            Full Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            rows={8}
            value={formData.description}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-3 text-xs focus:outline-none transition-colors rounded-[2px] resize-none h-48"
          ></textarea>
        </div>

        {/* Applications tag builder */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
            Applications
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add application e.g. Soap manufacturing"
              value={newApplication}
              onChange={(e) => setNewApplication(e.target.value)}
              className="flex-grow bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
            <button
              type="button"
              onClick={addApplication}
              className="px-4 py-2 bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] text-xs font-bold uppercase rounded-[2px]"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {formData.applications?.map((app, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 bg-[#002040] border border-[#00A0C0]/25 text-[#F4F7FA] px-3 py-1 rounded-[2px] text-xs"
              >
                {app}
                <button
                  type="button"
                  onClick={() => removeApplication(i)}
                  className="text-red-400 hover:text-red-300 ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Specifications dictionary builder */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
            Technical Specifications
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Specification Key (e.g. Purity)"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              className="w-1/3 bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
            <input
              type="text"
              placeholder="Specification Value (e.g. 99% min)"
              value={specVal}
              onChange={(e) => setSpecVal(e.target.value)}
              className="flex-grow bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
            <button
              type="button"
              onClick={addSpecification}
              className="px-4 py-2 bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] text-xs font-bold uppercase rounded-[2px]"
            >
              Add Spec
            </button>
          </div>
          <div className="border border-[#00A0C0]/10 rounded-[2px] overflow-hidden mt-3">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#002040]/50 text-[#00A0C0] border-b border-[#00A0C0]/15 font-display">
                  <th className="px-4 py-2">Parameter</th>
                  <th className="px-4 py-2">Value</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(formData.specifications || {}).map(([key, val]) => (
                  <tr key={key} className="border-b border-[#00A0C0]/5 font-mono">
                    <td className="px-4 py-2 font-bold text-[#F4F7FA]">{key}</td>
                    <td className="px-4 py-2">{val}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {Object.keys(formData.specifications || {}).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-[#606060]">
                      No technical specifications added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
            Safety & Handling Information
          </label>
          <textarea
            name="safety_info"
            rows={3}
            placeholder="Handling guidelines, hazards, storage recommendations..."
            value={formData.safety_info}
            onChange={handleChange}
            disabled={loading}
            className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px] h-24"
          ></textarea>
        </div>

        {/* SEO Parameters */}
        <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#F4F7FA] border-b border-[#00A0C0]/10 pt-4 pb-3">
          SEO & Search Meta Tags
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060]">
                SEO Title (max 60 characters)
              </label>
              <span className={`text-[10px] font-mono ${seoTitleCount > 60 ? 'text-red-400' : 'text-[#606060]'}`}>
                {seoTitleCount}/60
              </span>
            </div>
            <input
              type="text"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleChange}
              maxLength={60}
              disabled={loading}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
              Keywords (comma-separated list)
            </label>
            <input
              type="text"
              name="keywords"
              placeholder="e.g. sodium hydroxide Kenya, buy caustic soda Nairobi"
              value={formData.keywords}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
            SEO Meta Description (max 160 characters)
          </label>
          <input
            type="text"
            name="seo_description"
            value={formData.seo_description}
            onChange={handleChange}
            maxLength={160}
            disabled={loading}
            className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
          />
        </div>

        {/* Toggles */}
        <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#F4F7FA] border-b border-[#00A0C0]/10 pt-4 pb-3">
          Toggles & Statuses
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={() => handleToggle('is_active')}
              disabled={loading}
              className="w-4 h-4 bg-[#081525] border border-[#00A0C0]/15 accent-[#00A0C0] rounded-[2px]"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F4F7FA]">Active Catalog</span>
              <span className="text-[9px] text-[#606060]">Visible to site visitors</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={() => handleToggle('is_featured')}
              disabled={loading}
              className="w-4 h-4 bg-[#081525] border border-[#00A0C0]/15 accent-[#00A0C0] rounded-[2px]"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F4F7FA]">Featured Product</span>
              <span className="text-[9px] text-[#606060]">Show on home page grid</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.in_stock}
              onChange={() => handleToggle('in_stock')}
              disabled={loading}
              className="w-4 h-4 bg-[#081525] border border-[#00A0C0]/15 accent-[#00A0C0] rounded-[2px]"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F4F7FA]">In Stock</span>
              <span className="text-[9px] text-[#606060]">Available for ordering</span>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.ai_generated}
              disabled
              className="w-4 h-4 bg-[#081525] border border-[#00A0C0]/15 rounded-[2px] opacity-50"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F4F7FA] opacity-50">AI Generated</span>
              <span className="text-[9px] text-[#606060]">Populated by OpenAI LLM</span>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-[#00A0C0]/10">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] transition-colors text-xs font-bold uppercase tracking-wider rounded-[2px]"
          >
            <Save size={14} />
            {isEdit ? 'Save Changes' : 'Publish Product'}
          </button>
        </div>
      </div>
    </form>
  )
}
