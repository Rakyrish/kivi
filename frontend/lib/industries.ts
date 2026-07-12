import {
  Waves, Building2, Leaf, Beaker, Zap, TestTubes, Droplets,
  type LucideIcon,
} from 'lucide-react'

export interface Industry {
  slug: string
  name: string
  icon: LucideIcon
  shortDescription: string
  body: string
  relatedCategorySlugs: string[]
}

export const INDUSTRIES: Industry[] = [
  {
    slug: 'water-treatment',
    name: 'Water Treatment',
    icon: Waves,
    shortDescription: 'Coagulants, flocculants, pH adjusters, and disinfectants for municipal and industrial water systems.',
    body: 'Municipal utilities and industrial plants across Kenya, Uganda, and Tanzania rely on a consistent supply of coagulants (aluminium sulphate, poly-aluminium chloride), disinfectants (calcium hypochlorite, sodium hypochlorite), and pH-correction chemicals (hydrated lime, sulphuric acid) to keep water treatment lines running without interruption. We supply these at both lab-scale and bulk tanker volumes, with certificates of analysis for every batch so your compliance team has what it needs for NEMA and WASREB reporting without chasing paperwork.',
    relatedCategorySlugs: ['water-treatment', 'cleaning-disinfection'],
  },
  {
    slug: 'manufacturing',
    name: 'Manufacturing',
    icon: Building2,
    shortDescription: 'Industrial solvents, cleaning agents, and process chemicals for production facilities.',
    body: 'Manufacturers formulating paints, adhesives, detergents, or general industrial products need solvents and process chemicals that arrive on schedule and meet the same specification every time — a single off-spec drum can stall a production line. We stock solvents and thinners, surfactants, and metal-treatment chemicals used across formulation and finishing lines, and can source non-stock items on request for buyers who need a single supplier managing multiple raw material lines.',
    relatedCategorySlugs: ['solvents-thinners', 'paints-coatings', 'metal-treatment-chemicals', 'rubber-plastic'],
  },
  {
    slug: 'agriculture',
    name: 'Agriculture',
    icon: Leaf,
    shortDescription: 'Fertilizers, adjuvants, soil conditioners, and crop protection chemical inputs.',
    body: 'Agro-input distributors and large-scale growers source soil conditioners, adjuvants, and chemical inputs from us for blending into fertilizer and crop-protection programs. Because these products often move seasonally and in bulk, we plan inventory ahead of planting cycles and can structure delivery schedules around your season rather than shipping everything in one lump order.',
    relatedCategorySlugs: ['agricultural-chemicals', 'construction-chemicals'],
  },
  {
    slug: 'food-processing',
    name: 'Food Processing',
    icon: Beaker,
    shortDescription: 'Food-grade preservatives, sanitizers, and process aids that comply with KEBS standards.',
    body: 'Food and beverage manufacturers need process aids, preservatives, and sanitizing chemicals that meet food-grade purity thresholds, not just industrial grade — the difference matters for KEBS certification and export compliance. We carry citric acid, sodium gluconate, and related food-grade chemistries with documentation that traces back to the manufacturer, so your QA team can verify grade and origin on request.',
    relatedCategorySlugs: ['foods-beverages', 'preservation-chemicals'],
  },
  {
    slug: 'mining',
    name: 'Mining',
    icon: Zap,
    shortDescription: 'Reagents, acids, and extractants used in ore processing and mineral recovery.',
    body: 'Ore processing and mineral recovery operations depend on acids, reagents, and flotation/extraction chemicals delivered in the bulk volumes and hazard-compliant packaging that mine sites require. We handle the logistics — UN-rated packaging, transport documentation, and site-delivery scheduling — for buyers operating away from major urban centers, where a delayed reagent shipment means idle processing capacity.',
    relatedCategorySlugs: ['mining-chemicals', 'oil-gas'],
  },
  {
    slug: 'construction',
    name: 'Construction',
    icon: Building2,
    shortDescription: 'Adhesives, sealants, concrete additives, and waterproofing compounds.',
    body: 'Contractors and construction chemical formulators source concrete additives, waterproofing compounds, and adhesive/sealant raw materials from us for both project-specific orders and standing supply agreements. Bulk packaging (drums to tanker loads) and predictable East Africa-wide delivery mean fewer site delays waiting on materials.',
    relatedCategorySlugs: ['construction-chemicals', 'insulation-materials'],
  },
  {
    slug: 'hospitality',
    name: 'Hospitality',
    icon: Droplets,
    shortDescription: 'Commercial cleaning and sanitization chemicals for hotels and facilities.',
    body: 'Hotels, hospitals, and commercial facility management companies need cleaning and disinfection chemicals in volumes well beyond retail supply — and with the consistency that a rotating supplier list can\'t guarantee. We supply detergent bases, disinfectants, and sanitation chemicals at facility scale, with the option of recurring supply schedules so procurement isn\'t re-sourcing every month.',
    relatedCategorySlugs: ['cleaning-disinfection', 'detergents-soaps'],
  },
  {
    slug: 'laboratories',
    name: 'Laboratories',
    icon: TestTubes,
    shortDescription: 'Analytical-grade reagents, standards, and solvents for research and testing.',
    body: 'Research institutions, university labs, and industrial QC departments need analytical-grade reagents with verifiable purity and proper documentation — a lab result is only as trustworthy as the reagent behind it. We supply laboratory reagents and analytical-grade solvents in pack sizes suited to lab consumption (1kg upward), not just bulk industrial drums.',
    relatedCategorySlugs: ['laboratory-reagents', 'pharma-cosmetics'],
  },
]
