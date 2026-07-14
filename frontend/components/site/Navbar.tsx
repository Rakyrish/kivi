'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu, X, ArrowRight, ChevronDown, FlaskConical, Droplets, Zap,
  Leaf, Building2, TestTubes, Package, Waves, Phone, Mail
} from 'lucide-react'
import { ROUTES, SITE } from '@/lib/constants'
import { api } from '@/lib/api'
import GlobalSearch from './GlobalSearch'
import ThemeToggle from './ThemeToggle'
import type { Category, Product } from '@/types'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  default: FlaskConical,
  solvent: Droplets,
  acid: Zap,
  agriculture: Leaf,
  industrial: Building2,
  lab: TestTubes,
  packaging: Package,
  water: Waves,
}

function getCategoryIcon(name: string): React.ElementType {
  const lower = name.toLowerCase()
  if (lower.includes('solvent')) return Droplets
  if (lower.includes('acid')) return Zap
  if (lower.includes('agri') || lower.includes('fertiliz')) return Leaf
  if (lower.includes('water') || lower.includes('treatment')) return Waves
  if (lower.includes('lab')) return TestTubes
  return FlaskConical
}

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: ROUTES.products, hasMega: true },
  { name: 'Industries', href: ROUTES.industries },
  { name: 'Services', href: ROUTES.services },
  { name: 'Blog', href: ROUTES.blog },
  { name: 'About', href: ROUTES.about },
  { name: 'Contact', href: ROUTES.contact },
]

const INDUSTRIES = [
  'Water Treatment', 'Manufacturing', 'Food Processing',
  'Agriculture', 'Mining', 'Construction', 'Hospitality', 'Laboratories',
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const megaRef = useRef<HTMLDivElement>(null)
  const megaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    Promise.allSettled([
      api.getCategories(),
      api.getFeaturedProducts(),
    ]).then(([catResult, prodResult]) => {
      if (catResult.status === 'fulfilled') setCategories(catResult.value || [])
      if (prodResult.status === 'fulfilled') setFeaturedProducts((prodResult.value || []).slice(0, 4))
    })
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMegaOpen(false)
  }, [pathname])

  const openMega = () => {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current)
    setMegaOpen(true)
  }
  const closeMega = () => {
    megaTimerRef.current = setTimeout(() => setMegaOpen(false), 120)
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={`site-header sticky top-0 z-50 backdrop-blur-md transition-all duration-300 ${
        scrolled ? 'shadow-lg' : ''
      }`}
      style={{ borderBottom: '1px solid var(--border-nav)', background: 'var(--bg-nav)' }}
    >
      {/* ── Utility Bar ── */}
      <div className="hidden lg:block" style={{ borderBottom: '1px solid var(--border-divider)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-9 text-[11px]">
            <span className="justify-self-start uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
              {SITE.tagline}
            </span>
            <div className="justify-self-center hidden xl:flex items-center gap-3">
              <span className="h-px w-6" style={{ background: 'var(--kivi-cyan)' }} />
              <span
                className="uppercase tracking-[0.3em] font-black text-[10px] whitespace-nowrap"
                style={{ color: 'var(--text-primary)' }}
              >
                Kivi Chemicals <span style={{ color: 'var(--kivi-cyan)' }}>Ltd</span>
              </span>
              <span className="h-px w-6" style={{ background: 'var(--kivi-cyan)' }} />
            </div>
            <div className="justify-self-end flex items-center gap-5" style={{ color: 'var(--text-secondary)' }}>
              {SITE.email && (
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--kivi-cyan)]"
                >
                  <Mail size={12} />
                  {SITE.email}
                </a>
              )}
              {SITE.phone && (
                <a
                  href={`tel:${SITE.phone}`}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--kivi-cyan)]"
                >
                  <Phone size={12} />
                  {SITE.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-[76px]">

          {/* ── Logo ── */}
          <div className="flex-shrink-0">
            <Link href={ROUTES.home} className="flex items-center group" aria-label={`${SITE.shortName} home`}>
              <div className="h-11 px-3 flex items-center rounded-[3px] border border-[var(--border-input)] bg-white shadow-sm transition-all duration-300 group-hover:border-[var(--kivi-cyan)]">
                <Image
                  src="/logo-horizontal.png"
                  alt="Kivi Chemicals Logo"
                  width={1600}
                  height={454}
                  className="h-7 w-auto object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* ── Desktop Navigation ── */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-1">
            {NAV_LINKS.map((link) => {
              if (link.hasMega) {
                return (
                  <div
                    key={link.name}
                    ref={megaRef}
                    className="relative"
                    onMouseEnter={openMega}
                    onMouseLeave={closeMega}
                  >
                    <button
                      className={`flex items-center gap-1 px-3 py-2 text-sm rounded-[2px] transition-colors ${
                        isActive(link.href) ? 'font-bold' : ''
                      }`}
                      style={{ color: isActive(link.href) ? 'var(--text-nav-active)' : 'var(--text-nav)' }}
                      aria-haspopup="true"
                      aria-expanded={megaOpen}
                    >
                      {link.name}
                      <ChevronDown size={14} className={`transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Mega Menu Panel */}
                    {megaOpen && (
                      <div
                        className="mega-menu-panel absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[780px] max-w-[calc(100vw-2rem)] rounded-[4px] p-0 overflow-hidden animate-fade-in z-50"
                        onMouseEnter={openMega}
                        onMouseLeave={closeMega}
                      >
                        <div className="grid grid-cols-5">
                          {/* Left: Categories */}
                          <div className="col-span-2 p-5 border-r" style={{ borderColor: 'var(--border-divider)' }}>
                            <div className="overline mb-3">Chemical Categories</div>
                            <div className="space-y-1">
                              {categories.slice(0, 8).map((cat) => {
                                const Icon = getCategoryIcon(cat.name)
                                return (
                                  <Link
                                    key={cat.id}
                                    href={`${ROUTES.categories}/${cat.slug}`}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-[2px] text-sm transition-colors group/cat"
                                    style={{ color: 'var(--text-secondary)' }}
                                  >
                                    <Icon size={14} className="flex-shrink-0 transition-colors" style={{ color: 'var(--kivi-cyan)' }} />
                                    <span className="truncate group-hover/cat:text-[var(--kivi-cyan)] transition-colors">{cat.name}</span>
                                    <span className="ml-auto text-[10px] font-mono font-bold flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                                      {cat.product_count || 0}
                                    </span>
                                  </Link>
                                )
                              })}
                              <Link
                                href={ROUTES.products}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors mt-2 pt-2"
                                style={{ color: 'var(--kivi-cyan)', borderTop: '1px solid var(--border-divider)' }}
                              >
                                View All Products <ArrowRight size={12} />
                              </Link>
                            </div>
                          </div>

                          {/* Right: Featured Products */}
                          <div className="col-span-3 p-5">
                            <div className="overline mb-3">Featured Chemicals</div>
                            <div className="grid grid-cols-2 gap-3">
                              {featuredProducts.map((product) => (
                                <Link
                                  key={product.id}
                                  href={`${ROUTES.products}/${product.slug}`}
                                  className="flex items-start gap-3 p-3 rounded-[3px] border transition-all group/prod"
                                  style={{ background: 'var(--bg-page)', borderColor: 'var(--border-card)' }}
                                >
                                  <div className="flex-shrink-0 w-9 h-9 rounded-[2px] flex items-center justify-center" style={{ background: 'var(--kivi-cyan-muted)' }}>
                                    <FlaskConical size={16} style={{ color: 'var(--kivi-cyan)' }} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold truncate group-hover/prod:text-[var(--kivi-cyan)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                                      {product.name}
                                    </div>
                                    <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--kivi-cyan)' }}>
                                      {product.chemical_formula || product.category_name || '—'}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>

                            {/* Industries strip */}
                            <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-divider)' }}>
                              <div className="overline mb-2">Industries Served</div>
                              <div className="flex flex-wrap gap-1.5">
                                {INDUSTRIES.slice(0, 5).map((ind) => (
                                  <Link
                                    key={ind}
                                    href={`${ROUTES.products}?industry=${encodeURIComponent(ind)}`}
                                    className="text-[10px] px-2 py-1 rounded-[2px] border transition-colors"
                                    style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-default)', background: 'var(--bg-page)' }}
                                  >
                                    {ind}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 text-sm rounded-[2px] transition-colors ${isActive(link.href) ? 'font-bold' : ''}`}
                  style={{ color: isActive(link.href) ? 'var(--text-nav-active)' : 'var(--text-nav)' }}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>

          {/* ── Desktop Actions ── */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <GlobalSearch />
            <ThemeToggle />
            <Link
              href={ROUTES.contact}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider font-bold rounded-[2px] transition-all duration-300"
              style={{ background: 'var(--kivi-cyan)', color: '#002040' }}
            >
              Request Quote
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* ── Mobile Toolbar ── */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center p-2 rounded-[2px] focus:outline-none transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t" style={{ background: 'var(--bg-dropdown)', borderColor: 'var(--border-nav)' }}>
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => {
              if (link.hasMega) {
                return (
                  <div key={link.name}>
                    <button
                      onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-[2px] text-sm font-medium transition-colors"
                      style={{ color: 'var(--text-primary)', background: isActive(link.href) ? 'var(--kivi-cyan-muted)' : 'transparent' }}
                    >
                      {link.name}
                      <ChevronDown size={16} className={`transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {mobileProductsOpen && (
                      <div className="ml-3 mt-1 space-y-1 border-l pl-3" style={{ borderColor: 'var(--border-divider)' }}>
                        <div className="overline pt-1 pb-2">Categories</div>
                        {categories.slice(0, 8).map((cat) => {
                          const Icon = getCategoryIcon(cat.name)
                          return (
                            <Link
                              key={cat.id}
                              href={`${ROUTES.categories}/${cat.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-2 px-2 py-2 text-sm rounded-[2px] transition-colors"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              <Icon size={13} style={{ color: 'var(--kivi-cyan)' }} />
                              {cat.name}
                            </Link>
                          )
                        })}
                        <Link
                          href={ROUTES.products}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-2 py-2 text-xs font-bold uppercase tracking-wider"
                          style={{ color: 'var(--kivi-cyan)' }}
                        >
                          All Products <ArrowRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 rounded-[2px] text-sm font-medium transition-colors"
                  style={{
                    color: isActive(link.href) ? 'var(--text-nav-active)' : 'var(--text-primary)',
                    background: isActive(link.href) ? 'var(--kivi-cyan-muted)' : 'transparent',
                  }}
                >
                  {link.name}
                </Link>
              )
            })}

            <div className="pt-3 mt-3 space-y-2" style={{ borderTop: '1px solid var(--border-divider)' }}>
              {SITE.phone && (
                <a
                  href={`tel:${SITE.phone}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold rounded-[2px] border transition-all"
                  style={{ color: 'var(--kivi-cyan)', borderColor: 'var(--kivi-cyan)', background: 'var(--kivi-cyan-muted)' }}
                >
                  <Phone size={15} />
                  {SITE.phone}
                </a>
              )}
              <Link
                href={ROUTES.contact}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold uppercase tracking-wider rounded-[2px] transition-all"
                style={{ background: 'var(--kivi-cyan)', color: '#002040' }}
              >
                Request Quote <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
