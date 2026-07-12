'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Paperclip } from 'lucide-react'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
import { INQUIRY_TYPES } from '@/lib/validation/contactSchema'
import type { ContactSubmission, InquiryStatus } from '@/types'

const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
]

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  new: { bg: 'var(--kivi-cyan-muted)', color: 'var(--kivi-cyan)', border: 'var(--kivi-cyan)' },
  in_progress: { bg: 'var(--kivi-hazard-bg)', color: 'var(--kivi-hazard)', border: 'var(--kivi-hazard)' },
  replied: { bg: 'var(--kivi-success-bg)', color: 'var(--kivi-success)', border: 'var(--kivi-success)' },
  closed: { bg: 'var(--bg-card-alt)', color: 'var(--text-muted)', border: 'var(--border-divider)' },
}

function inquiryTypeLabel(value?: string) {
  return INQUIRY_TYPES.find((t) => t.value === value)?.label || 'General Inquiry'
}

function StatusBadge({ status }: { status?: string }) {
  const style = STATUS_STYLES[status || 'new'] || STATUS_STYLES.new
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
      style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
    >
      {STATUS_OPTIONS.find((s) => s.value === status)?.label || 'New'}
    </span>
  )
}

export default function InquiriesTable({ inquiries }: { inquiries: ContactSubmission[] }) {
  const [rows, setRows] = useState(inquiries)
  const [busyId, setBusyId] = useState<number | null>(null)

  const changeStatus = async (id: number | undefined, status: string) => {
    if (!id) return
    setBusyId(id)
    try {
      await api.updateInquiryStatus(id, status)
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as InquiryStatus } : r)))
    } catch {
      // no-op: table stays on previous status if the update failed
    } finally {
      setBusyId(null)
    }
  }

  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-xs rounded-[4px] border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)', color: 'var(--text-muted)' }}>
        No inquiries match your filters.
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border rounded-[4px] overflow-hidden shadow-lg" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" style={{ color: 'var(--text-secondary)' }}>
            <thead>
              <tr className="font-display uppercase tracking-wider text-[10px]" style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-divider)', color: 'var(--kivi-cyan)' }}>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Name &amp; Company</th>
                <th className="px-4 py-3">Inquiry Type</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inquiry) => (
                <tr key={inquiry.id} className="border-b transition-colors hover:bg-[var(--bg-table-row-alt)]" style={{ borderColor: 'var(--border-table)' }}>
                  <td className="px-4 py-3 font-mono" style={{ color: 'var(--kivi-cyan)' }}>
                    {inquiry.reference_number || '—'}
                    {inquiry.attachment_url && <Paperclip size={11} className="inline ml-1.5" style={{ color: 'var(--text-muted)' }} />}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>{inquiry.name}</div>
                    {inquiry.company_name && <div className="truncate" style={{ color: 'var(--text-muted)' }}>{inquiry.company_name}</div>}
                  </td>
                  <td className="px-4 py-3">{inquiryTypeLabel(inquiry.inquiry_type)}</td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <div className="truncate">{inquiry.email}</div>
                    {inquiry.phone && <div style={{ color: 'var(--text-muted)' }}>{inquiry.phone}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={inquiry.status} />
                      <select
                        value={inquiry.status || 'new'}
                        disabled={busyId === inquiry.id}
                        onChange={(e) => changeStatus(inquiry.id, e.target.value)}
                        className="text-[10px] bg-transparent border rounded-[2px] px-1 py-0.5"
                        style={{ borderColor: 'var(--border-input)', color: 'var(--text-secondary)' }}
                        aria-label={`Change status for ${inquiry.name}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3">{inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={ROUTES.admin.inquiryDetail(inquiry.id as number)} style={{ color: 'var(--kivi-cyan)' }} title="View inquiry">
                      <Eye size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {rows.map((inquiry) => (
          <div key={inquiry.id} className="rounded-[4px] border p-3 space-y-2" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{inquiry.name}</div>
                {inquiry.company_name && <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{inquiry.company_name}</div>}
              </div>
              <Link href={ROUTES.admin.inquiryDetail(inquiry.id as number)} style={{ color: 'var(--kivi-cyan)' }} title="View inquiry">
                <Eye size={14} />
              </Link>
            </div>
            <div className="text-[10px] font-mono" style={{ color: 'var(--kivi-cyan)' }}>{inquiry.reference_number}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{inquiryTypeLabel(inquiry.inquiry_type)}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{inquiry.email}</div>
            <div className="flex items-center justify-between">
              <StatusBadge status={inquiry.status} />
              <select
                value={inquiry.status || 'new'}
                disabled={busyId === inquiry.id}
                onChange={(e) => changeStatus(inquiry.id, e.target.value)}
                className="text-[10px] bg-transparent border rounded-[2px] px-1 py-0.5"
                style={{ borderColor: 'var(--border-input)', color: 'var(--text-secondary)' }}
                aria-label={`Change status for ${inquiry.name}`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
