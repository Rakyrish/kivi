import { Beaker, FileText, MessageSquare, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Product, BlogPost } from '@/types'

export default async function AdminDashboardPage() {
  let productCount = 0
  let blogCount = 0

  try {
    const prods = await api.getProducts({ page_size: 1 })
    productCount = prods.count || 0
  } catch (_) {}

  try {
    const posts: BlogPost[] = await api.getBlogPosts()
    blogCount = posts.length || 0
  } catch (_) {}

  const stats = [
    { label: 'Total Products', value: productCount, icon: Beaker, href: '/admin/products', color: 'text-[#00A0C0]' },
    { label: 'Blog Posts', value: blogCount, icon: FileText, href: '/admin/blog', color: 'text-purple-400' },
  ]

  const quickActions = [
    { label: 'Add New Product', href: '/admin/products/new', icon: Beaker },
    { label: 'Write Blog Post', href: '/admin/blog/new', icon: FileText },
    { label: 'Django Admin', href: '/django-admin/', icon: MessageSquare, external: true },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl text-[#F4F7FA] uppercase tracking-wide">Dashboard</h1>
        <p className="text-xs text-[#606060] mt-1">Overview of your Kivi Chemicals digital presence.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="group bg-[#081525] border border-[#00A0C0]/15 hover:border-[#00A0C0] p-6 rounded-[4px] flex items-center justify-between transition-all"
          >
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#606060] mb-2">{label}</div>
              <div className={`font-display font-black text-4xl font-mono ${color}`}>{value}</div>
            </div>
            <div className={`${color} opacity-30 group-hover:opacity-70 transition-opacity`}>
              <Icon size={48} strokeWidth={1} />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display font-black text-sm uppercase tracking-wider text-[#F4F7FA] mb-4 border-b border-[#00A0C0]/10 pb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map(({ label, href, icon: Icon, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="flex items-center justify-between gap-3 px-5 py-4 bg-[#081525] border border-[#00A0C0]/15 hover:border-[#00A0C0] hover:bg-[#002040]/30 text-[#94A3B8] hover:text-[#F4F7FA] transition-all rounded-[4px] text-xs font-bold uppercase tracking-wider"
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-[#00A0C0]" />
                {label}
              </div>
              <ArrowUpRight size={14} className="opacity-40" />
            </Link>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#002040]/50 border border-[#00A0C0]/15 p-6 rounded-[4px] text-xs text-[#94A3B8] space-y-2">
        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#00A0C0]">AI Product Generator</h3>
        <p className="leading-relaxed">
          When adding new products, use the <strong className="text-[#F4F7FA]">AI Generate</strong> panel on the product form to auto-populate technical specifications, CAS numbers, safety data, and SEO meta tags using GPT-4o-mini. Review all AI-generated content before publishing.
        </p>
      </div>
    </div>
  )
}
