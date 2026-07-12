'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import { ROUTES } from '@/lib/constants'
import { Menu } from 'lucide-react'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' && window.innerWidth > 768)

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsSidebarOpen(window.innerWidth > 768)
      }
      window.addEventListener('resize', handleResize)
      // Initialize on mount
      setIsSidebarOpen(window.innerWidth > 768)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (isChecking || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-200" style={{ background: 'var(--bg-admin)', color: 'var(--text-primary)' }}>
        <p className="text-sm uppercase tracking-[0.3em]" style={{ color: 'var(--kivi-cyan)' }}>Checking access&hellip;</p>
      </div>
    )
  }

  const isLoginPage = pathname === ROUTES.admin.login || pathname.startsWith(`${ROUTES.admin.login}/`)

  if (isLoginPage) {
    return (
      <div className="min-h-screen transition-colors duration-200" style={{ background: 'var(--bg-admin)', color: 'var(--text-primary)' }}>
        {children}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen transition-colors duration-200" style={{ background: 'var(--bg-admin)' }}>
      {!isLoginPage && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-50 p-2 rounded-[2px] border transition-all hover:border-[var(--kivi-cyan)]"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
          title="Open menu"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}
      {!isLoginPage && (
        <aside
          className={`w-64 shrink-0 transition-transform duration-300 ${!isSidebarOpen && '-translate-x-full'} border-r flex flex-col min-h-screen transition-colors duration-200`}
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-divider)',
            color: 'var(--text-secondary)'
          }}
        >
          <Sidebar />
        </aside>
      )}
      <main className="flex-1 overflow-auto transition-colors duration-200" style={{ color: 'var(--text-primary)', padding: isSidebarOpen ? 'p-8' : 'p-4' }}>
        {children}
      </main>
    </div>
  )
}