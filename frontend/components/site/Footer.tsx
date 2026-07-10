import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, Linkedin, Facebook, Twitter, ShieldCheck } from 'lucide-react'
import { ROUTES, SITE } from '@/lib/constants'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#040f1c] border-t border-[#00A0C0]/15 text-[#94A3B8] pt-16 pb-8" style={{ backgroundColor: '#040f1c', color: '#94A3B8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Brief */}
          <div className="space-y-4">
            <span className="footer-brand font-display text-2xl tracking-tight text-[#F4F7FA]">
              {SITE.shortName.toUpperCase()}
            </span>
            <p className="text-xs leading-relaxed max-w-sm">
              {SITE.description || `${SITE.name} is a leading distributor and supplier of high-grade industrial, water treatment, and specialty chemicals in East Africa.`}
            </p>
            <div className="flex space-x-4 pt-2">
              {SITE.social.linkedin && (
                <a href={SITE.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[#00A0C0] transition-colors" aria-label="LinkedIn">
                  <Linkedin size={18} />
                </a>
              )}
              {SITE.social.facebook && (
                <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#00A0C0] transition-colors" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
              )}
              {SITE.social.twitter && (
                <a href={SITE.social.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-[#00A0C0] transition-colors" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="footer-heading font-display text-sm text-[#F4F7FA] uppercase tracking-wider">Contact Info</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#00A0C0] flex-shrink-0 mt-0.5" />
                <span>{SITE.address}, {SITE.city}, {SITE.country}</span>
              </li>
              {SITE.phone && (
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-[#00A0C0] flex-shrink-0" />
                  <a href={`tel:${SITE.phone}`} className="hover:text-[#F4F7FA] transition-colors">{SITE.phone}</a>
                </li>
              )}
              {SITE.email && (
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-[#00A0C0] flex-shrink-0" />
                  <a href={`mailto:${SITE.email}`} className="hover:text-[#F4F7FA] transition-colors">{SITE.email}</a>
                </li>
              )}
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-[#00A0C0] flex-shrink-0 mt-0.5" />
                <span>{SITE.openingHours}</span>
              </li>
            </ul>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="footer-heading font-display text-sm text-[#F4F7FA] uppercase tracking-wider">Procurement</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href={ROUTES.products} className="hover:text-[#00A0C0] transition-colors">Product Catalogue</Link>
              </li>
              <li>
                <Link href={ROUTES.categories} className="hover:text-[#00A0C0] transition-colors">Chemical Categories</Link>
              </li>
              <li>
                <Link href={ROUTES.blog} className="hover:text-[#00A0C0] transition-colors">Kivi Insights</Link>
              </li>
              <li>
                <Link href={ROUTES.about} className="hover:text-[#00A0C0] transition-colors">About Kivi Chemicals</Link>
              </li>
              <li>
                <Link href={ROUTES.contact} className="hover:text-[#00A0C0] transition-colors">Request Quote</Link>
              </li>
            </ul>
          </div>

          {/* Certifications */}
          <div className="space-y-4">
            <h4 className="footer-heading font-display text-sm text-[#F4F7FA] uppercase tracking-wider">Certifications</h4>
            <p className="text-xs leading-relaxed">
              Procurement documentation, batch traceability, SDS support, and industrial-grade quality controls for commercial buyers.
            </p>
            <ul className="space-y-2 text-xs">
              {['Quality Assured Supply', 'Safety Data Sheet Support', 'Industrial Grade Products'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#00A0C0]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#00A0C0]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#606060]">
          <div>
            &copy; {currentYear} {SITE.name}. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href={ROUTES.about} className="hover:text-[#94A3B8] transition-colors">Privacy Policy</Link>
            <Link href={ROUTES.contact} className="hover:text-[#94A3B8] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
