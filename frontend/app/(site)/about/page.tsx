import { Metadata } from 'next'
import { Award, ShieldCheck, Truck, Users, Beaker, Globe } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import { SITE } from '@/lib/constants'
import { breadcrumbSchema } from '@/lib/schema'
import SchemaMarkup from '@/components/site/SchemaMarkup'

export const metadata: Metadata = buildMetadata({
  title: 'About Us',
  description: 'Learn about Kivi Industrial Chemicals Limited — Kenya\'s trusted B2B chemical supplier delivering to East Africa since 2014.',
  path: '/about',
})


const values = [
  {
    icon: ShieldCheck,
    title: 'Safety First',
    body: 'Every product we supply is handled according to international MSDS standards. Our staff are fully trained in hazardous chemical logistics and emergency response protocols.',
  },
  {
    icon: Award,
    title: 'Verified Quality',
    body: 'Batch certification, independent laboratory testing, and supply chain traceability are built into every order we fulfill — from procurement to final delivery.',
  },
  {
    icon: Truck,
    title: 'Reliable Logistics',
    body: 'Our in-house fleet and regional logistics partners ensure predictable delivery timelines across all major East African commercial centers.',
  },
  {
    icon: Users,
    title: 'Expert Team',
    body: 'Our chemical sales engineers bring domain knowledge across agrochemicals, water treatment, soap manufacturing, food processing, and industrial applications.',
  },
  {
    icon: Beaker,
    title: 'Broad Catalogue',
    body: 'We stock and source over 150 specialty, industrial, and commodity chemicals — reducing procurement lead times for manufacturers across multiple sectors.',
  },
  {
    icon: Globe,
    title: 'Regional Scale',
    body: 'With active supply routes into Uganda, Tanzania, Rwanda, and Burundi, we are East Africa\'s growing chemical distribution network of choice.',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-[#F4F7FA] min-h-screen text-[#606060]">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: 'Home', url: SITE.url },
          { name: 'About Us', url: `${SITE.url}/about` },
        ])}
      />
      {/* Hero Banner */}
      <section className="bg-[#0D1B2A] py-20 text-[#F4F7FA] relative overflow-hidden border-b border-[#00A0C0]/15">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00A0C0_1px,transparent_1px),linear-gradient(to_bottom,#00A0C0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0]">Our Story</div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-wide max-w-3xl">
            Powering East African Industry With Reliable Chemistry
          </h1>
          <p className="text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
            {SITE.name} was established to solve one critical problem: manufacturers and processors across Kenya could not easily source verified-quality industrial chemicals at predictable lead times. We built the infrastructure to change that.
          </p>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-20 bg-white border-b border-[#E8EEF4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0] mb-2">Our Purpose</div>
              <h2 className="font-display font-black text-2xl md:text-3xl text-[#002040] uppercase tracking-wide">
                Mission & Vision
              </h2>
            </div>
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="border-l-2 border-[#00A0C0] pl-5 space-y-2">
                <div className="font-display font-extrabold text-xs uppercase tracking-wider text-[#002040]">Mission</div>
                <p>To supply industrial and specialty chemicals of consistent, verified quality to East African manufacturers — enabling them to build more, process better, and grow faster.</p>
              </div>
              <div className="border-l-2 border-[#E8EEF4] pl-5 space-y-2">
                <div className="font-display font-extrabold text-xs uppercase tracking-wider text-[#002040]">Vision</div>
                <p>To become the most trusted and technically capable chemical distributor serving the African continent — from basic industrial supply to specialty formulations.</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { stat: '150+', label: 'Chemicals in Stock' },
              { stat: '1,200+', label: 'Active B2B Clients' },
              { stat: '5+', label: 'Countries Served' },
              { stat: '13+', label: 'Categories' },
            ].map(({ stat, label }) => (
              <div key={label} className="bg-[#002040] border border-[#00A0C0]/20 p-6 rounded-[4px] text-center">
                <div className="font-display font-black text-3xl text-[#00A0C0] font-mono">{stat}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] mt-2">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-[#F4F7FA] border-b border-[#E8EEF4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0] mb-2">What Drives Us</div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-[#002040] uppercase tracking-wide">
              Core Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white border border-[#E8EEF4] hover:border-[#00A0C0] p-6 rounded-[4px] space-y-3 transition-all duration-300">
                <div className="text-[#00A0C0] bg-[#00A0C0]/10 p-2.5 rounded-sm w-fit">
                  <Icon size={20} />
                </div>
                <h3 className="font-display font-bold text-sm text-[#002040] uppercase tracking-wide">{title}</h3>
                <p className="text-xs text-[#606060] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}

    </div>
  )
}
