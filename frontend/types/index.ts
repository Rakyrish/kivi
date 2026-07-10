export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  seo_title?: string
  seo_description?: string
  image?: string
  featured_image?: string
  header_image?: string
  overview_content?: string
  benefits?: { title: string; description: string; icon?: string }[]
  industries_served?: string[]
  faq?: { question: string; answer: string }[]
  is_featured?: boolean
  order: number
  is_active: boolean
  created_at: string
  product_count?: number
}

export interface Product {
  id: number
  name: string
  slug: string
  category?: number
  category_name?: string
  category_slug?: string
  chemical_formula: string
  cas_number: string
  grade: string
  un_number: string
  brand?: string
  manufacturer?: string
  grades_available?: { grade: string; note: string }[]
  regulatory_compliance?: string[]
  hazard_classification?: string
  short_description: string
  introduction?: string
  description: string
  applications: string[]
  applications_detailed?: { title: string; description: string }[]
  benefits_content?: string
  packaging_info?: string
  storage_handling?: string
  specifications: Record<string, string>
  safety_info: string
  ai_faq?: { question: string; answer: string }[]
  ai_benefits?: string[]
  ai_industries?: string[]
  internal_links?: { title: string; slug: string }[]
  external_references?: { title: string; url: string; nofollow?: boolean }[]
  seo_title: string
  seo_description: string
  keywords: string
  image: string
  images: string[]
  is_active: boolean
  is_featured: boolean
  in_stock: boolean
  ai_generated: boolean
  purity?: string
  packaging?: any
  sds_pdf?: string
  datasheet_pdf?: string
  alt_text?: string
  view_count?: number
  quote_request_count?: number
  created_at: string
  updated_at: string
}


export interface SiteSetting {
  id: number
  company_name: string
  tagline: string
  email: string
  phone: string
  whatsapp: string
  address: string
  city: string
  country: string
  logo: string
  favicon: string
  default_seo_title: string
  default_seo_description: string
  default_keywords: string
  linkedin_url: string
  facebook_url: string
  instagram_url: string
  twitter_url: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  summary: string
  image: string
  is_published: boolean
  seo_title: string
  seo_description: string
  keywords: string
  created_at: string
  updated_at: string
  reading_time?: number
  ai_generated?: boolean
  published_at?: string
}


export interface ContactSubmission {
  id?: number
  name: string
  email: string
  phone?: string
  company_name?: string
  subject: string
  message: string
  created_at?: string
}
