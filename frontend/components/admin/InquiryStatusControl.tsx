'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
]

export default function InquiryStatusControl({ id, initialStatus }: { id: number; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  const handleChange = async (value: string) => {
    setBusy(true)
    const previous = status
    setStatus(value)
    try {
      await api.updateInquiryStatus(id, value)
    } catch {
      setStatus(previous)
    } finally {
      setBusy(false)
    }
  }

  return (
    <select
      value={status}
      disabled={busy}
      onChange={(e) => handleChange(e.target.value)}
      className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-[2px] border"
      style={{ borderColor: 'var(--border-input)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
      aria-label="Change inquiry status"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}
