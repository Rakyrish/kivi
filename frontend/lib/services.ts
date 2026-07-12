import {
  Award, ShieldCheck, Truck, Headphones, PackageCheck, Wrench,
  type LucideIcon,
} from 'lucide-react'

export interface Service {
  slug: string
  title: string
  icon: LucideIcon
  shortDescription: string
  body: string
}

export const SERVICES: Service[] = [
  {
    slug: 'quality-assurance',
    title: 'Verified Purity',
    icon: Award,
    shortDescription: 'Every batch is independently lab-verified, matching KEBS and ISO 9001:2015 safety specifications.',
    body: 'Every batch we distribute is traceable to its manufacturer and, where applicable, independently lab-verified against KEBS and ISO 9001:2015 specifications before it leaves our warehouse. Certificates of analysis are issued on request, so your quality team can confirm purity, grade, and compliance without waiting on a third party — critical for buyers in food, pharma, and water treatment where a wrong grade isn\'t just an inconvenience, it\'s a compliance failure.',
  },
  {
    slug: 'regulatory-compliance',
    title: 'Regulatory Compliance',
    icon: ShieldCheck,
    shortDescription: 'Full documentation: MSDS sheets, UN safety codes, certificates of analysis, and customs clearance support.',
    body: 'Hazardous chemical procurement carries a paperwork burden that catches many buyers off guard at the border or during an audit. We provide MSDS sheets, UN hazard classification codes, and certificates of analysis with every relevant order, and our team supports customs clearance documentation for cross-border shipments into Uganda, Tanzania, and Rwanda — so your compliance file is complete before the shipment even arrives.',
  },
  {
    slug: 'logistics-delivery',
    title: 'East Africa Delivery',
    icon: Truck,
    shortDescription: 'Structured logistics dispatching to Nairobi, Mombasa, Kisumu, Kampala, Dar es Salaam, and beyond.',
    body: 'We run structured logistics — not ad hoc courier arrangements — dispatching from Nairobi to major East African commercial centers including Mombasa, Kisumu, Kampala, and Dar es Salaam. For hazardous or bulk chemical loads, that means UN-compliant packaging and transport handled by people who do this daily, plus delivery scheduling that lines up with your production calendar rather than our convenience.',
  },
  {
    slug: 'technical-support',
    title: 'Technical Support',
    icon: Headphones,
    shortDescription: 'Resident chemical engineering consultants guide formulation setups and application specifications.',
    body: 'Choosing the wrong grade or concentration of a chemical input is an expensive mistake to discover mid-production. Our resident chemical engineering consultants work directly with your formulation or process team to confirm the right specification before you order — covering dosage rates, compatibility, and application guidance across water treatment, manufacturing, and agricultural use cases.',
  },
  {
    slug: 'flexible-packaging',
    title: 'Flexible Packaging',
    icon: PackageCheck,
    shortDescription: 'Multiple packaging options from 1kg lab quantities to 200L industrial drums and bulk tanker deliveries.',
    body: 'Not every buyer needs a tanker load, and not every lab needs a 25kg bag. We package and supply across the full range — from 1kg lab quantities through 25kg bags and 200L drums up to bulk tanker deliveries — so a university lab and a manufacturing plant can both order exactly the volume they need without over- or under-buying.',
  },
  {
    slug: 'custom-formulations',
    title: 'Custom Formulations',
    icon: Wrench,
    shortDescription: 'In-house blending and toll-manufacturing services tailored to your specific industrial process requirements.',
    body: 'Some buyers don\'t need a raw chemical — they need a blend. Our in-house blending and toll-manufacturing service takes your specification (concentration, additive package, packaging format) and produces it at the volumes you need, which is often more cost-effective than importing a pre-blended product or building in-house blending capacity for a single formulation.',
  },
]
