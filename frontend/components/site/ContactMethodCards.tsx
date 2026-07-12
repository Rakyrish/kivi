import { Mail, Phone, MessageCircle, MapPin, Clock } from 'lucide-react'
import { SITE } from '@/lib/constants'

export default function ContactMethodCards() {
  const cards = [
    SITE.email && {
      icon: Mail,
      label: 'Email',
      value: SITE.email,
      href: `mailto:${SITE.email}`,
    },
    SITE.phone && {
      icon: Phone,
      label: 'Phone',
      value: SITE.phone,
      href: `tel:${SITE.phone}`,
    },
    SITE.whatsapp && {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: SITE.whatsapp,
      href: `https://wa.me/${SITE.whatsapp}`,
      external: true,
    },
    (SITE.address || SITE.city) && {
      icon: MapPin,
      label: 'Office Location',
      value: `${SITE.address ? `${SITE.address}, ` : ''}${SITE.city}, ${SITE.country}`,
    },
    SITE.openingHours && {
      icon: Clock,
      label: 'Business Hours',
      value: SITE.openingHours,
    },
  ].filter(Boolean) as {
    icon: typeof Mail
    label: string
    value: string
    href?: string
    external?: boolean
  }[]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const content = (
          <div
            className="h-full flex flex-col gap-3 p-5 rounded-[4px] border transition-all duration-300"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)', boxShadow: 'var(--shadow-card)' }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center rounded-[4px]"
              style={{ background: 'var(--kivi-cyan-muted)', color: 'var(--kivi-cyan)' }}
            >
              <Icon size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-heading)' }}>
                {card.label}
              </div>
              <div className="text-xs leading-relaxed whitespace-pre-line break-words" style={{ color: 'var(--text-secondary)' }}>
                {card.value}
              </div>
            </div>
          </div>
        )

        if (!card.href) {
          return (
            <div key={card.label}>{content}</div>
          )
        }

        return (
          <a
            key={card.label}
            href={card.href}
            target={card.external ? '_blank' : undefined}
            rel={card.external ? 'noopener noreferrer' : undefined}
            className="hover:-translate-y-0.5 transition-transform duration-300 block"
          >
            {content}
          </a>
        )
      })}
    </div>
  )
}
