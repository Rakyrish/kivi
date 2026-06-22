import Link from 'next/link'
import { ArrowRight, MessageSquare, Database, CheckSquare, Award } from 'lucide-react'
import { SITE } from '@/lib/constants'

export default function HeroSection() {
  // Extract tagline and highlight a word
  // e.g. "Reliable Chemicals. Stronger Industries." -> Highlight "Stronger Industries." or similar
  const tagline = SITE.tagline
  const firstPart = tagline.split('. ')[0] + '.'
  const secondPart = tagline.split('. ')[1] || ''

  return (
    <section className="relative bg-[#0D1B2A] text-[#F4F7FA] overflow-hidden py-24 md:py-32">
      {/* Background Subtle Tech/Grid Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00A0C0_1px,transparent_1px),linear-gradient(to_bottom,#00A0C0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03]"></div>

      {/* Background Graphic Accent */}
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-[#00A0C0]/5 blur-3xl rounded-full translate-x-1/3 translate-y-1/3"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tag/Badge */}
            <div className="inline-flex items-center gap-2 bg-[#00A0C0]/10 border border-[#00A0C0]/25 px-3 py-1 rounded-[2px]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0]">
                East Africa B2B Chemical Supplier
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight leading-tight">
              {firstPart}{' '}
              <span className="text-[#00A0C0] relative">
                {secondPart}
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm md:text-base text-[#94A3B8] max-w-xl leading-relaxed">
              {SITE.description || `Kivi Industrial Chemicals Limited delivers verified quality chemical formulations, solvents, and specialty additives to manufacturing, cosmetics, agricultural, and water treatment processing industries across Kenya.`}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-bold bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] transition-all duration-300 rounded-[2px]"
              >
                Browse Products
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-bold bg-transparent border border-[#00A0C0]/35 text-[#00A0C0] hover:bg-[#00A0C0]/10 transition-all duration-300 rounded-[2px]"
              >
                Contact Us
                <MessageSquare size={14} />
              </Link>
            </div>
          </div>

          {/* Graphical Display Panel (Industrial/Scientific look) */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="relative border border-[#00A0C0]/20 bg-[#081525] p-8 rounded-[4px] shadow-2xl space-y-6">
              <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-[#606060]">
                SYS.V1.26
              </div>

              {/* Chemical Structure Simulated SVG */}
              <div className="border-b border-[#00A0C0]/10 pb-6 flex items-center justify-center">
                <svg
                  className="w-48 h-32 text-[#00A0C0]/40"
                  viewBox="0 0 200 120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  {/* Hexagon 1 */}
                  <polygon points="50,40 80,20 110,40 110,80 80,100 50,80" />
                  <line x1="80" y1="20" x2="80" y2="5" />
                  <circle cx="80" cy="5" r="3" fill="#00A0C0" />
                  <text x="88" y="10" fill="#00A0C0" className="font-mono text-[9px] font-bold">OH</text>

                  {/* Hexagon 2 sharing edge */}
                  <polygon points="110,40 140,20 170,40 170,80 140,100 110,80" />
                  <line x1="170" y1="80" x2="185" y2="90" />
                  <text x="190" y="93" fill="#00A0C0" className="font-mono text-[9px] font-bold">CH3</text>

                  <circle cx="110" cy="40" r="2" fill="#00A0C0" />
                  <circle cx="110" cy="80" r="2" fill="#00A0C0" />
                </svg>
              </div>

              {/* Specs highlights */}
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <div className="text-[10px] text-[#606060] uppercase tracking-wider font-bold">Purity Standard</div>
                  <div className="text-xs font-mono font-bold text-[#F4F7FA]">ISO 9001:2015</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-[#606060] uppercase tracking-wider font-bold">Logistics Coverage</div>
                  <div className="text-xs font-mono font-bold text-[#00A0C0]">Kenya & East Africa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
