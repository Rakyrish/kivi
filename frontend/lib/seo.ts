import { Metadata } from 'next'
import { SITE } from './constants'

export function buildMetadata({
  title,
  description,
  keywords,
  image,
  path = '',
  type = 'website',
}: {
  title?: string
  description?: string
  keywords?: string
  image?: string
  path?: string
  type?: 'website' | 'article'
}): Metadata {
  const fullTitle = title
    ? `${title} | ${SITE.shortName}`
    : `${SITE.name} — ${SITE.tagline}`

  const desc = description || SITE.description
  const url = `${SITE.url}${path}`
  const ogImage = image || `${SITE.url}/og-default.jpg`

  return {
    title: fullTitle,
    description: desc,
    keywords: keywords || SITE.keywords,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE.name,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type,
      locale: 'en_KE',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
    verification: {
      google: SITE.analytics.siteVerification,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  }
}
