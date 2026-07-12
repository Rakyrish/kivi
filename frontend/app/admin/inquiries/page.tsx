import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
import InquiriesFilters from '@/components/admin/InquiriesFilters'
import InquiriesTable from '@/components/admin/InquiriesTable'
import AdminPagination from '@/components/admin/AdminPagination'
import type { ContactSubmission } from '@/types'

const PAGE_SIZE = 25

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; inquiry_type?: string }>
}) {
  let inquiries: ContactSubmission[] = []
  let count = 0
  let error: string | null = null

  const resolved = await searchParams
  const page = Math.max(1, parseInt(resolved?.page || '1', 10) || 1)
  const search = resolved?.search || ''
  const status = resolved?.status || ''
  const inquiryType = resolved?.inquiry_type || ''

  try {
    const res = await api.getInquiries(
      { page, page_size: PAGE_SIZE, search, status, inquiry_type: inquiryType },
      { forwardAuth: true }
    )
    inquiries = res.results || []
    count = res.count || 0
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load inquiries'
    console.error('AdminInquiriesPage: failed to load inquiries', err)
  }

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  const filterParams = new URLSearchParams()
  if (search) filterParams.set('search', search)
  if (status) filterParams.set('status', status)
  if (inquiryType) filterParams.set('inquiry_type', inquiryType)
  const filterQs = filterParams.toString()
  const basePath = `${ROUTES.admin.inquiries}${filterQs ? `?${filterQs}` : ''}`

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display font-black text-xl sm:text-2xl uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Inquiries</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{count} inquiries received</p>
      </div>

      <InquiriesFilters />

      {error && (
        <div className="px-4 py-3 text-xs rounded-[2px]" style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>
          Could not load inquiries: {error}
        </div>
      )}

      <InquiriesTable inquiries={inquiries} />

      <AdminPagination currentPage={page} totalPages={totalPages} basePath={basePath} />
    </div>
  )
}
