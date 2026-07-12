'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bot, Send, X, Phone, Mail, MessageCircle, FlaskConical } from 'lucide-react'
import { api } from '@/lib/api'
import { SITE } from '@/lib/constants'

interface RecommendedProduct {
  name: string
  slug: string
}

interface ChatEntry {
  role: 'user' | 'assistant'
  content: string
  products?: RecommendedProduct[]
  showContact?: boolean
}

const WELCOME: ChatEntry = {
  role: 'assistant',
  content:
    'Hello! I am Kivi Agent, your chemical sales and technical support specialist. Ask me about products, applications, safety, grades, or delivery across Kenya, Uganda, and Tanzania.',
}

function getSessionId(): string {
  const key = 'kivi-agent-session'
  let id = window.sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    window.sessionStorage.setItem(key, id)
  }
  return id
}

function ContactOptions() {
  const whatsappDigits = SITE.whatsapp.replace(/\D/g, '')
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {whatsappDigits && (
        <a
          href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hello Kivi Chemicals, I would like to enquire about a product.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-kivi bg-kivi-success-bg text-kivi-success border border-kivi-success hover:bg-kivi-success hover:text-kivi-white transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Contact Sales via WhatsApp
        </a>
      )}
      {SITE.phone && (
        <a
          href={`tel:${SITE.phone}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-kivi bg-kivi-cyan-muted text-kivi-cyan border border-kivi-cyan hover:bg-kivi-cyan hover:text-kivi-navy transition-all"
        >
          <Phone className="w-3.5 h-3.5" />
          Call Sales Team
        </a>
      )}
      {SITE.email && (
        <a
          href={`mailto:${SITE.email}?subject=${encodeURIComponent('Product Inquiry — Kivi Chemicals')}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-kivi bg-kivi-cyan-muted text-kivi-cyan border border-kivi-cyan hover:bg-kivi-cyan hover:text-kivi-navy transition-all"
        >
          <Mail className="w-3.5 h-3.5" />
          Send Email Inquiry
        </a>
      )}
    </div>
  )
}

export default function KiviAgentChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatEntry[]>([WELCOME])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isTyping) return

    const nextMessages: ChatEntry[] = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setIsTyping(true)

    try {
      const history = nextMessages
        .slice(-12)
        .map(m => ({ role: m.role, content: m.content }))
      const res = await api.askKiviAgent(text, getSessionId(), history.slice(0, -1))
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          products: res.recommended_products,
          showContact: res.show_contact_options,
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I could not reach our servers just now. Please try again in a moment, or contact our sales team directly.',
          showContact: true,
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div
      className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm flex flex-col rounded-kivi border border-kivi-gray-light bg-kivi-surface shadow-card overflow-hidden animate-fade-up"
      style={{ height: 'min(560px, calc(100vh - 8rem))' }}
      role="dialog"
      aria-label="Kivi Agent chat assistant"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-kivi-navy border-b border-kivi-gray-light">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-kivi-cyan flex items-center justify-center">
            <Bot className="w-5 h-5 text-kivi-navy" />
          </div>
          <div>
            <p className="text-sm font-display font-semibold text-kivi-white leading-tight">Kivi Agent</p>
            <p className="text-[11px] text-kivi-cyan leading-tight">Chemical Sales &amp; Technical Support</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="p-1.5 text-kivi-mid hover:text-kivi-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                m.role === 'user'
                  ? 'max-w-[85%] rounded-kivi rounded-br-none bg-kivi-cyan text-kivi-navy px-3.5 py-2.5 text-sm'
                  : 'max-w-[85%] rounded-kivi rounded-bl-none bg-kivi-navy text-kivi-white border border-kivi-gray-light px-3.5 py-2.5 text-sm'
              }
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>

              {m.products && m.products.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {m.products.map(p => (
                    <Link
                      key={p.slug}
                      href={`/products/${p.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-kivi bg-kivi-cyan-muted text-kivi-cyan border border-kivi-cyan hover:bg-kivi-cyan hover:text-kivi-navy transition-all"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      {p.name}
                    </Link>
                  ))}
                </div>
              )}

              {m.showContact && <ContactOptions />}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-kivi rounded-bl-none bg-kivi-navy border border-kivi-gray-light px-4 py-3">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-kivi-cyan animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-kivi-cyan animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-kivi-cyan animate-pulse [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 border-t border-kivi-gray-light bg-kivi-navy">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={1000}
          placeholder="Ask about products, safety, delivery..."
          aria-label="Type your message"
          className="flex-1 border border-kivi-gray-light bg-black/25 px-3 py-2 text-sm rounded-kivi focus:outline-none focus:border-kivi-cyan text-[var(--panel-text)] placeholder:text-[var(--panel-muted)]"
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          aria-label="Send message"
          className="p-2.5 bg-kivi-cyan hover:bg-kivi-cyan-hover text-kivi-navy rounded-kivi transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
