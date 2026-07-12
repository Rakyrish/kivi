import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema, serviceSchema } from '@/lib/schema'
import { SITE, ROUTES } from '@/lib/constants'
import { SERVICES } from '@/lib/services'
import SchemaMarkup from '@/components/site/SchemaMarkup'

export const metadata: Metadata = buildMetadata({
  title: 'Our Services',
  description: 'Quality assurance, regulatory compliance, East Africa logistics, technical support, flexible packaging, and custom formulation services from Kivi Chemicals.',
  path: '/services',
})

export default function ServicesPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--text-muted)' }}>
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: 'Home', url: SITE.url },
          { name: 'Services', url: `${SITE.url}/services` },
        ])}
      />
      {SERVICES.map((service) => (
        <SchemaMarkup
          key={service.slug}
          schema={serviceSchema({ name: service.title, description: service.body, slug: service.slug })}
        />
      ))}

      {/* Hero */}
      <section className="bg-[#0D1B2A] py-20 text-[#F4F7FA] relative overflow-hidden border-b border-[#00A0C0]/15">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00A0C0_1px,transparent_1px),linear-gradient(to_bottom,#00A0C0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0]">Our Services</div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-wide max-w-3xl">
            More Than a Chemical Supplier
          </h1>
          <p className="text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
            Sourcing the right chemical is only part of the job. Here&apos;s what {SITE.name} handles around every order — from documentation to delivery to custom blending.
          </p>
        </div>
      </section>

      {/* Services list */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {SERVICES.map(({ slug, title, icon: Icon, body }) => (
            <div
              key={slug}
              id={slug}
              className="border rounded-[4px] p-8 scroll-mt-24"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 p-3 rounded-[2px]" style={{ background: 'var(--kivi-cyan-muted)' }}>
                  <Icon size={22} style={{ color: 'var(--kivi-cyan)' }} />
                </div>
                <div className="space-y-3 flex-1">
                  <h2 className="font-display font-black text-lg uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>
                    {title}
                  </h2>
                  <p className="text-xs leading-relaxed">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center border-t" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <h2 className="font-display font-black text-xl md:text-2xl uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>
            Ready to Request a Quote?
          </h2>
          <p className="text-xs leading-relaxed">
            Send your specification sheet or product list and our supply desk will respond with pricing and lead times.
          </p>
          <Link
            href={ROUTES.contact}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-all"
            style={{ background: 'var(--kivi-cyan)', color: 'var(--kivi-navy)' }}
          >
            Request a Quote <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}
