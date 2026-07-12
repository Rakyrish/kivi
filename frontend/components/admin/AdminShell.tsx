'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import { ROUTES } from '@/lib/constants'
import { Menu, X } from 'lucide-react'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  // On desktop (≥1024px) the sidebar is always visible inline.
  // On mobile/tablet it is an overlay that starts closed.
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Auth check
  useEffect(() => {
    const isLoginPage = pathname === ROUTES.admin.login || pathname.startsWith(`${ROUTES.admin.login}/`)

    if (isLoginPage) {
      setAuthorized(true)
      setIsChecking(false)
      return
    }

    const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/)
    const hasToken = Boolean(match?.[1])

    if (hasToken) {
      setAuthorized(true)
      setIsChecking(false)
      return
    }

    router.replace(ROUTES.admin.login)
  }, [pathname, router])

  // Detect desktop
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches)
      if (e.matches) setIsMobileOpen(false) // close overlay when resizing to desktop
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Close overlay when route changes (user tapped a nav link)
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  if (isChecking || !authorized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-admin)', color: 'var(--text-primary)' }}
      >
        <p className="text-sm uppercase tracking-[0.3em]" style={{ color: 'var(--kivi-cyan)' }}>
          Checking access&hellip;
        </p>
      </div>
    )
  }

  const isLoginPage = pathname === ROUTES.admin.login || pathname.startsWith(`${ROUTES.admin.login}/`)

  if (isLoginPage) {
    return (
      <div
        className="min-h-screen transition-colors duration-200"
        style={{ background: 'var(--bg-admin)', color: 'var(--text-primary)' }}
      >
        {children}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-admin)' }}>

      {/* ── Desktop sidebar (static, always visible ≥1024px) ── */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 min-h-screen border-r"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-divider)',
          color: 'var(--text-secondary)',
        }}
      >
        <Sidebar onClose={() => {}} />
      </aside>

      {/* ── Mobile overlay backdrop ── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* ── Mobile sidebar drawer ── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border-divider)',
          color: 'var(--text-secondary)',
        }}
        aria-hidden={!isMobileOpen}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-3 right-3 p-2 rounded-[2px] transition-all z-10"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        <Sidebar onClose={() => setIsMobileOpen(false)} />
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header
          className="flex items-center gap-3 px-4 py-3 border-b lg:hidden sticky top-0 z-30"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-divider)',
          }}
        >
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-[2px] border transition-all"
            style={{
              background: 'var(--bg-card-alt)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-primary)',
            }}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <span
            className="font-display font-black text-sm uppercase tracking-wider"
            style={{ color: 'var(--text-primary)' }}
          >
            Kivi Admin
          </span>
        </header>

        <main
          className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8"
          style={{ color: 'var(--text-primary)' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}