import { SITE } from './constants'

// Single shared brand image that actually exists in /public
const BRAND_IMAGE = `${SITE.url}/kivi.jpeg`

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: SITE.shortName,
    description: SITE.description || undefined,
    url: SITE.url,
    logo: BRAND_IMAGE,
    email: SITE.email || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address || undefined,
      addressLocality: SITE.city,
      addressCountry: 'KE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE.phone,
      contactType: 'customer service',
      areaServed: 'KE',
      availableLanguage: 'English',
    },
    sameAs: Object.values(SITE.social).filter(Boolean),
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.url,
    publisher: { '@id': `${SITE.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#localbusiness`,
    name: SITE.name,
    image: BRAND_IMAGE,
    url: SITE.url,
    telephone: SITE.phone || undefined,
    email: SITE.email || undefined,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address || undefined,
      addressLocality: SITE.city,
      addressCountry: 'KE',
    },
    ...(SITE.openingHours && { openingHours: SITE.openingHours }),
    sameAs: Object.values(SITE.social).filter(Boolean),
  }
}

export function productSchema(product: {
  name: string
  description: string
  image: string
  slug: string
  in_stock: boolean
  chemical_formula?: string
  cas_number?: string
  category_name?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image || BRAND_IMAGE,
    url: `${SITE.url}/products/${product.slug}`,
    sku: product.slug,
    ...(product.category_name && { category: product.category_name }),
    brand: {
      '@type': 'Brand',
      name: SITE.name,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KES',
      availability: product.in_stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE.url}/products/${product.slug}`,
      seller: { '@type': 'Organization', name: SITE.name },
    },
    ...(product.cas_number && {
      identifier: {
        '@type': 'PropertyValue',
        name: 'CAS Number',
        value: product.cas_number,
      },
    }),
    ...(product.chemical_formula && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'Chemical Formula',
        value: product.chemical_formula,
      },
    }),
  }
}

export function articleSchema(post: {
  title: string
  summary?: string
  image?: string
  slug: string
  published_at?: string
  created_at: string
  updated_at?: string
}) {
  const url = `${SITE.url}/blog/${post.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary || undefined,
    image: post.image || BRAND_IMAGE,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: BRAND_IMAGE },
    },
  }
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function contactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${SITE.name}`,
    url: `${SITE.url}/contact`,
    mainEntity: { '@id': `${SITE.url}/#localbusiness` },
  }
}
