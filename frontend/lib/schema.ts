import { SITE } from './constants'

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
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

export function productSchema(product: {
  name: string
  description: string
  image: string
  slug: string
  in_stock: boolean
  chemical_formula?: string
  cas_number?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image || `${SITE.url}/placeholder.png`,
    url: `${SITE.url}/products/${product.slug}`,
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
      seller: { '@type': 'Organization', name: SITE.name },
    },
    ...(product.cas_number && {
      identifier: {
        '@type': 'PropertyValue',
        name: 'CAS Number',
        value: product.cas_number,
      },
    }),
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
