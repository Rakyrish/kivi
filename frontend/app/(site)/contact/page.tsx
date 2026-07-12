import { Metadata } from 'next'
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import { SITE } from '@/lib/constants'
import { localBusinessSchema, contactPageSchema, breadcrumbSchema } from '@/lib/schema'
import SchemaMarkup from '@/components/site/SchemaMarkup'
import ContactForm from '@/components/site/ContactForm'

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us',
  description: 'Get in touch with Kivi Industrial Chemicals. Request a quote, ask about product specs, or inquire about delivery in Kenya and East Africa.',
  path: '/contact',
})

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--text-muted)' }}>
      <SchemaMarkup schema={localBusinessSchema()} />
      <SchemaMarkup schema={contactPageSchema()} />
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: 'Home', url: SITE.url },
          { name: 'Contact', url: `${SITE.url}/contact` },
        ])}
      />
      {/* Header Banner */}
      <section className="bg-[#0D1B2A] py-16 text-[#F4F7FA] border-b border-[#00A0C0]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0]">Get In Touch</div>
          <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-wide">
            Contact Our Sales Desk
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-xl leading-relaxed">
            Request a quotation, ask about availability, or discuss custom delivery scheduling. Our chemical sales engineers are available Monday to Friday.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Details Sidebar */}
        <aside className="space-y-6 lg:col-span-1">
          <div>
            <h2 className="font-display font-black text-sm uppercase tracking-wider mb-6 border-l-2 border-[#00A0C0] pl-3" style={{ color: 'var(--text-heading)' }}>
              Contact Information
            </h2>
            <ul className="space-y-5 text-xs">
              <li className="flex items-start gap-4">
                <div className="bg-[#00A0C0]/10 text-[#00A0C0] p-2.5 rounded-sm flex-shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="font-bold uppercase text-[10px] tracking-wider mb-1" style={{ color: 'var(--text-heading)' }}>Physical Address</div>
                  <div className="leading-relaxed">{SITE.address}<br />{SITE.city}, {SITE.country}</div>
                </div>
              </li>

              {SITE.phone && (
                <li className="flex items-start gap-4">
                  <div className="bg-[#00A0C0]/10 text-[#00A0C0] p-2.5 rounded-sm flex-shrink-0">
                    <Phone size={16} />
                  </div>
                  <div>
                    <div className="font-bold uppercase text-[10px] tracking-wider mb-1" style={{ color: 'var(--text-heading)' }}>Phone / WhatsApp</div>
                    <a href={`tel:${SITE.phone}`} className="hover:text-[#00A0C0] transition-colors">{SITE.phone}</a>
                    {SITE.whatsapp && SITE.whatsapp !== SITE.phone && (
                      <div className="mt-1">
                        <a href={`tel:${SITE.whatsapp}`} className="hover:text-[#00A0C0] transition-colors">{SITE.whatsapp}</a>
                      </div>
                    )}
                  </div>
                </li>
              )}

              {SITE.email && (
                <li className="flex items-start gap-4">
                  <div className="bg-[#00A0C0]/10 text-[#00A0C0] p-2.5 rounded-sm flex-shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <div className="font-bold uppercase text-[10px] tracking-wider mb-1" style={{ color: 'var(--text-heading)' }}>Email</div>
                    <a href={`mailto:${SITE.email}`} className="hover:text-[#00A0C0] transition-colors break-all">{SITE.email}</a>
                  </div>
                </li>
              )}

              {SITE.openingHours && (
                <li className="flex items-start gap-4">
                  <div className="bg-[#00A0C0]/10 text-[#00A0C0] p-2.5 rounded-sm flex-shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="font-bold uppercase text-[10px] tracking-wider mb-1" style={{ color: 'var(--text-heading)' }}>Opening Hours</div>
                    <div className="leading-relaxed whitespace-pre-line">{SITE.openingHours}</div>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* WhatsApp CTA */}
          {SITE.whatsapp && (
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-4 bg-[#002040] border border-[#00A0C0]/20 hover:border-[#00A0C0] text-[#F4F7FA] hover:text-[#00A0C0] transition-all duration-300 rounded-[4px] text-xs font-bold uppercase tracking-wider"
            >
              <MessageSquare size={18} className="text-[#00A0C0]" />
              <span>Chat on WhatsApp</span>
            </a>
          )}
        </aside>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
