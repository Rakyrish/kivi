'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Bot, Headset, Mail, MessageCircle, Phone, X } from 'lucide-react'
import { SITE } from '@/lib/constants'

// Chat panel is only downloaded when the visitor opens it — keeps the site bundle lean.
const KiviAgentChat = dynamic(() => import('./KiviAgentChat'), { ssr: false })

export default function FloatingContactCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const whatsappDigits = SITE.whatsapp.replace(/\D/g, '')

  const actions = [
    whatsappDigits && {
      key: 'whatsapp',
      label: 'WhatsApp Sales',
      href: `https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hello Kivi Chemicals, I would like to make an enquiry.')}`,
      external: true,
      icon: <MessageCircle className="w-5 h-5" />,
      className: 'bg-kivi-success text-kivi-white hover:brightness-110',
    },
    SITE.phone && {
      key: 'phone',
      label: 'Call Sales Team',
      href: `tel:${SITE.phone}`,
      external: false,
      icon: <Phone className="w-5 h-5" />,
      className: 'bg-kivi-navy text-kivi-white border border-kivi-cyan hover:bg-kivi-cyan hover:text-kivi-navy',
    },
    SITE.email && {
      key: 'email',
      label: 'Email Inquiry',
      href: `mailto:${SITE.email}?subject=${encodeURIComponent('Product Inquiry — Kivi Chemicals')}`,
      external: false,
      icon: <Mail className="w-5 h-5" />,
      className: 'bg-kivi-navy text-kivi-white border border-kivi-cyan hover:bg-kivi-cyan hover:text-kivi-navy',
    },
  ].filter(Boolean) as {
    key: string
    label: string
    href: string
    external: boolean
    icon: React.ReactNode
    className: string
  }[]

  const openChat = () => {
    setChatOpen(true)
    setIsOpen(false)
  }

  return (
    <>
      {chatOpen && <KiviAgentChat onClose={() => setChatOpen(false)} />}

      <div className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-3">
        {/* Expanded actions */}
        {isOpen && !chatOpen && (
          <div className="flex flex-col items-end gap-2.5 animate-fade-up">
            <button
              onClick={openChat}
              className="group flex items-center gap-2.5 pl-4 pr-3.5 py-2.5 rounded-full bg-kivi-cyan text-kivi-navy font-semibold text-sm shadow-card hover:bg-kivi-cyan-hover transition-all"
            >
              <span>Ask Kivi Agent</span>
              <Bot className="w-5 h-5" />
            </button>

            {actions.map(action => (
              <a
                key={action.key}
                href={action.href}
                {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={`flex items-center gap-2.5 pl-4 pr-3.5 py-2.5 rounded-full font-semibold text-sm shadow-card transition-all ${action.className}`}
              >
                <span>{action.label}</span>
                {action.icon}
              </a>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close contact options' : 'Open contact options'}
          className="w-14 h-14 rounded-full bg-kivi-cyan text-kivi-navy shadow-card hover:bg-kivi-cyan-hover hover:shadow-card-hover flex items-center justify-center transition-all"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Headset className="w-6 h-6" />}
        </button>
      </div>
    </>
  )
}
