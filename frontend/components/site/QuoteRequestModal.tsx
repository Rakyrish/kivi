'use client'

import React, { useState, useEffect } from 'react'
import { Product, SiteSetting } from '@/types'
import { api } from '@/lib/api'

interface QuoteRequestModalProps {
  product: Product
  onClose: () => void
}

export default function QuoteRequestModal({ product, onClose }: QuoteRequestModalProps) {
  const [settings, setSettings] = useState<SiteSetting | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: 'Kenya',
    quantity: '25kg (Standard Bag)',
    message: '',
    source_page: '',
    referrer: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    // Fetch site settings for standard weights if any
    api.getSettings()
      .then(res => setSettings(res))
      .catch(() => {});

    // Collect UTMs and client-side tracking details
    const searchParams = new URLSearchParams(window.location.search)
    setFormData(prev => ({
      ...prev,
      source_page: window.location.href,
      referrer: document.referrer || '',
      utm_source: searchParams.get('utm_source') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await api.submitContact({
        ...formData,
        product_interest: product.name,
        inquiry_type: 'quotation',
        subject: `Quote Request for ${product.name}`,
        message: `Requested quantity: ${formData.quantity}. Message: ${formData.message}`,
      } as any)

      await api.submitQuoteRequest({
        ...formData,
        product: product.id,
      })
      setSubmitStatus('success')
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pre-configured commercial shipping weights
  const defaultWeights = [
    '25kg (Standard Bag)',
    '50kg (Double Bag)',
    '250kg (10 x 25kg Bags)',
    '500kg (Half Tonne)',
    '1000kg (1 Metric Tonne Bulk Bag)',
    '5000kg (5 Metric Tonnes)',
    '10,000kg+ (Full Container Load / Contract)',
    '200L (Standard Drum)',
    '1000L (IBC Tote)',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-kivi-navy/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-kivi-white border border-kivi-gray-light rounded-kivi w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-card relative flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-kivi-gray-light bg-kivi-navy text-kivi-white flex justify-between items-center rounded-t-kivi">
          <div>
            <span className="text-xs uppercase tracking-widest text-kivi-cyan font-bold block mb-1">
              B2B PROCUREMENT DESK
            </span>
            <h3 className="text-lg font-display font-semibold">Request Commercial Quote</h3>
          </div>
          <button
            onClick={onClose}
            className="text-kivi-mid hover:text-kivi-white p-1 transition-all"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitStatus === 'success' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-kivi-success-bg border border-kivi-success text-kivi-success rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-display font-bold text-kivi-navy">Quote Request Received</h4>
            <p className="text-sm text-kivi-gray max-w-sm mx-auto">
              Thank you for requesting pricing for <strong>{product.name}</strong>. A technical sales representative will compile your quotation sheet and email it to you within 2 business hours.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-kivi-navy hover:bg-kivi-cyan text-kivi-white hover:text-kivi-navy font-semibold text-sm rounded-kivi transition-all"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
            {/* Product Meta Snapshot */}
            <div className="bg-kivi-slate/5 border border-kivi-cyan/10 p-3 rounded flex justify-between items-center text-xs">
              <div>
                <span className="text-kivi-gray block">Selected Product</span>
                <strong className="text-kivi-navy font-semibold text-sm">{product.name}</strong>
              </div>
              {product.chemical_formula && (
                <div className="text-right">
                  <span className="text-kivi-gray block">Formula</span>
                  <span className="font-mono text-kivi-cyan font-semibold">{product.chemical_formula}</span>
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-kivi-navy mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-kivi-gray-light bg-kivi-white px-3 py-2 text-sm rounded focus:outline-none focus:border-kivi-cyan text-kivi-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-kivi-navy mb-1">Business Email *</label>
                <input
                  type="email"
                  required
                  placeholder="procurement@company.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-kivi-gray-light bg-kivi-white px-3 py-2 text-sm rounded focus:outline-none focus:border-kivi-cyan text-kivi-navy"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-kivi-navy mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="East Africa Manufacturing Ltd"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full border border-kivi-gray-light bg-kivi-white px-3 py-2 text-sm rounded focus:outline-none focus:border-kivi-cyan text-kivi-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-kivi-navy mb-1">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+254 700 000 000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-kivi-gray-light bg-kivi-white px-3 py-2 text-sm rounded focus:outline-none focus:border-kivi-cyan text-kivi-navy"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-kivi-navy mb-1">Destination Country</label>
                <input
                  type="text"
                  placeholder="Kenya, Uganda, Rwanda..."
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full border border-kivi-gray-light bg-kivi-white px-3 py-2 text-sm rounded focus:outline-none focus:border-kivi-cyan text-kivi-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-kivi-navy mb-1">Target Quantity *</label>
                <select
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full border border-kivi-gray-light bg-kivi-white px-3 py-2 text-sm rounded focus:outline-none focus:border-kivi-cyan text-kivi-navy"
                >
                  {defaultWeights.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-kivi-navy mb-1">Specifications / Packaging Details</label>
              <textarea
                rows={3}
                placeholder="Mention specific purity needs, custom packaging labels, or scheduling requirements."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-kivi-gray-light bg-kivi-white px-3 py-2 text-sm rounded focus:outline-none focus:border-kivi-cyan text-kivi-navy"
              />
            </div>

            {submitStatus === 'error' && (
              <p className="text-xs text-kivi-error font-medium bg-kivi-error-bg p-2 rounded border border-kivi-error">
                Submission failed. Please check your network connection or try again.
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-kivi-cyan hover:bg-kivi-cyan-hover text-kivi-navy font-bold rounded-kivi transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-kivi-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing Inquiry...</span>
                </>
              ) : (
                <span>Submit Official RFQ</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
