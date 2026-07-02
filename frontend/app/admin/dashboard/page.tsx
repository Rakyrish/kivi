import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

export default function AdminDashboardRedirectPage() {
  redirect(ROUTES.admin.dashboard)
}
