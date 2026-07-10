import { Metadata } from 'next'
import AdminShell from '@/components/admin/AdminShell'

// Admin pages are per-session/admin-token data and must never be statically prerendered/cached
export const dynamic = 'force-dynamic'

// Admin console must never appear in search results
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
