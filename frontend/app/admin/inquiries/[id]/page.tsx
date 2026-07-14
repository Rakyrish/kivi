import Link from 'next/link'
import { ArrowLeft, Paperclip } from 'lucide-react'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
import { INQUIRY_TYPES } from '@/lib/validation/contactSchema'
import InquiryStatusControl from '@/components/admin/InquiryStatusControl'
import InquiryReplyBox from '@/components/admin/InquiryReplyBox'

function inquiryTypeLabel(value?: string) {
  return INQUIRY_TYPES.find((t) => t.value === value)?.label || 'General Inquiry'
}

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const inquiry = await api.getInquiry(id, { forwardAuth: true })

  const fields: { label: string; value: string | undefined }[] = [
    { label: 'Full Name', value: inquiry.name },
    { label: 'Company', value: inquiry.company_name || 'Not provided' },
    { label: 'Email', value: inquiry.email },
    { label: 'Phone', value: inquiry.phone || 'Not provided' },
    { label: 'Country', value: inquiry.country || 'Not provided' },
    { label: 'Inquiry Type', value: inquiryTypeLabel(inquiry.inquiry_type) },
    { label: 'Product Interested In', value: inquiry.product_interest || 'Not specified' },
    { label: 'Quantity Needed', value: inquiry.quantity || 'Not specified' },
    { label: 'Subject', value: inquiry.subject },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href={ROUTES.admin.inquiries} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--kivi-cyan)' }}>
        <ArrowLeft size={14} /> Back to Inquiries
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest block mb-1" style={{ color: 'var(--kivi-cyan)' }}>
            {inquiry.reference_number}
          </span>
          <h1 className="font-display font-black text-xl uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
            {inquiry.name}
          </h1>
        </div>
        <InquiryStatusControl id={inquiry.id as number} initialStatus={inquiry.status || 'new'} />
      </div>

      <div className="theme-card p-6 rounded-[4px] grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.label}>
            <div className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</div>
            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{f.value}</div>
          </div>
        ))}
      </div>

      <div className="theme-card p-6 rounded-[4px]">
        <div className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Message</div>
        <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>{inquiry.message}</p>
      </div>

      {inquiry.attachment_url && (
        <div className="theme-card p-6 rounded-[4px]">
          <div className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Attachment</div>
          <a
            href={inquiry.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold"
            style={{ color: 'var(--kivi-cyan)' }}
          >
            <Paperclip size={14} />
            {inquiry.attachment_filename || 'Download attachment'}
          </a>
        </div>
      )}

      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
        Submitted: {inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : '—'}
      </div>

      <InquiryReplyBox id={inquiry.id as number} initialReplies={inquiry.replies || []} />
    </div>
  )
}
