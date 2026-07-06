'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
  Beaker, FileText, MessageSquare, ArrowUpRight, Shield, Activity,
  BarChart2, Cpu, CheckCircle, AlertTriangle, Eye, ShieldAlert,
  Search, RefreshCw, Key, Info, Package, AlertCircle, Sparkles,
  Bug, Bot, Send, TrendingUp, Warehouse, XCircle, Zap
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'

type TabType = 'overview' | 'seo' | 'inventory' | 'errors' | 'assistant' | 'security'

interface MetricsData {
  counts: {
    products: number
    categories: number
    blog_posts: number
    leads: number
    quote_requests: number
    contacts: number
    unresolved_errors?: number
  }
  trends: {
    pageviews_30d: number
    quotes_30d: number
    leads_30d: number
  }
  product_analytics: {
    most_viewed: Array<{ id: number; name: string; slug: string; view_count: number }>
    most_requested: Array<{ id: number; name: string; slug: string; quote_request_count: number }>
  }
  demographics: {
    devices: Array<{ device_type: string; count: number }>
    countries: Array<{ country: string; count: number }>
  }
  ai_stats: {
    total_calls: number
    success_calls: number
    failed_calls: number
    total_tokens: number
  }
  health: {
    db: string
    redis: string
    cloudinary: string
  }
  google_search_console: {
    clicks: number
    impressions: number
    average_position: number
    top_queries: Array<{ query: string; clicks: number; impressions: number }>
  }
  lighthouse?: {
    performance_score: number
    seo_score: number
    accessibility_score: number
    best_practices_score: number
    lcp: number
    cls: number
    fcp: number
    ttfb: number
  }
  inventory?: {
    total_active: number
    in_stock: number
    low_stock: number
    out_of_stock: number
    discontinued: number
    featured: number
    stock_rate: number
    total_valuation: number
  }
  security?: {
    active_admin_users: number
    new_users_7d: number
    failed_login_note: string
    rate_limit_note: string
  }
}

interface SystemError {
  id: number
  error_type: string
  status_code: number
  path: string
  source: string
  message: string
  status: string
  created_at: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface SEOAuditData {
  summary: {
    seo_score: number
    total_products: number
    total_posts: number
    total_indexed_pages: number
    total_issues: number
    sitemap_url: string
    sitemap_status: string
  }
  issues: Array<{ type: string; issue: string; count: number; severity: 'high' | 'medium' | 'low' }>
  recommendations: string[]
  product_audit: {
    missing_seo_title: number
    missing_seo_description: number
    missing_image: number
    missing_alt_text: number
    missing_keywords: number
    missing_short_description: number
    duplicate_titles: number
    duplicate_descriptions: number
  }
  blog_audit: {
    missing_seo_title: number
    missing_seo_description: number
    missing_image: number
    missing_summary: number
  }
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [seo, setSeo] = useState<SEOAuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  // Error Center
  const [sysErrors, setSysErrors] = useState<SystemError[]>([])
  const [errorsLoading, setErrorsLoading] = useState(false)
  const [resolvingAll, setResolvingAll] = useState(false)
  // AI Assistant
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your Kivi Chemicals AI Business Assistant. I have real-time access to inventory, errors, and analytics. How can I help you today?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const fetchData = async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        api.getDashboardMetrics<MetricsData>(),
        api.getSEOAudit<SEOAuditData>(),
      ])
      setMetrics(mRes)
      setSeo(sRes)
      setError(false)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (activeTab === 'errors' && sysErrors.length === 0) {
      setErrorsLoading(true)
      api.getSystemErrors().then((d: any) => {
        setSysErrors(d.results || d)
      }).catch(() => { }).finally(() => setErrorsLoading(false))
    }
  }, [activeTab])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleRefresh = () => { setRefreshing(true); fetchData() }

  const handleResolveError = async (id: number) => {
    await api.resolveSystemError(id)
    setSysErrors(prev => prev.map(e => e.id === id ? { ...e, status: 'resolved' } : e))
  }

  const handleResolveAll = async () => {
    setResolvingAll(true)
    await api.resolveAllSystemErrors()
    setSysErrors(prev => prev.map(e => ({ ...e, status: 'resolved' })))
    setResolvingAll(false)
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() }
    const newHistory = [...chatHistory, userMsg]
    setChatHistory(newHistory)
    setChatInput('')
    setChatLoading(true)
    try {
      const apiHistory = newHistory.slice(1).map(m => ({ role: m.role, content: m.content }))
      const res = await api.askAIAssistant(userMsg.content, apiHistory)
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.response }])
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <svg className="animate-spin h-10 w-10 text-[var(--kivi-cyan)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--text-secondary)' }}>
          Syncing Control Panel...
        </span>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="border p-6 rounded-[4px] text-white space-y-4" style={{ background: 'var(--kivi-error-bg)', borderColor: 'var(--kivi-error)' }}>
        <h2 className="font-display font-bold text-lg flex items-center gap-2" style={{ color: 'var(--kivi-error)' }}>
          <AlertTriangle /> Authorization Required
        </h2>
        <p className="text-sm">
          Please log in as an administrator to access the enterprise analytics portal.
        </p>
        <Link
          href="/admin/login"
          className="inline-flex px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-[2px]"
          style={{ background: 'var(--kivi-error)', color: '#FFFFFF' }}
        >
          Login
        </Link>
      </div>
    )
  }

  const quickActions = [
    { label: 'Add New Product', href: ROUTES.admin.productNew, icon: Beaker },
    { label: 'Write Blog Post', href: ROUTES.admin.blogNew, icon: FileText },
    { label: 'Django Admin Portal', href: ROUTES.admin.django, icon: Shield, external: true },
  ]

  return (
    <div className="space-y-6 animate-fade-in text-[var(--text-primary)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
            Enterprise Command Center
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Real-time analytics, background workers, and technical search positioning.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] border transition-all"
          style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-input)', background: 'var(--bg-input)' }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border-divider)' }}>
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'seo', label: 'SEO Audit', icon: Search },
          { id: 'inventory', label: 'Inventory', icon: Warehouse },
          { id: 'errors', label: 'Error Center', icon: Bug, badge: metrics?.counts.unresolved_errors },
          { id: 'assistant', label: 'AI Assistant', icon: Bot },
          { id: 'security', label: 'Security', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-[1px] transition-all relative"
              style={{
                borderColor: active ? 'var(--kivi-cyan)' : 'transparent',
                color: active ? 'var(--kivi-cyan)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={14} />
              {tab.label}
              {tab.badge ? (
                <span className="absolute -top-1 -right-1 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--kivi-error)', color: '#fff' }}>{tab.badge}</span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* ── 1. Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="theme-card p-6 rounded-[4px] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest block mb-1" style={{ color: 'var(--text-secondary)' }}>Active Catalogue</span>
                  <strong className="text-3xl font-mono" style={{ color: 'var(--text-primary)' }}>{metrics.counts.products} Products</strong>
                </div>
                <Beaker className="opacity-40 w-12 h-12" strokeWidth={1} style={{ color: 'var(--kivi-cyan)' }} />
              </div>

              <div className="theme-card p-6 rounded-[4px] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest block mb-1" style={{ color: 'var(--text-secondary)' }}>Commercial Leads</span>
                  <strong className="text-3xl font-mono" style={{ color: 'var(--kivi-cyan)' }}>{metrics.trends.quotes_30d} Quotes</strong>
                </div>
                <MessageSquare className="opacity-40 w-12 h-12" strokeWidth={1} style={{ color: 'var(--kivi-cyan)' }} />
              </div>

              <div className="theme-card p-6 rounded-[4px] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest block mb-1" style={{ color: 'var(--text-secondary)' }}>Total Views (30d)</span>
                  <strong className="text-3xl font-mono" style={{ color: 'var(--text-primary)' }}>{metrics.trends.pageviews_30d} Sessions</strong>
                </div>
                <BarChart2 className="opacity-40 w-12 h-12" strokeWidth={1} style={{ color: 'var(--kivi-cyan)' }} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Google Search Console */}
              <div className="theme-card p-6 rounded-[4px] lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--border-divider)' }}>
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--kivi-cyan)' }}>
                    <BarChart2 size={16} /> Google Search Console Metrics
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold" style={{ background: 'var(--kivi-cyan-muted)', color: 'var(--kivi-cyan)' }}>
                    Live API
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded" style={{ background: 'var(--bg-card-alt)' }}>
                    <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>Total Clicks</span>
                    <strong className="text-xl font-mono" style={{ color: 'var(--text-primary)' }}>{metrics.google_search_console.clicks}</strong>
                  </div>
                  <div className="p-3 rounded" style={{ background: 'var(--bg-card-alt)' }}>
                    <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>Impressions</span>
                    <strong className="text-xl font-mono" style={{ color: 'var(--text-primary)' }}>{metrics.google_search_console.impressions}</strong>
                  </div>
                  <div className="p-3 rounded" style={{ background: 'var(--bg-card-alt)' }}>
                    <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>Avg Position</span>
                    <strong className="text-xl font-mono" style={{ color: 'var(--kivi-cyan)' }}>{metrics.google_search_console.average_position}</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--text-secondary)' }}>Top Organic Keywords</span>
                  <div className="rounded overflow-hidden text-xs border" style={{ borderColor: 'var(--border-default)' }}>
                    <table className="w-full text-left">
                      <thead>
                        <tr style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-divider)' }}>
                          <th className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>Query</th>
                          <th className="px-3 py-2 text-center" style={{ color: 'var(--text-secondary)' }}>Clicks</th>
                          <th className="px-3 py-2 text-right" style={{ color: 'var(--text-secondary)' }}>Impressions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.google_search_console.top_queries.map((q, i) => (
                          <tr key={i} className="border-b" style={{ borderColor: 'var(--border-table)' }}>
                            <td className="px-3 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{q.query}</td>
                            <td className="px-3 py-2 text-center font-mono" style={{ color: 'var(--kivi-cyan)' }}>{q.clicks}</td>
                            <td className="px-3 py-2 text-right font-mono" style={{ color: 'var(--text-primary)' }}>{q.impressions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Service Health Panel */}
              <div className="theme-card p-6 rounded-[4px] space-y-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b pb-3" style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-divider)' }}>
                  <Activity size={16} /> Service Integrity
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded" style={{ background: 'var(--bg-card-alt)' }}>
                    <span>Database Connection</span>
                    {metrics.health.db === 'healthy' ? (
                      <span className="badge-in-stock px-2 py-0.5 rounded text-[10px] font-bold">ONLINE</span>
                    ) : (
                      <span className="badge-out-of-stock px-2 py-0.5 rounded text-[10px] font-bold">OFFLINE</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded" style={{ background: 'var(--bg-card-alt)' }}>
                    <span>Celery / Redis Broker</span>
                    {metrics.health.redis === 'healthy' ? (
                      <span className="badge-in-stock px-2 py-0.5 rounded text-[10px] font-bold">ONLINE</span>
                    ) : (
                      <span className="badge-out-of-stock px-2 py-0.5 rounded text-[10px] font-bold">OFFLINE</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded" style={{ background: 'var(--bg-card-alt)' }}>
                    <span>Cloudinary Storage</span>
                    {metrics.health.cloudinary === 'healthy' ? (
                      <span className="badge-in-stock px-2 py-0.5 rounded text-[10px] font-bold">ONLINE</span>
                    ) : (
                      <span className="badge-out-of-stock px-2 py-0.5 rounded text-[10px] font-bold">OFFLINE</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded text-xs space-y-2 border" style={{ background: 'var(--kivi-cyan-muted)', borderColor: 'var(--border-default)' }}>
                  <span className="font-bold block" style={{ color: 'var(--kivi-cyan)' }}>Background Scheduler</span>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Celery scheduler automates database-backed safety sheet generation and triggers AI newsletter generation twice weekly.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Automation */}
              <div className="theme-card p-6 rounded-[4px] space-y-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b pb-3" style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-divider)' }}>
                  <Cpu size={16} /> AI Automation Audit
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded" style={{ background: 'var(--bg-card-alt)' }}>
                    <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>AI Actions Logged</span>
                    <strong className="text-xl font-mono" style={{ color: 'var(--text-primary)' }}>{metrics.ai_stats.total_calls}</strong>
                  </div>
                  <div className="p-3 rounded" style={{ background: 'var(--bg-card-alt)' }}>
                    <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>Token Utilization</span>
                    <strong className="text-xl font-mono" style={{ color: 'var(--kivi-cyan)' }}>{metrics.ai_stats.total_tokens}</strong>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs px-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Accuracy / Success Rate</span>
                  <span className="font-bold font-mono" style={{ color: 'var(--kivi-success)' }}>
                    {metrics.ai_stats.total_calls > 0
                      ? `${Math.round((metrics.ai_stats.success_calls / metrics.ai_stats.total_calls) * 100)}%`
                      : '100%'}
                  </span>
                </div>
              </div>

              {/* Task Orchestration */}
              <div className="theme-card p-6 rounded-[4px] lg:col-span-2 space-y-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider border-b pb-3" style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-divider)' }}>
                  Task Orchestration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {quickActions.map(({ label, href, icon: Icon, external }) => (
                    <Link
                      key={label}
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-between gap-3 px-5 py-4 border hover:border-[var(--kivi-cyan)] text-xs font-bold uppercase tracking-wider rounded-[2px] transition-all"
                      style={{ background: 'var(--bg-card-alt)', borderColor: 'var(--border-card)' }}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} style={{ color: 'var(--kivi-cyan)' }} />
                        {label}
                      </span>
                      <ArrowUpRight size={14} className="opacity-40" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. SEO Control Tab ── */}
        {activeTab === 'seo' && seo && (
          <div className="space-y-6 animate-fade-in">
            {/* Score Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="theme-card p-6 rounded-[4px] text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>SEO Performance Score</span>
                <div className="text-4xl font-mono font-black" style={{ color: seo.summary.seo_score > 80 ? 'var(--kivi-success)' : 'var(--kivi-hazard)' }}>
                  {seo.summary.seo_score}/100
                </div>
              </div>

              <div className="theme-card p-6 rounded-[4px] text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>Indexed Catalogue Pages</span>
                <div className="text-3xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{seo.summary.total_indexed_pages}</div>
              </div>

              <div className="theme-card p-6 rounded-[4px] text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>Total Audit Warnings</span>
                <div className="text-3xl font-mono font-bold" style={{ color: seo.summary.total_issues > 0 ? 'var(--kivi-error)' : 'var(--kivi-success)' }}>
                  {seo.summary.total_issues} Issues
                </div>
              </div>

              <div className="theme-card p-6 rounded-[4px] text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>Sitemap Engine</span>
                <div className="text-sm font-bold uppercase" style={{ color: 'var(--kivi-cyan)' }}>
                  {seo.summary.sitemap_status}
                </div>
                <a
                  href={seo.summary.sitemap_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[9px] font-mono hover:underline mt-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  View XML <ArrowUpRight size={10} />
                </a>
              </div>
            </div>

            {/* Recommendations & Actionable Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Checklist list */}
              <div className="theme-card p-6 rounded-[4px] lg:col-span-2 space-y-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b pb-3" style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-divider)' }}>
                  <AlertCircle size={16} /> SEO Warnings & Actions
                </h3>

                {seo.issues.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded" style={{ background: 'var(--kivi-success-bg)', border: '1px solid var(--kivi-success)' }}>
                    <CheckCircle className="text-[var(--kivi-success)] flex-shrink-0" />
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>Perfect score. All products, category indexes, and blog resources meet SEO content validation rules.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {seo.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-[2px] text-xs"
                        style={{
                          background: issue.severity === 'high' ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)',
                          borderColor: issue.severity === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: issue.severity === 'high' ? 'var(--kivi-error)' : 'var(--kivi-hazard)' }}
                          />
                          <div>
                            <div className="font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-primary)' }}>{issue.type}: {issue.issue}</div>
                            <div className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>Found {issue.count} occurrences in backend DB scan.</div>
                          </div>
                        </div>
                        <span
                          className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-[2px]"
                          style={{
                            background: issue.severity === 'high' ? 'var(--kivi-error-bg)' : 'var(--kivi-hazard-bg)',
                            color: issue.severity === 'high' ? 'var(--kivi-error)' : 'var(--kivi-hazard)',
                          }}
                        >
                          {issue.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Recommendations */}
              <div className="theme-card p-6 rounded-[4px] space-y-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b pb-3" style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-divider)' }}>
                  <Sparkles size={16} /> Suggestions
                </h3>
                {seo.recommendations.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No suggestions available at this time. All pages optimized.</p>
                ) : (
                  <ul className="space-y-3 text-xs leading-relaxed">
                    {seo.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-[var(--kivi-cyan)] mt-0.5">•</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{rec}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── 3. Inventory Tab ── */}
        {activeTab === 'inventory' && metrics?.inventory && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Stock Rate', value: `${metrics.inventory.stock_rate}%`, color: 'var(--kivi-success)' },
                { label: 'In-Stock', value: metrics.inventory.in_stock, color: 'var(--text-primary)' },
                { label: 'Low Stock', value: metrics.inventory.low_stock, color: 'var(--kivi-hazard)' },
                { label: 'Out of Stock', value: metrics.inventory.out_of_stock, color: 'var(--kivi-error)' },
              ].map(s => (
                <div key={s.label} className="theme-card p-5 rounded-[4px] text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                  <div className="text-3xl font-mono font-bold" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="theme-card p-5 rounded-[4px] text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest block mb-1" style={{ color: 'var(--text-secondary)' }}>Total Catalogue</span>
                <div className="text-2xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{metrics.inventory.total_active}</div>
              </div>
              <div className="theme-card p-5 rounded-[4px] text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest block mb-1" style={{ color: 'var(--text-secondary)' }}>Discontinued</span>
                <div className="text-2xl font-mono font-bold" style={{ color: 'var(--text-muted)' }}>{metrics.inventory.discontinued}</div>
              </div>
              <div className="theme-card p-5 rounded-[4px] text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest block mb-1" style={{ color: 'var(--text-secondary)' }}>Stock Valuation</span>
                <div className="text-2xl font-mono font-bold" style={{ color: 'var(--kivi-cyan)' }}>KES {metrics.inventory.total_valuation.toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="theme-card p-6 rounded-[4px] space-y-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b pb-3" style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-divider)' }}>
                  <Eye size={16} /> Most Viewed Chemicals
                </h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-divider)' }}>
                      <th className="px-3 py-2 text-left" style={{ color: 'var(--text-secondary)' }}>Chemical</th>
                      <th className="px-3 py-2 text-right" style={{ color: 'var(--text-secondary)' }}>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.product_analytics.most_viewed.slice(0, 5).map((p, i) => (
                      <tr key={i} className="border-b" style={{ borderColor: 'var(--border-table)' }}>
                        <td className="px-3 py-2" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                        <td className="px-3 py-2 text-right font-mono" style={{ color: 'var(--kivi-cyan)' }}>{p.view_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="theme-card p-6 rounded-[4px] space-y-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b pb-3" style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-divider)' }}>
                  <MessageSquare size={16} /> Procurement Demand
                </h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-divider)' }}>
                      <th className="px-3 py-2 text-left" style={{ color: 'var(--text-secondary)' }}>Chemical</th>
                      <th className="px-3 py-2 text-right" style={{ color: 'var(--text-secondary)' }}>Quotes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.product_analytics.most_requested.slice(0, 5).map((p, i) => (
                      <tr key={i} className="border-b" style={{ borderColor: 'var(--border-table)' }}>
                        <td className="px-3 py-2" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                        <td className="px-3 py-2 text-right font-mono animate-pulse" style={{ color: 'var(--kivi-cyan)' }}>{p.quote_request_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. Error Center Tab ── */}
        {activeTab === 'errors' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bug size={18} style={{ color: 'var(--kivi-error)' }} />
                <h2 className="font-display font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>System Error Log</h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: 'var(--kivi-error-bg)', color: 'var(--kivi-error)' }}>
                  {sysErrors.filter(e => e.status === 'unresolved').length} Unresolved
                </span>
              </div>
              <button
                onClick={handleResolveAll}
                disabled={resolvingAll}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-all"
                style={{ background: 'var(--kivi-success-bg)', color: 'var(--kivi-success)', border: '1px solid var(--kivi-success)' }}
              >
                {resolvingAll ? 'Resolving...' : 'Resolve All'}
              </button>
            </div>

            {errorsLoading ? (
              <div className="flex items-center justify-center py-12"><RefreshCw className="animate-spin" style={{ color: 'var(--kivi-cyan)' }} /></div>
            ) : sysErrors.length === 0 ? (
              <div className="theme-card p-10 rounded-[4px] flex flex-col items-center gap-3 text-center">
                <CheckCircle size={40} style={{ color: 'var(--kivi-success)' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No system errors logged</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>The error logging middleware has found no 4xx/5xx events.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sysErrors.map(err => (
                  <div key={err.id} className="theme-card p-4 rounded-[4px] flex items-start justify-between gap-4"
                    style={{ opacity: err.status === 'resolved' ? 0.5 : 1 }}>
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-[10px] font-mono px-2 py-1 rounded mt-0.5 flex-shrink-0 font-bold"
                        style={{ background: err.status_code >= 500 ? 'var(--kivi-error-bg)' : 'var(--kivi-hazard-bg)', color: err.status_code >= 500 ? 'var(--kivi-error)' : 'var(--kivi-hazard)' }}>
                        {err.status_code || err.error_type?.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{err.path || err.source}</div>
                        <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{err.message}</div>
                        <div className="text-[10px] mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>{new Date(err.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                    {err.status !== 'resolved' && (
                      <button onClick={() => handleResolveError(err.id)}
                        className="flex-shrink-0 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider"
                        style={{ background: 'var(--kivi-success-bg)', color: 'var(--kivi-success)', border: '1px solid var(--kivi-success)' }}>
                        Resolve
                      </button>
                    )}
                    {err.status === 'resolved' && (
                      <CheckCircle size={14} className="flex-shrink-0 mt-1" style={{ color: 'var(--kivi-success)' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 5. AI Business Assistant Tab ── */}
        {activeTab === 'assistant' && (
          <div className="animate-fade-in" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-3 pb-4 border-b mb-4" style={{ borderColor: 'var(--border-divider)' }}>
              <Bot size={20} style={{ color: 'var(--kivi-cyan)' }} />
              <div>
                <h2 className="font-display font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Kivi AI Business Assistant</h2>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Context-aware: inventory, errors, analytics — all live from the database.</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ minHeight: 0 }}>
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: msg.role === 'user' ? 'var(--kivi-cyan)' : 'var(--bg-card-alt)', border: '1px solid var(--border-card)' }}>
                    {msg.role === 'user' ? <span className="text-[10px] font-black text-white">U</span> : <Bot size={12} style={{ color: 'var(--kivi-cyan)' }} />}
                  </div>
                  <div className="max-w-[80%] rounded-[4px] px-4 py-3 text-xs leading-relaxed"
                    style={{
                      background: msg.role === 'user' ? 'var(--kivi-cyan)' : 'var(--bg-card)',
                      color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border-card)'
                    }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-card)' }}>
                    <Bot size={12} style={{ color: 'var(--kivi-cyan)' }} />
                  </div>
                  <div className="px-4 py-3 rounded-[4px] text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 pt-4 border-t mt-4" style={{ borderColor: 'var(--border-divider)' }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask about inventory, errors, revenue, content..." disabled={chatLoading}
                className="flex-1 px-4 py-2.5 text-xs rounded-[2px] outline-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
              />
              <button onClick={handleSendChat} disabled={chatLoading || !chatInput.trim()}
                className="px-4 py-2.5 rounded-[2px] flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
                style={{ background: 'var(--kivi-cyan)', color: '#fff', opacity: chatLoading || !chatInput.trim() ? 0.5 : 1 }}>
                <Send size={13} /> Send
              </button>
            </div>
          </div>
        )}

        {/* ── 6. Security Tab ── */}
        {activeTab === 'security' && metrics?.security && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="theme-card p-6 rounded-[4px] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest block mb-1" style={{ color: 'var(--text-secondary)' }}>Active Admin Sessions</span>
                  <strong className="text-2xl font-mono" style={{ color: 'var(--text-primary)' }}>{metrics.security.active_admin_users} Accounts</strong>
                </div>
                <Key className="opacity-40 w-10 h-10" style={{ color: 'var(--kivi-cyan)' }} />
              </div>
              <div className="theme-card p-6 rounded-[4px] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest block mb-1" style={{ color: 'var(--text-secondary)' }}>New User Activity (7d)</span>
                  <strong className="text-2xl font-mono" style={{ color: 'var(--text-primary)' }}>{metrics.security.new_users_7d} Users</strong>
                </div>
                <CheckCircle className="opacity-40 w-10 h-10" style={{ color: 'var(--kivi-success)' }} />
              </div>
            </div>
            <div className="theme-card p-6 rounded-[4px] space-y-4">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b pb-3" style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-divider)' }}>
                <ShieldAlert size={16} /> Security &amp; System Audit Log
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-4 border rounded-[2px] flex items-start gap-3" style={{ background: 'var(--bg-card-alt)', borderColor: 'var(--border-card)' }}>
                  <Info size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--kivi-cyan)' }} />
                  <div>
                    <div className="font-bold uppercase tracking-wider text-[10px]">API Security Throttling</div>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{metrics.security.rate_limit_note}</p>
                  </div>
                </div>
                <div className="p-4 border rounded-[2px] flex items-start gap-3" style={{ background: 'var(--bg-card-alt)', borderColor: 'var(--border-card)' }}>
                  <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--kivi-hazard)' }} />
                  <div>
                    <div className="font-bold uppercase tracking-wider text-[10px]">Login Monitoring</div>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{metrics.security.failed_login_note}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
