import Link from 'next/link'
import { ArrowRight, MessageSquare, ShieldCheck, Truck, Clock, FlaskConical } from 'lucide-react'
import { ROUTES, SITE } from '@/lib/constants'

const TRUST_STATS = [
  { value: '99%+', label: 'Purity Grade', icon: ShieldCheck },
  { value: 'EA', label: 'Delivery Range', icon: Truck },
  { value: '24h', label: 'Quote Response', icon: Clock },
  { value: 'ISO', label: 'Certified Grade', icon: FlaskConical },
]

export default function HeroSection({
  productCount = 0,
  categoryCount = 0,
}: {
  productCount?: number
  categoryCount?: number
}) {
  return (
    <section
      className="relative text-[var(--text-primary)] overflow-hidden py-24 md:py-32"
      style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #002040 60%, #081525 100%)' }}
    >
      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(to right,#00A0C0 1px,transparent 1px),linear-gradient(to bottom,#00A0C0 1px,transparent 1px)',
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%,#000 70%,transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%,#000 70%,transparent 100%)',
        }}
      />

      {/* Glow accents */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full opacity-[0.06] pointer-events-none" style={{ background: 'radial-gradient(circle, #00A0C0 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute left-0 bottom-0 w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, #002040 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Content */}
          <div className="lg:col-span-7 space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] border" style={{ background: 'rgba(0,160,192,0.08)', borderColor: 'rgba(0,160,192,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A0C0] animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0]">
                East Africa B2B Chemical Supplier
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight leading-[1.08]" style={{ color: '#F4F7FA' }}>
              Reliable Industrial<br />
              Chemicals for{' '}
              <span className="relative inline-block" style={{ color: '#00A0C0' }}>
                East Africa
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#00A0C0,transparent)' }} />
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm md:text-base max-w-xl leading-relaxed" style={{ color: '#94A3B8' }}>
              {SITE.description || 'Kivi Industrial Chemicals delivers verified-quality formulations, solvents, and specialty additives to manufacturing, agriculture, water treatment, and processing industries across Kenya and East Africa.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={ROUTES.products}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs uppercase tracking-wider font-bold rounded-[2px] transition-all duration-300 hover:opacity-90"
                style={{ background: '#00A0C0', color: '#002040' }}
              >
                Browse Catalogue
                <ArrowRight size={14} />
              </Link>
              {SITE.whatsapp && (
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-xs uppercase tracking-wider font-bold rounded-[2px] border transition-all duration-300"
                  style={{ borderColor: 'rgba(0,160,192,0.35)', color: '#00A0C0', background: 'transparent' }}
                >
                  <MessageSquare size={14} />
                  WhatsApp Desk
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { value: productCount > 0 ? `${productCount}+` : '100+', label: 'Products' },
                { value: categoryCount > 0 ? `${categoryCount}+` : '12+', label: 'Categories' },
                { value: 'EA', label: 'Regions Covered' },
                { value: 'B2B', label: 'Industrial Focus' },
              ].map((stat) => (
                <div key={stat.label} className="border rounded-[2px] p-3" style={{ borderColor: 'rgba(0,160,192,0.15)', background: 'rgba(8,21,37,0.70)' }}>
                  <div className="font-mono text-xl font-bold" style={{ color: '#00A0C0' }}>{stat.value}</div>
                  <div className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: '#94A3B8' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Graphical Panel */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="relative border rounded-[4px] p-8 space-y-6 shadow-2xl" style={{ borderColor: 'rgba(0,160,192,0.20)', background: 'rgba(8,21,37,0.80)', backdropFilter: 'blur(8px)' }}>
              <div className="absolute top-3 right-3 text-[10px] font-mono" style={{ color: '#606060' }}>SYS.V3.0</div>

              {/* Chemical structure SVG */}
              <div className="border-b pb-6 flex items-center justify-center" style={{ borderColor: 'rgba(0,160,192,0.10)' }}>
                <svg className="w-52 h-36" viewBox="0 0 220 130" fill="none" stroke="rgba(0,160,192,0.45)" strokeWidth="1.5">
                  {/* Benzene ring */}
                  <polygon points="60,45 90,25 120,45 120,85 90,105 60,85" />
                  {/* Double bond indicators */}
                  <line x1="63" y1="50" x2="63" y2="80" stroke="rgba(0,160,192,0.25)" />
                  <line x1="117" y1="50" x2="117" y2="80" stroke="rgba(0,160,192,0.25)" />
                  {/* Side chains */}
                  <line x1="90" y1="25" x2="90" y2="8" />
                  <circle cx="90" cy="6" r="3" fill="#00A0C0" stroke="none" />
                  <text x="98" y="10" fill="#00A0C0" fontSize="8" fontFamily="monospace">OH</text>
                  <line x1="120" y1="45" x2="138" y2="35" />
                  <text x="141" y="37" fill="#00A0C0" fontSize="8" fontFamily="monospace">Cl</text>
                  <line x1="120" y1="85" x2="138" y2="95" />
                  <text x="141" y="98" fill="#00A0C0" fontSize="8" fontFamily="monospace">CH₃</text>
                  {/* Second ring */}
                  <polygon points="150,45 180,25 210,45 210,85 180,105 150,85" opacity="0.5" />
                  <circle cx="120" cy="45" r="2.5" fill="#00A0C0" stroke="none" />
                  <circle cx="120" cy="85" r="2.5" fill="#00A0C0" stroke="none" />
                </svg>
              </div>

              {/* Specs highlights */}
              <div className="grid grid-cols-2 gap-4 text-left">
                {TRUST_STATS.map(({ value, label, icon: Icon }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon size={12} style={{ color: '#00A0C0' }} />
                      <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#606060' }}>{label}</div>
                    </div>
                    <div className="text-sm font-mono font-bold" style={{ color: '#F4F7FA' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Animated status indicator */}
              <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'rgba(0,160,192,0.10)' }}>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[10px] font-mono" style={{ color: '#10B981' }}>ALL SYSTEMS OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
