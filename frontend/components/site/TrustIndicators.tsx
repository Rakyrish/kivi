import { Zap, ShieldCheck, Truck, Headset } from 'lucide-react'

const INDICATORS = [
  { icon: Zap, label: 'Fast Response Time' },
  { icon: ShieldCheck, label: 'Industry Expertise' },
  { icon: Truck, label: 'Reliable Chemical Supply' },
  { icon: Headset, label: 'Technical Support Available' },
]

export default function TrustIndicators() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {INDICATORS.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-3 px-4 py-3">
          <Icon size={18} style={{ color: 'var(--kivi-cyan)' }} className="flex-shrink-0" />
          <span className="text-[11px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
