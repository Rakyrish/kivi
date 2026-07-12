'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { INQUIRY_TYPES } from '@/lib/validation/contactSchema'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
]

const selectClass =
  'bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] px-3 py-2 text-xs rounded-[2px] focus:outline-none focus:border-[var(--kivi-cyan)]'

export default function InquiriesFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          defaultValue={searchParams.get('search') || ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateParam('search', (e.target as HTMLInputElement).value)
          }}
          onBlur={(e) => updateParam('search', e.target.value)}
          placeholder="Search name, email, company, reference..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-[2px] border focus:outline-none focus:border-[var(--kivi-cyan)]"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-input)', color: 'var(--text-primary)' }}
        />
      </div>

      <select
        defaultValue={searchParams.get('status') || ''}
        onChange={(e) => updateParam('status', e.target.value)}
        className={selectClass}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get('inquiry_type') || ''}
        onChange={(e) => updateParam('inquiry_type', e.target.value)}
        className={selectClass}
      >
        <option value="">All Inquiry Types</option>
        {INQUIRY_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
    </div>
  )
}
