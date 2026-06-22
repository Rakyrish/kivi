'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Beaker, FileText, Settings, LogOut, ArrowLeft } from 'lucide-react'
import { SITE } from '@/lib/constants'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Beaker },
    // Category management can be managed in Django-admin to keep frontend admin simple and focused on AI product content generation
    { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
  ]

  const handleLogout = () => {
    // Clear admin_token cookie
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/admin/login')
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-64 bg-[#081525] border-r border-[#00A0C0]/15 flex flex-col min-h-screen text-[#94A3B8]">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#00A0C0]/10 flex flex-col gap-1">
        <span className="font-display font-black text-lg text-[#F4F7FA] tracking-wider uppercase">
          {SITE.shortName} Admin
        </span>
        <span className="text-[9px] text-[#00A0C0] uppercase tracking-widest font-bold">
          Control Panel
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-grow p-4 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-bold transition-all rounded-[2px] ${
                isActive(link.href)
                  ? 'bg-[#00A0C0] text-[#002040]'
                  : 'hover:bg-[#002040]/50 hover:text-[#F4F7FA]'
              }`}
            >
              <Icon size={16} />
              {link.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-[#00A0C0]/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-bold hover:bg-[#002040]/30 hover:text-[#F4F7FA] transition-colors rounded-[2px]"
        >
          <ArrowLeft size={16} />
          View Website
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-bold hover:bg-red-950/40 hover:text-red-200 transition-colors text-left rounded-[2px]"
        >
          <LogOut size={16} className="text-red-400" />
          Logout
        </button>
      </div>
    </aside>
  )
}
