'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    subject: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all required fields.')
      setLoading(false)
      return
    }

    try {
      await api.submitContact(formData)
      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        subject: '',
        message: '',
      })
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border p-6 md:p-8 rounded-[4px] shadow-xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}>
      <h3 className="font-display font-black text-lg md:text-xl uppercase tracking-wider mb-2" style={{ color: 'var(--text-heading)' }}>
        Send Inquiry
      </h3>
      <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
        Fill out the form below. Our chemical sales engineers will respond within 24 hours.
      </p>

      {success && (
        <div className="mb-6 flex items-start gap-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 p-4 rounded-[2px] text-xs">
          <CheckCircle size={18} className="flex-shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <p className="font-bold">Inquiry Sent Successfully!</p>
            <p className="mt-1">Thank you. We have received your inquiry and will contact you shortly.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-950/60 border border-red-500/30 text-red-200 p-4 rounded-[2px] text-xs">
          <AlertTriangle size={18} className="flex-shrink-0 text-red-400 mt-0.5" />
          <div>
            <p className="font-bold">Submission Failed</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] focus:border-[#00A0C0] text-[var(--text-primary)] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] focus:border-[#00A0C0] text-[var(--text-primary)] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="phone" className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] focus:border-[#00A0C0] text-[var(--text-primary)] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="company_name" className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
              Company Name
            </label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] focus:border-[#00A0C0] text-[var(--text-primary)] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="subject" className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
            Subject / Chemical Required <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] focus:border-[#00A0C0] text-[var(--text-primary)] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="message" className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
            Message details (specification, volume, delivery timeline) <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] focus:border-[#00A0C0] text-[var(--text-primary)] px-4 py-2.5 text-xs focus:outline-none transition-colors rounded-[2px] resize-none h-32"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] disabled:bg-[#00A0C0]/50 disabled:text-[#002040]/50 transition-all font-bold text-xs uppercase tracking-wider rounded-[2px]"
        >
          {loading ? (
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
      </form>
    </div>
  )
}
