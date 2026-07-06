import Link from 'next/link'
import {
  Award, ShieldCheck, Truck, Headphones, Mail, Phone, MapPin,
  Layers, FlaskConical, Wrench, PackageCheck, MessageSquare,
  Droplets, Zap, Leaf, Building2, TestTubes, Waves, Beaker,
  ArrowRight, CheckCircle, Star
} from 'lucide-react'
import { Metadata } from 'next'
import { SITE } from '@/lib/constants'
import { api } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import { organizationSchema, websiteSchema, localBusinessSchema } from '@/lib/schema'
import HeroSection from '@/components/site/HeroSection'
import FeaturedProducts from '@/components/site/FeaturedProducts'
import SchemaMarkup from '@/components/site/SchemaMarkup'
import type { Product, Category } from '@/types'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({
  description: SITE.description || `${SITE.name} supplies verified-quality industrial chemicals, solvents, and specialty formulations to manufacturers across Kenya and East Africa.`,
  path: '',
})

async function getData() {
  let featuredProducts: Product[] = []
  let categories: Category[] = []
  try { featuredProducts = (await api.getFeaturedProducts()) || [] } catch {}
  try { categories = (await api.getCategories()) || [] } catch {}
  return { featuredProducts, categories }
}

const INDUSTRIES = [
  { name: 'Water Treatment', icon: Waves, description: 'Coagulants, flocculants, pH adjusters, and disinfectants for municipal and industrial water systems.' },
  { name: 'Manufacturing', icon: Building2, description: 'Industrial solvents, cleaning agents, and process chemicals for production facilities.' },
  { name: 'Agriculture', icon: Leaf, description: 'Fertilizers, adjuvants, soil conditioners, and crop protection chemical inputs.' },
  { name: 'Food Processing', icon: Beaker, description: 'Food-grade preservatives, sanitizers, and process aids that comply with KEBS standards.' },
  { name: 'Mining', icon: Zap, description: 'Reagents, acids, and extractants used in ore processing and mineral recovery.' },
  { name: 'Construction', icon: Building2, description: 'Adhesives, sealants, concrete additives, and waterproofing compounds.' },
  { name: 'Hospitality', icon: Droplets, description: 'Commercial cleaning and sanitization chemicals for hotels and facilities.' },
  { name: 'Laboratories', icon: TestTubes, description: 'Analytical-grade reagents, standards, and solvents for research and testing.' },
]

const WHY_KIVI = [
  { icon: Award, title: 'Verified Purity', description: 'Every batch is independently lab-verified, matching KEBS and ISO 9001:2015 safety specifications.' },
  { icon: ShieldCheck, title: 'Regulatory Compliance', description: 'Full documentation: MSDS sheets, UN safety codes, certificates of analysis, and customs clearance support.' },
  { icon: Truck, title: 'East Africa Delivery', description: 'Structured logistics dispatching to Nairobi, Mombasa, Kisumu, Kampala, Dar es Salaam, and beyond.' },
  { icon: Headphones, title: 'Technical Support', description: 'Resident chemical engineering consultants guide formulation setups and application specifications.' },
  { icon: PackageCheck, title: 'Flexible Packaging', description: 'Multiple packaging options from 1kg lab quantities to 200L industrial drums and bulk tanker deliveries.' },
  { icon: Wrench, title: 'Custom Formulations', description: 'In-house blending and toll-manufacturing services tailored to your specific industrial process requirements.' },
]

export default async function HomePage() {
  const { featuredProducts, categories } = await getData()

  return (
    <>
      <SchemaMarkup schema={organizationSchema()} />
      <SchemaMarkup schema={websiteSchema()} />
      <SchemaMarkup schema={localBusinessSchema()} />

      {/* 1 — Hero */}
      <HeroSection productCount={featuredProducts.length} categoryCount={categories.length} />

      {/* 2 — Trust Strip */}
      <section className="border-y py-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-divider)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Quality Assured', icon: ShieldCheck },
              { label: 'Technical Support', icon: Wrench },
              { label: 'Fast Delivery', icon: Truck },
              { label: 'Industrial Grade', icon: FlaskConical },
              { label: 'East Africa Coverage', icon: PackageCheck },
            ].map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 border px-4 py-3 rounded-[2px]"
                style={{ background: 'var(--bg-card-alt)', borderColor: 'var(--border-card)' }}
              >
                <Icon size={16} style={{ color: 'var(--kivi-cyan)', flexShrink: 0 }} />
                <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Featured Products */}
      <FeaturedProducts products={featuredProducts} />

      {/* 4 — Categories Section */}
      <section id="categories" className="py-20" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-14">
            <div className="overline mb-2">Sector Catalogues</div>
            <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>
              Chemical Categories
            </h2>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Explore our chemical formulations grouped by industrial application.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group border rounded-[4px] p-6 text-left transition-all duration-300 flex flex-col h-full justify-between"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-card)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div>
                  <div className="mb-4 p-2.5 rounded-[2px] w-fit transition-all duration-300" style={{ background: 'var(--kivi-cyan-muted)' }}>
                    <Layers size={20} style={{ color: 'var(--kivi-cyan)' }} />
                  </div>
                  {cat.image && (
                    <div
                      className="mb-4 h-24 rounded-[2px] border bg-cover bg-center"
                      style={{ backgroundImage: `url(${cat.image})`, borderColor: 'var(--border-card)' }}
                    />
                  )}
                  <h3
                    className="font-display font-bold text-sm mb-2 uppercase group-hover:text-[var(--kivi-cyan)] transition-colors"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {cat.description || 'High-purity specifications suitable for professional formulations.'}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="text-[10px] font-mono font-bold" style={{ color: 'var(--kivi-cyan)' }}>
                    {cat.product_count || 0} PRODUCTS
                  </div>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--kivi-cyan)' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Industries Served */}
      <section className="py-20 border-y" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-divider)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="overline mb-2">Industries Served</div>
            <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>
              Built for Serious Industrial Buyers
            </h2>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Our chemical formulations power critical processes across Kenya and East Africa.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INDUSTRIES.map(({ name, icon: Icon, description }) => (
              <div
                key={name}
                className="border rounded-[4px] p-5 transition-all duration-300 group"
                style={{ background: 'var(--bg-page)', borderColor: 'var(--border-card)' }}
              >
                <div className="mb-3 p-2.5 rounded-[2px] w-fit" style={{ background: 'var(--kivi-cyan-muted)' }}>
                  <Icon size={18} style={{ color: 'var(--kivi-cyan)' }} />
                </div>
                <h3 className="font-display font-bold text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-heading)' }}>{name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — Why Kivi Chemicals */}
      <section className="py-20" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="overline mb-2">Our Standards</div>
            <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>
              Why Kenyan Industries Trust Us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_KIVI.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="border rounded-[4px] p-6 transition-all duration-300 group"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2.5 rounded-[2px]" style={{ background: 'var(--kivi-cyan-muted)' }}>
                    <Icon size={18} style={{ color: 'var(--kivi-cyan)' }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-heading)' }}>{title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — CTA Banner */}
      <section
        className="py-20 text-center border-y"
        style={{ background: 'linear-gradient(135deg, #002040 0%, #0D1B2A 100%)', borderColor: 'rgba(0,160,192,0.25)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <Star size={14} className="text-[#00A0C0]" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#00A0C0]">Ready to Procure?</span>
            <Star size={14} className="text-[#00A0C0]" />
          </div>
          <h2 className="font-display font-black text-2xl md:text-4xl uppercase tracking-wide text-white">
            Secure Your Chemical Supply Chain
          </h2>
          <p className="text-xs md:text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
            Get instant price lists, scheduling parameters, and technical specifications. Message our supply desk directly or send a specifications sheet for review.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {SITE.whatsapp && (
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs uppercase tracking-wider font-bold rounded-[2px] transition-all"
                style={{ background: '#00A0C0', color: '#002040' }}
              >
                <MessageSquare size={14} /> WhatsApp Desk
              </a>
            )}
            {SITE.email && (
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs uppercase tracking-wider font-bold rounded-[2px] border transition-all"
                style={{ borderColor: 'rgba(0,160,192,0.35)', color: '#00A0C0', background: 'transparent' }}
              >
                <Mail size={14} /> Email Sales
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 8 — Location & Map */}
      <section className="py-20" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            {/* Company details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="overline mb-2">Find Us</div>
                <h2 className="font-display font-black text-2xl uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>Headquarters</h2>
              </div>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5 p-2 rounded-[2px]" style={{ background: 'var(--kivi-cyan-muted)' }}>
                    <MapPin size={14} style={{ color: 'var(--kivi-cyan)' }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Physical Address</div>
                    <span style={{ color: 'var(--text-body)' }}>{SITE.address}, {SITE.city}, {SITE.country}</span>
                  </div>
                </li>
                {SITE.phone && (
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 p-2 rounded-[2px]" style={{ background: 'var(--kivi-cyan-muted)' }}>
                      <Phone size={14} style={{ color: 'var(--kivi-cyan)' }} />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Phone</div>
                      <a href={`tel:${SITE.phone}`} style={{ color: 'var(--kivi-cyan)' }}>{SITE.phone}</a>
                    </div>
                  </li>
                )}
                {SITE.email && (
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 p-2 rounded-[2px]" style={{ background: 'var(--kivi-cyan-muted)' }}>
                      <Mail size={14} style={{ color: 'var(--kivi-cyan)' }} />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Email</div>
                      <a href={`mailto:${SITE.email}`} style={{ color: 'var(--kivi-cyan)' }}>{SITE.email}</a>
                    </div>
                  </li>
                )}
              </ul>
              {SITE.whatsapp && (
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-5 py-3.5 rounded-[4px] border text-sm font-bold uppercase tracking-wider transition-all"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
                >
                  <MessageSquare size={16} style={{ color: 'var(--kivi-cyan)' }} />
                  Chat on WhatsApp
                </a>
              )}
            </div>

            {/* Map */}
            <div className="lg:col-span-3 relative h-[380px] rounded-[4px] overflow-hidden border" style={{ borderColor: 'var(--border-card)' }}>
              <iframe
                title={`${SITE.name} map location`}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.783464536384!2d36.836563474529115!3d-1.3049995986826053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f111fcb12c937%3A0x823dc5ce0c346921!2sKivi%20Industrial%20Chemicals%20Ltd!5e0!3m2!1sen!2ske!4v1782843340178!5m2!1sen!2ske"
                className="h-full w-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
