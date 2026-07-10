export const SITE = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Kivi Industrial Chemicals Limited',
  shortName: process.env.NEXT_PUBLIC_COMPANY_SHORT_NAME || 'Kivi Chemicals',
  tagline: process.env.NEXT_PUBLIC_COMPANY_TAGLINE || 'Reliable Chemicals. Stronger Industries.',
  description: process.env.NEXT_PUBLIC_COMPANY_DESCRIPTION || '',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kivichemicals.com',
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@kivichemicals.com',
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '',
  whatsapp: process.env.NEXT_PUBLIC_COMPANY_WHATSAPP || '',
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '',
  city: process.env.NEXT_PUBLIC_COMPANY_CITY || 'Nairobi',
  country: process.env.NEXT_PUBLIC_COMPANY_COUNTRY || 'Kenya',
  openingHours: process.env.NEXT_PUBLIC_COMPANY_OPENING_HOURS || '',
  keywords: process.env.NEXT_PUBLIC_DEFAULT_KEYWORDS || '',
  social: {
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || '',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
  },
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || '',
    siteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
export const INTERNAL_API_URL = process.env.INTERNAL_API_URL || API_URL

export const ROUTES = {
  home: '/',
  products: '/products',
  blog: '/blog',
  about: '/about',
  contact: '/contact',
  admin: {
    dashboard: '/admin',
    login: '/admin/login',
    products: '/admin/products',
    productNew: '/admin/products/new',
    productEdit: (slug: string) => `/admin/products/${slug}/edit`,
    blog: '/admin/blog',
    blogNew: '/admin/blog/new',
    blogEdit: (slug: string) => `/admin/blog/${slug}/edit`,
    django: '/django-admin/',
  },
} as const

export const API_ENDPOINTS = {
  blog: {
    posts: '/blog/',
    detail: (slug: string) => `/blog/${slug}/`,
  },
  ai: {
    generateBlog: '/ai/generate-blog/',
    generateProduct: '/ai/generate-product/',
    analyzeImage: '/ai/analyze-image/',
    kiviAgent: '/ai/kivi-agent/',
  },
  leads: {
    quoteRequests: '/leads/quote-requests/',
  },
  analytics: {
    dashboardMetrics: '/analytics/dashboard-metrics/',
  },
} as const
