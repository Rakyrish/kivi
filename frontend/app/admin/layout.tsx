'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import { ROUTES } from '@/lib/constants'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

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

  if (isChecking || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-200" style={{ background: 'var(--bg-admin)', color: 'var(--text-primary)' }}>
        <p className="text-sm uppercase tracking-[0.3em]" style={{ color: 'var(--kivi-cyan)' }}>Checking access…</p>
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
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>
        {children}
      </main>
    </div>
  )
}

