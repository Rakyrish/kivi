'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { api } from '@/lib/api'
import { InquiryReply } from '@/types'

export default function InquiryReplyBox({ id, initialReplies }: { id: number; initialReplies: InquiryReply[] }) {
  const router = useRouter()
  const [replies, setReplies] = useState<InquiryReply[]>(initialReplies)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    setError('')
    setSent(false)
    try {
      const reply = await api.replyToInquiry(id, message.trim())
      setReplies((prev) => [...prev, reply])
      setMessage('')
      setSent(true)
      router.refresh()
    } catch {
      setError('Failed to send reply. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="theme-card p-6 rounded-[4px] space-y-4">
      <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Replies {replies.length > 0 && `(${replies.length})`}
      </div>

      {replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((r) => (
            <div key={r.id} className="p-3 rounded-[2px]" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-divider)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--kivi-cyan)' }}>{r.created_by_name}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>{r.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a reply to the customer... it will be emailed to them from info@kivichemicals.com"
          rows={4}
          disabled={sending}
          className="w-full px-3 py-2 text-sm rounded-[2px] border focus:outline-none focus:border-[var(--kivi-cyan)]"
          style={{ borderColor: 'var(--border-input)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
        />
        {error && <div className="text-xs" style={{ color: 'var(--kivi-error)' }}>{error}</div>}
        {sent && <div className="text-xs" style={{ color: 'var(--kivi-cyan)' }}>Reply sent.</div>}
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 transition-colors text-xs font-bold uppercase tracking-wider rounded-[2px] disabled:opacity-60"
          style={{ background: 'var(--kivi-cyan)', color: '#002040', boxShadow: 'var(--shadow-glow-cyan)' }}
        >
          <Send size={14} />
          {sending ? 'Sending...' : 'Send Reply'}
        </button>
      </div>
    </div>
  )
}
