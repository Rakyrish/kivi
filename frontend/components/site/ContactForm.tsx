'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { Send, Loader2, CheckCircle2, Paperclip, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { contactFormSchema, ContactFormValues, INQUIRY_TYPES, validateAttachment } from '@/lib/validation/contactSchema'

const inputClass =
  'w-full bg-[var(--bg-input)] border border-[var(--border-input)] focus:border-[#00A0C0] text-[var(--text-primary)] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]'

export default function ContactForm() {
  const searchParams = useSearchParams()
  const initialType = (searchParams.get('type') as ContactFormValues['inquiry_type']) || 'general'

  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentError, setAttachmentError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const attribution = useRef({ source_page: '', referrer: '', utm_source: '', utm_medium: '', utm_campaign: '' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      company_name: '',
      email: '',
      phone: '',
      country: '',
      inquiry_type: INQUIRY_TYPES.some((t) => t.value === initialType) ? initialType : 'general',
      subject: '',
      message: '',
      product_interest: '',
      quantity: '',
    },
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    attribution.current = {
      source_page: window.location.href,
      referrer: document.referrer || '',
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setAttachment(null)
      setAttachmentError('')
      return
    }
    const error = validateAttachment(file)
    if (error) {
      setAttachmentError(error)
      setAttachment(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setAttachmentError('')
    setAttachment(file)
  }

  const removeAttachment = () => {
    setAttachment(null)
    setAttachmentError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (values: ContactFormValues) => {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value)
    })
    Object.entries(attribution.current).forEach(([key, value]) => {
      if (value) formData.append(key, value)
    })
    if (attachment) formData.append('attachment', attachment)
    formData.append('hp_field', honeypotRef.current?.value || '')

    try {
      await api.submitInquiry(formData)
      setSuccess(true)
      reset()
      removeAttachment()
      toast.success('Inquiry sent — our team will respond within a few hours.')
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div
      className="border p-6 md:p-8 rounded-[4px] shadow-xl"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
    >
      <h3 className="font-display font-black text-lg md:text-xl uppercase tracking-wider mb-2" style={{ color: 'var(--text-heading)' }}>
        Send Inquiry
      </h3>
      <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
        Fill out the form below. Our chemical sales engineers will respond within a few hours.
      </p>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center gap-4 py-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
            >
              <CheckCircle2 size={56} className="text-emerald-400" />
            </motion.div>
            <div>
              <p className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                Inquiry Sent Successfully
              </p>
              <p className="mt-2 text-xs max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                Thank you. We've received your inquiry and a specialist will review it shortly. A confirmation email with your reference number is on its way.
              </p>
            </div>
            <button
              onClick={() => setSuccess(false)}
              className="text-xs font-bold uppercase tracking-wider underline"
              style={{ color: 'var(--kivi-cyan)' }}
            >
              Send another inquiry
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Honeypot — hidden from real users, inert scaffold for Phase 2 anti-spam */}
            <input
              ref={honeypotRef}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
              name="hp_field"
              style={{ display: 'none' }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required error={errors.name?.message}>
                <input type="text" disabled={isSubmitting} className={inputClass} {...register('name')} />
              </Field>
              <Field label="Company Name" required error={errors.company_name?.message}>
                <input type="text" disabled={isSubmitting} className={inputClass} {...register('company_name')} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email Address" required error={errors.email?.message}>
                <input type="email" disabled={isSubmitting} className={inputClass} {...register('email')} />
              </Field>
              <Field label="Phone Number" required error={errors.phone?.message}>
                <input type="tel" disabled={isSubmitting} className={inputClass} {...register('phone')} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Country" required error={errors.country?.message}>
                <input type="text" disabled={isSubmitting} className={inputClass} {...register('country')} />
              </Field>
              <Field label="Inquiry Type" required error={errors.inquiry_type?.message}>
                <select disabled={isSubmitting} className={inputClass} {...register('inquiry_type')}>
                  {INQUIRY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Product Interested In (optional)">
                <input type="text" disabled={isSubmitting} className={inputClass} {...register('product_interest')} />
              </Field>
              <Field label="Quantity Needed (optional)">
                <input type="text" disabled={isSubmitting} className={inputClass} {...register('quantity')} />
              </Field>
            </div>

            <Field label="Subject" required error={errors.subject?.message}>
              <input type="text" disabled={isSubmitting} className={inputClass} {...register('subject')} />
            </Field>

            <Field label="Message" required error={errors.message?.message}>
              <textarea
                rows={4}
                disabled={isSubmitting}
                className={`${inputClass} resize-none h-32`}
                {...register('message')}
              />
            </Field>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
                Attachment (optional) — PDF, DOCX, XLSX, or image, max 5MB
              </label>
              {attachment ? (
                <div
                  className="flex items-center justify-between px-4 py-2.5 rounded-[2px] border text-xs"
                  style={{ borderColor: 'var(--border-input)', background: 'var(--bg-input)' }}
                >
                  <span className="flex items-center gap-2 truncate" style={{ color: 'var(--text-primary)' }}>
                    <Paperclip size={14} />
                    {attachment.name}
                  </span>
                  <button type="button" onClick={removeAttachment} aria-label="Remove attachment">
                    <X size={14} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              ) : (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                  disabled={isSubmitting}
                  onChange={handleFileChange}
                  className={`${inputClass} file:mr-3 file:py-1 file:px-3 file:rounded-[2px] file:border-0 file:text-xs file:font-bold file:uppercase file:bg-[var(--kivi-cyan)] file:text-[#002040]`}
                />
              )}
              {attachmentError && <p className="text-[11px] text-red-400">{attachmentError}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] disabled:bg-[#00A0C0]/50 disabled:text-[#002040]/50 transition-all font-bold text-xs uppercase tracking-wider rounded-[2px]"
            >
              {isSubmitting ? (
                <>
                  Sending Inquiry...
                  <Loader2 size={14} className="animate-spin" />
                </>
              ) : (
                <>
                  Send Inquiry
                  <Send size={14} />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  )
}
