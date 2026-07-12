'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Beaker, FileText, Inbox, LogOut, ArrowLeft } from 'lucide-react'
import { ROUTES, SITE } from '@/lib/constants'
import ThemeToggle from '@/components/site/ThemeToggle'

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { name: 'Dashboard', href: ROUTES.admin.dashboard, icon: LayoutDashboard },
    { name: 'Products', href: ROUTES.admin.products, icon: Beaker },
    { name: 'Inquiries', href: ROUTES.admin.inquiries, icon: Inbox },
    // Category management can be managed in Django-admin to keep frontend admin simple
    { name: 'Blog Posts', href: ROUTES.admin.blog, icon: FileText },
  ]

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push(ROUTES.admin.login)
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b flex flex-col gap-1" style={{ borderColor: 'var(--border-divider)' }}>
        <span className="font-display font-black text-lg tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>
          {SITE.shortName} Admin
        </span>
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--kivi-cyan)' }}>
          Control Panel
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-grow p-4 space-y-1" role="navigation" aria-label="Admin navigation">
        {links.map((link) => {
          const Icon = link.icon
          const active = isActive(link.href)
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-bold transition-all rounded-[2px]"
              style={{
                background: active ? 'var(--kivi-cyan)' : 'transparent',
                color: active ? '#002040' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--bg-card-alt)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <Icon size={16} />
              {link.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Actions */}
      <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--border-divider)' }}>
        <div
          className="flex items-center justify-between px-4 py-1.5 border border-dashed rounded-[2px] mb-2"
          style={{ borderColor: 'var(--border-divider)' }}
        >
          <span className="text-[10px] uppercase font-black tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Theme Mode
          </span>
          <ThemeToggle />
        </div>
        <Link
          href={ROUTES.home}
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-bold transition-colors rounded-[2px]"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-card-alt)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          <ArrowLeft size={16} />
          View Website
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-bold hover:bg-red-500/10 hover:text-red-600 transition-colors text-left rounded-[2px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <LogOut size={16} className="text-red-500" />
          Logout
        </button>
      </div>
    </div>
  )
}
