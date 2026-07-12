import { Metadata } from 'next'
import { Suspense } from 'react'
import { buildMetadata } from '@/lib/seo'
import { SITE } from '@/lib/constants'
import { localBusinessSchema, contactPageSchema, breadcrumbSchema } from '@/lib/schema'
import SchemaMarkup from '@/components/site/SchemaMarkup'
import ContactForm from '@/components/site/ContactForm'
import ContactMethodCards from '@/components/site/ContactMethodCards'
import TrustIndicators from '@/components/site/TrustIndicators'

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

      {/* Hero */}
      <section className="bg-[#0D1B2A] py-16 md:py-20 text-[#F4F7FA] border-b border-[#00A0C0]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0]">Get In Touch</div>
          <h1 className="font-display font-black text-3xl md:text-5xl uppercase tracking-wide max-w-3xl">
            Get in Touch with Kivi Chemicals
          </h1>
          <p className="text-xs md:text-sm text-[#94A3B8] max-w-xl leading-relaxed">
            Our chemical specialists are ready to help with product inquiries, quotations, technical support, and
            recommendations tailored to your industry. Reach out and hear back within 24 business hours.
          </p>
          <div className="pt-2">
            <a
              href="/contact?type=quotation#inquiry-form"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#00A0C0] hover:bg-[#00A0E0] text-[#002040] font-bold text-xs uppercase tracking-wider rounded-[2px] transition-all"
            >
              Request a Quote
            </a>
          </div>
        </div>
      </section>

      {/* Contact Method Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <ContactMethodCards />
      </section>

      {/* Trust Indicators */}
      <section className="border-y" style={{ borderColor: 'var(--border-divider)', background: 'var(--bg-card-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <TrustIndicators />
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
