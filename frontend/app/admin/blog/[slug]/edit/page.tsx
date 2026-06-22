'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

function getCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

export default function EditBlogPostPage() {
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}/`,
          { headers: { Authorization: `Token ${getCookie('admin_token')}` } }
        )
        if (!res.ok) throw new Error('Failed to load post')
        const data = await res.json()
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          summary: data.summary || '',
          content: data.content || '',
          image: data.image || '',
          is_published: data.is_published || false,
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || '',
          keywords: data.keywords || '',
        })
      } catch {
        setErrorMsg('Failed to load post data.')
      } finally {
        setLoading(false)
      }
    }
    if (slug) load()
  }, [slug])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setForm((prev) => ({ ...prev, [name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${getCookie('admin_token')}`,
          },
          body: JSON.stringify(form),
        }
      )
      if (!res.ok) throw new Error(await res.text())
      setSuccessMsg('Post updated successfully!')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update post.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#00A0C0]">
        <Loader2 size={24} className="animate-spin mr-3" />
        <span className="text-xs uppercase font-bold tracking-wider">Loading post...</span>
      </div>
    )
  }

  const seoTitleCount = form.seo_title.length
  const seoDescCount = form.seo_description.length

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display font-black text-2xl text-[#F4F7FA] uppercase tracking-wide">Edit Blog Post</h1>
        <p className="text-xs text-[#606060] mt-1 font-mono">/{slug}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#081525] border border-[#00A0C0]/15 p-6 md:p-8 rounded-[4px] shadow-lg space-y-6 text-[#F4F7FA]">
        {successMsg && (
          <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 p-4 rounded-[2px] text-xs">
            <CheckCircle size={16} className="text-emerald-400" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-3 bg-red-950/60 border border-red-500/30 text-red-200 p-4 rounded-[2px] text-xs">
            <AlertCircle size={16} className="text-red-400" /> {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">Title</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required disabled={saving}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">Slug</label>
            <input type="text" name="slug" value={form.slug} onChange={handleChange} disabled={saving}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px] font-mono" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">Summary</label>
          <textarea name="summary" value={form.summary} onChange={handleChange} disabled={saving}
            className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px] h-24 resize-none" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">Content</label>
          <textarea name="content" value={form.content} onChange={handleChange} disabled={saving}
            className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-3 text-xs focus:outline-none transition-colors rounded-[2px] h-80 resize-y" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">Cover Image URL</label>
          <input type="url" name="image" value={form.image} onChange={handleChange} disabled={saving}
            className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]" />
        </div>

        <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#F4F7FA] border-b border-[#00A0C0]/10 pt-2 pb-3">SEO Meta Tags</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060]">SEO Title</label>
              <span className={`text-[10px] font-mono ${seoTitleCount > 60 ? 'text-red-400' : 'text-[#606060]'}`}>{seoTitleCount}/60</span>
            </div>
            <input type="text" name="seo_title" value={form.seo_title} onChange={handleChange} maxLength={60} disabled={saving}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">Keywords</label>
            <input type="text" name="keywords" value={form.keywords} onChange={handleChange} disabled={saving}
              className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#606060]">SEO Description</label>
            <span className={`text-[10px] font-mono ${seoDescCount > 160 ? 'text-red-400' : 'text-[#606060]'}`}>{seoDescCount}/160</span>
          </div>
          <input type="text" name="seo_description" value={form.seo_description} onChange={handleChange} maxLength={160} disabled={saving}
            className="w-full bg-[#002040]/30 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]" />
        </div>

        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} disabled={saving}
            className="w-4 h-4 accent-[#00A0C0] rounded-[2px]" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#F4F7FA]">Published</span>
            <span className="text-[9px] text-[#606060]">Uncheck to revert to draft</span>
          </div>
        </label>

        <div className="flex justify-end pt-4 border-t border-[#00A0C0]/10">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] disabled:opacity-60 transition-colors text-xs font-bold uppercase tracking-wider rounded-[2px]">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
