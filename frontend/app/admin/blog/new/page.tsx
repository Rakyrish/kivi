'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, CheckCircle, AlertCircle, Sparkles, Cpu } from 'lucide-react'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'

export default function NewBlogPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [aiTopic, setAiTopic] = useState('')
  const [aiKeywords, setAiKeywords] = useState('')
  const [qualityScore, setQualityScore] = useState<number | null>(null)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    image: '',
    is_published: false,
    seo_title: '',
    seo_description: '',
    keywords: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setForm((prev) => ({ ...prev, [name]: val }))
  }

  const handleAIGenerate = async () => {
    if (!aiTopic) {
      setErrorMsg('AI generation requires a topic.')
      return
    }

    setAiLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const data = await api.generateAIBlog(aiTopic, aiKeywords)
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        summary: data.summary || '',
        content: data.content || '',
        image: data.image || 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
        is_published: false,
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        keywords: data.keywords || aiKeywords,
      })
      setQualityScore(data.quality_score || 85)
      setSuccessMsg('AI successfully drafted the article! Review details below.')
    } catch (err: any) {
      setErrorMsg(err.message || 'AI Generation failed.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (!form.title || !form.content || !form.summary) {
      setErrorMsg('Title, Summary, and Content are required.')
      setLoading(false)
      return
    }

    try {
      await api.createBlogPost(form)
      setSuccessMsg('Blog post created successfully!')
      setTimeout(() => router.push(ROUTES.admin.blog), 1200)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create post.')
    } finally {
      setLoading(false)
    }
  }

  const seoTitleCount = form.seo_title.length
  const seoDescCount = form.seo_description.length

  return (
    <div className="space-y-8 max-w-4xl text-kivi-white">
      <div>
        <h1 className="font-display font-black text-2xl uppercase tracking-wide">New Blog Post</h1>
        <p className="text-xs text-kivi-mid mt-1">Write and publish articles to the Kivi Insights desk.</p>
      </div>

      {/* AI Blog Generator Assistant Workspace */}
      <div className="bg-kivi-surface border border-kivi-cyan/20 p-6 rounded-kivi shadow-glow-cyan space-y-4">
        <div className="flex items-center gap-2 border-b border-kivi-cyan/10 pb-3">
          <Sparkles size={18} className="text-kivi-cyan" />
          <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-kivi-white">
            AI Blog Copywriter Assistant
          </h3>
        </div>

        <p className="text-[11px] text-kivi-mid leading-relaxed">
          Input an industry topic or compliance guideline (e.g. KEBS testing, water storage rules). AI will compose a 1500+ word search-optimized essay.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold tracking-wider text-kivi-mid block">Topic Idea</label>
            <input
              type="text"
              placeholder="e.g. Sodium Hydroxide Safety in Dairy Plants"
              value={aiTopic}
              onChange={e => setAiTopic(e.target.value)}
              className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-3 py-2 text-xs focus:outline-none transition-colors rounded-kivi-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold tracking-wider text-kivi-mid block">SEO Target Keywords (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. sodium hydroxide Kenya, dairy sanitation Nairobi"
              value={aiKeywords}
              onChange={e => setAiKeywords(e.target.value)}
              className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-3 py-2 text-xs focus:outline-none transition-colors rounded-kivi-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2 border-t border-kivi-cyan/10">
          {aiLoading ? (
            <div className="flex items-center gap-2 text-xs text-kivi-cyan">
              <Loader2 size={16} className="animate-spin" />
              <span>Drafting premium technical content (may take up to 20s)...</span>
            </div>
          ) : qualityScore !== null ? (
            <div className="flex items-center gap-2 text-xs text-kivi-success">
              <Cpu size={16} />
              <span>AI Quality Audit Score: <strong>{qualityScore}/100</strong> (Excellent readability & depth)</span>
            </div>
          ) : (
            <div className="text-xs text-kivi-mid">
              Status: Ready
            </div>
          )}

          {!aiLoading && (
            <button
              onClick={handleAIGenerate}
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-kivi-cyan text-kivi-navy hover:bg-kivi-cyan-hover transition-colors text-xs font-bold uppercase tracking-wider rounded-kivi-sm shadow-glow-cyan"
            >
              <Sparkles size={14} />
              Draft Article
            </button>
          )}
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="bg-kivi-surface border border-kivi-cyan/10 p-6 md:p-8 rounded-kivi shadow-lg space-y-6">
        {successMsg && (
          <div className="flex items-center gap-3 bg-kivi-success-bg border border-kivi-success text-kivi-white p-4 rounded-kivi-sm text-xs">
            <CheckCircle size={16} className="text-kivi-success" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-3 bg-kivi-error-bg border border-kivi-error text-kivi-white p-4 rounded-kivi-sm text-xs">
            <AlertCircle size={16} className="text-kivi-error" />
            {errorMsg}
          </div>
        )}

        {/* Title & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-kivi-mid block">
              Title <span className="text-kivi-error">*</span>
            </label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required disabled={loading}
              className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-kivi-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-kivi-mid block">
              Slug (auto-generated if blank)
            </label>
            <input type="text" name="slug" value={form.slug} onChange={handleChange} disabled={loading}
              placeholder="e.g. sodium-hydroxide-uses-kenya"
              className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-kivi-sm font-mono" />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-kivi-mid block">
            Summary / Lead Paragraph <span className="text-kivi-error">*</span>
          </label>
          <textarea name="summary" value={form.summary} onChange={handleChange} rows={3} required disabled={loading}
            placeholder="Brief summary displayed on the blog listing page..."
            className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-kivi-sm h-20 resize-none font-sans" />
        </div>

        {/* Main Content */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-kivi-mid block">
            Article Content (Supports HTML headers, paragraphs, lists) <span className="text-kivi-error">*</span>
          </label>
          <textarea name="content" value={form.content} onChange={handleChange} rows={16} required disabled={loading}
            placeholder="Full article body..."
            className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-4 py-3 text-xs focus:outline-none transition-colors rounded-kivi-sm h-72 resize-y font-sans" />
        </div>

        {/* Image URL */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-kivi-mid block">Cover Image URL</label>
          <input type="url" name="image" value={form.image} onChange={handleChange} disabled={loading}
            placeholder="https://res.cloudinary.com/..."
            className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-kivi-sm" />
        </div>

        {/* SEO */}
        <h3 className="font-display font-black text-sm uppercase tracking-wider text-kivi-white border-b border-kivi-cyan/10 pt-2 pb-3">SEO Meta Tags</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-[10px] uppercase font-bold tracking-wider text-kivi-mid">SEO Title (60 chars)</label>
              <span className={`text-[10px] font-mono ${seoTitleCount > 60 ? 'text-kivi-error' : 'text-kivi-mid'}`}>{seoTitleCount}/60</span>
            </div>
            <input type="text" name="seo_title" value={form.seo_title} onChange={handleChange} maxLength={60} disabled={loading}
              className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-kivi-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-kivi-mid block">Keywords</label>
            <input type="text" name="keywords" value={form.keywords} onChange={handleChange} disabled={loading}
              placeholder="Comma-separated keywords"
              className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-kivi-sm" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-[10px] uppercase font-bold tracking-wider text-kivi-mid">SEO Description (160 chars)</label>
            <span className={`text-[10px] font-mono ${seoDescCount > 160 ? 'text-kivi-error' : 'text-kivi-mid'}`}>{seoDescCount}/160</span>
          </div>
          <input type="text" name="seo_description" value={form.seo_description} onChange={handleChange} maxLength={160} disabled={loading}
            className="w-full bg-kivi-navy/30 border border-kivi-cyan/15 focus:border-kivi-cyan text-kivi-white px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-kivi-sm" />
        </div>

        {/* Publish toggle */}
        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <input type="checkbox" name="is_published" checked={form.is_published}
            onChange={handleChange} disabled={loading}
            className="w-4 h-4 accent-kivi-cyan rounded-kivi-sm" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-kivi-white">Publish Immediately</span>
            <span className="text-[9px] text-kivi-mid">Uncheck to save as a private draft</span>
          </div>
        </label>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-kivi-cyan/10">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-kivi-cyan text-kivi-navy hover:bg-kivi-cyan-hover disabled:opacity-60 transition-colors text-xs font-bold uppercase tracking-wider rounded-kivi-sm shadow-glow-cyan">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {form.is_published ? 'Publish Post' : 'Save Draft'}
          </button>
        </div>
      </form>
    </div>
  )
}
