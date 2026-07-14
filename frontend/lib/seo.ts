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
  // Backend-generated seo_title values (products/categories/blog posts) sometimes
  // already end with "| {shortName}" baked in by the AI content pipeline. Strip it
  // before re-appending so we never double/triple the suffix, and return `absolute`
  // below so the root layout's own `%s | {shortName}` template doesn't add another.
  const suffix = ` | ${SITE.shortName}`
  const cleanTitle = title?.endsWith(suffix) ? title.slice(0, -suffix.length) : title

  const fullTitle = cleanTitle
    ? `${cleanTitle} | ${SITE.shortName}`
    : `${SITE.name} — ${SITE.tagline}`

  const desc = description || SITE.description
  const url = `${SITE.url}${path}`
  // /logo-horizontal-white.png (1600x454) is the only brand image guaranteed to exist in /public
  const ogImage = image || `${SITE.url}/logo-horizontal-white.png`

  return {
    title: { absolute: fullTitle },
    description: desc,
    keywords: keywords || SITE.keywords,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE.name,
      images: [{ url: ogImage, alt: fullTitle }],
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
