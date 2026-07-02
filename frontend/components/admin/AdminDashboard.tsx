'use client'

import React, { useEffect, useState } from 'react'
import {
  Beaker, FileText, MessageSquare, ArrowUpRight, Shield, Activity,
  BarChart2, Cpu, CheckCircle, AlertTriangle, Eye, ShieldAlert,
  Search, RefreshCw, Key, Info, Package, AlertCircle, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'

type TabType = 'overview' | 'seo' | 'inventory' | 'security'

interface MetricsData {
  counts: {
    products: number
    categories: number
    blog_posts: number
    leads: number
    quote_requests: number
    contacts: number
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
    status: string
    clicks: number
    impressions: number
    average_position: number
    top_queries: Array<{ query: string; clicks: number; impressions: number }>
  }
  inventory?: {
    total_active: number
    in_stock: number
    out_of_stock: number
    featured: number
    high_demand: number
    stock_rate: number
  }
  security?: {
    active_admin_users: number
    new_users_7d: number
    failed_login_note: string
    rate_limit_note: string
  }
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

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
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
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'security', label: 'Security', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-[1px] transition-all"
              style={{
                borderColor: active ? 'var(--kivi-cyan)' : 'transparent',
                color: active ? 'var(--kivi-cyan)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={14} />
              {tab.label}
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
        {activeTab === 'inventory' && metrics.inventory && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="theme-card p-6 rounded-[4px] text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>Stock Availability Rate</span>
                <div className="text-3xl font-mono font-bold" style={{ color: 'var(--kivi-success)' }}>{metrics.inventory.stock_rate}%</div>
              </div>
              <div className="theme-card p-6 rounded-[4px] text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>In-Stock Formulations</span>
                <div className="text-3xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{metrics.inventory.in_stock}</div>
              </div>
              <div className="theme-card p-6 rounded-[4px] text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm Supply Required</span>
                <div className="text-3xl font-mono font-bold" style={{ color: 'var(--kivi-hazard)' }}>{metrics.inventory.out_of_stock}</div>
              </div>
              <div className="theme-card p-6 rounded-[4px] text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>High Demand / Active Inquiries</span>
                <div className="text-3xl font-mono font-bold animate-pulse" style={{ color: 'var(--kivi-cyan)' }}>
                  {metrics.inventory.high_demand} Items
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* High Traffic Chemicals */}
              <div className="theme-card p-6 rounded-[4px] space-y-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b pb-3" style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-divider)' }}>
                  <Eye size={16} /> Most Viewed Chemicals
                </h3>
                <div className="rounded overflow-hidden text-xs border" style={{ borderColor: 'var(--border-default)' }}>
                  <table className="w-full text-left">
                    <thead>
                      <tr style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-divider)' }}>
                        <th className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>Chemical Formula</th>
                        <th className="px-3 py-2 text-right" style={{ color: 'var(--text-secondary)' }}>Views Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.product_analytics.most_viewed.slice(0, 5).map((p, idx) => (
                        <tr key={idx} className="border-b" style={{ borderColor: 'var(--border-table)' }}>
                          <td className="px-3 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                          <td className="px-3 py-2 text-right font-mono" style={{ color: 'var(--kivi-cyan)' }}>{p.view_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* High Quote Request Chemicals */}
              <div className="theme-card p-6 rounded-[4px] space-y-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b pb-3" style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--border-divider)' }}>
                  <MessageSquare size={16} /> Procurement Demand Leaderboard
                </h3>
                <div className="rounded overflow-hidden text-xs border" style={{ borderColor: 'var(--border-default)' }}>
                  <table className="w-full text-left">
                    <thead>
                      <tr style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-divider)' }}>
                        <th className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>Chemical Name</th>
                        <th className="px-3 py-2 text-right" style={{ color: 'var(--text-secondary)' }}>Quotes Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.product_analytics.most_requested.slice(0, 5).map((p, idx) => (
                        <tr key={idx} className="border-b" style={{ borderColor: 'var(--border-table)' }}>
                          <td className="px-3 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                          <td className="px-3 py-2 text-right font-mono animate-pulse" style={{ color: 'var(--kivi-cyan)' }}>{p.quote_request_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. Security Tab ── */}
        {activeTab === 'security' && metrics.security && (
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
                <ShieldAlert size={16} /> Security & System Audit Log
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
