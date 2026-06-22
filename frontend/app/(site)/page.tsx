import Link from 'next/link'
import { Award, ShieldCheck, Truck, Headphones, MessageSquare, Mail, Phone, MapPin, Layers } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { api } from '@/lib/api'
import { organizationSchema } from '@/lib/schema'
import HeroSection from '@/components/site/HeroSection'
import FeaturedProducts from '@/components/site/FeaturedProducts'
import SchemaMarkup from '@/components/site/SchemaMarkup'
import type { Product, Category } from '@/types'

// Fetch at build time
async function getData() {
  let featuredProducts: Product[] = []
  let categories: Category[] = []
  
  try {
    const featuredRes = await api.getFeaturedProducts()
    featuredProducts = featuredRes || []
  } catch (e) {
    // Fail-safe mock data for build phase or offline backend
    featuredProducts = []
  }

  try {
    const catRes = await api.getCategories()
    categories = catRes || []
  } catch (e) {
    categories = []
  }

  return { featuredProducts, categories }
}

export default async function HomePage() {
  const { featuredProducts, categories } = await getData()
  const orgSchema = organizationSchema()

  return (
    <>
      <SchemaMarkup schema={orgSchema} />
      
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Stats Bar */}
      <section className="bg-[#081525] border-y border-[#00A0C0]/15 py-10 text-[#F4F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#00A0C0]/10">
            <div className="pt-6 md:pt-0">
              <div className="font-display font-black text-3xl md:text-4xl text-[#00A0C0] font-mono">10+</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#606060] mt-1">Years in Industry</div>
            </div>
            <div className="pt-6 md:pt-0">
              <div className="font-display font-black text-3xl md:text-4xl text-[#00A0C0] font-mono">150+</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#606060] mt-1">High-Grade Chemicals</div>
            </div>
            <div className="pt-6 md:pt-0 font-mono">
              <div className="font-display font-black text-3xl md:text-4xl text-[#00A0C0]">1,200+</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#606060] mt-1">Clients Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Products */}
      <FeaturedProducts products={featuredProducts} />

      {/* 4. Categories Section */}
      <section className="py-20 bg-[#F4F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-xl mx-auto mb-16">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0] mb-2">Sector Catalogues</div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-[#002040] uppercase tracking-wide">
              Chemical Categories
            </h2>
            <p className="text-xs text-[#606060] mt-2">
              Browse our formulated chemical supplies grouped by processing application.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group bg-white border border-[#E8EEF4] hover:border-[#00A0C0] p-6 text-left rounded-[4px] transition-all duration-300 shadow-sm hover:shadow-md flex flex-col h-full justify-between"
              >
                <div>
                  <div className="text-[#00A0C0] mb-4 bg-[#00A0C0]/10 p-2.5 rounded-sm w-fit group-hover:bg-[#00A0C0] group-hover:text-white transition-all">
                    <Layers size={20} />
                  </div>
                  <h3 className="font-display font-bold text-sm text-[#002040] mb-2 uppercase group-hover:text-[#00A0C0] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#606060] line-clamp-2 leading-relaxed">
                    {cat.description || `High-purity specifications suitable for professional formulations.`}
                  </p>
                </div>
                <div className="text-[10px] font-mono font-bold text-[#00A0C0] mt-6">
                  {cat.product_count || 0} PRODUCTS
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Kivi */}
      <section className="py-20 bg-[#081525] border-t border-[#00A0C0]/10 text-[#F4F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0] mb-2">Our Standards</div>
            <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-wide">
              Why Kenyan Industries Trust Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 p-5 border border-[#00A0C0]/10 bg-[#002040]/30 rounded-[4px]">
              <div className="text-[#00A0C0]">
                <Award size={24} />
              </div>
              <h4 className="font-display font-bold text-xs uppercase text-[#F4F7FA]">Verified Purity</h4>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Every batch passes independent lab verification, matching KEBS and global ISO safety specifications.
              </p>
            </div>

            <div className="space-y-3 p-5 border border-[#00A0C0]/10 bg-[#002040]/30 rounded-[4px]">
              <div className="text-[#00A0C0]">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-display font-bold text-xs uppercase text-[#F4F7FA]">Regulatory Compliance</h4>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Full documentation support including MSDS data sheets, UN safety warnings, and certificates of analysis.
              </p>
            </div>

            <div className="space-y-3 p-5 border border-[#00A0C0]/10 bg-[#002040]/30 rounded-[4px]">
              <div className="text-[#00A0C0]">
                <Truck size={24} />
              </div>
              <h4 className="font-display font-bold text-xs uppercase text-[#F4F7FA]">East Africa Delivery</h4>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Structured logistics fleet dispatching supplies to Nairobi, Mombasa, Kisumu, Kampala, and Dar es Salaam.
              </p>
            </div>

            <div className="space-y-3 p-5 border border-[#00A0C0]/10 bg-[#002040]/30 rounded-[4px]">
              <div className="text-[#00A0C0]">
                <Headphones size={24} />
              </div>
              <h4 className="font-display font-bold text-xs uppercase text-[#F4F7FA]">Technical Support</h4>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Professional advice from resident chemical engineering sales assistants guiding formulation setups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA Banner */}
      <section className="py-16 bg-[#002040] text-center border-t border-b border-[#00A0C0]/25">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-display font-black text-2xl md:text-4xl text-[#F4F7FA] uppercase tracking-wide">
            Ready to secure your chemical supply?
          </h2>
          <p className="text-xs md:text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
            Get instant price lists and scheduling parameters. Message our supply desk directly or send a specifications sheet.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {SITE.whatsapp && (
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-bold bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] transition-colors rounded-[2px]"
              >
                <MessageSquare size={14} />
                WhatsApp Desk
              </a>
            )}
            {SITE.email && (
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-bold bg-transparent border border-[#00A0C0]/35 text-[#00A0C0] hover:bg-[#00A0C0]/15 transition-colors rounded-[2px]"
              >
                <Mail size={14} />
                Email sales
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 7. Contact Teaser */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="space-y-6 lg:col-span-1">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0] mb-2">Location</div>
                <h3 className="font-display font-black text-2xl text-[#002040] uppercase tracking-wide">Headquarters</h3>
              </div>
              <ul className="space-y-4 text-xs text-[#606060]">
                <li className="flex gap-3">
                  <MapPin size={18} className="text-[#00A0C0] flex-shrink-0 mt-0.5" />
                  <span>{SITE.address}, {SITE.city}, {SITE.country}</span>
                </li>
                {SITE.phone && (
                  <li className="flex items-center gap-3">
                    <Phone size={18} className="text-[#00A0C0] flex-shrink-0" />
                    <span>{SITE.phone}</span>
                  </li>
                )}
                {SITE.email && (
                  <li className="flex items-center gap-3">
                    <Mail size={18} className="text-[#00A0C0] flex-shrink-0" />
                    <span>{SITE.email}</span>
                  </li>
                )}
              </ul>
            </div>
            
            {/* Embedded interactive Google Map placeholder using Tailwind frame style */}
            <div className="lg:col-span-2 relative h-80 bg-[#E8EEF4] rounded-[4px] overflow-hidden border border-[#E8EEF4] shadow-sm flex items-center justify-center text-[#94A3B8]">
              <div className="absolute inset-0 bg-[#002040]/5 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <MapPin size={32} className="text-[#00A0C0]" />
                <h4 className="font-display font-bold text-xs uppercase text-[#002040]">{SITE.name}</h4>
                <p className="text-[10px] text-[#606060] max-w-sm">
                  {SITE.address}, Nairobi, Kenya (Latitude: {process.env.COMPANY_LATITUDE || '-1.2921'}, Longitude: {process.env.COMPANY_LONGITUDE || '36.8219'})
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
