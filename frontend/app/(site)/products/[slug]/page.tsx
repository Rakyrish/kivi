import { notFound, permanentRedirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import { productSchema, breadcrumbSchema, faqSchema } from '@/lib/schema'
import SchemaMarkup from '@/components/site/SchemaMarkup'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import ProductCard from '@/components/site/ProductCard'
import MolecularContextPanel from '@/components/site/MolecularContextPanel'
import DatasheetDownloader from '@/components/site/DatasheetDownloader'
import { SITE } from '@/lib/constants'
import { hasRealValue } from '@/lib/productDisplay'

export const revalidate = 3600 // ISR revalidation

// Fetch product details
async function getProductData(slug: string) {
  try {
    return await api.getProduct(slug)
  } catch (e) {
    return null
  }
}

// A slug that was corrected (e.g. by fix_truncated_slugs) has an old->new
// mapping recorded server-side — check it before giving up with a 404, so
// already-indexed/bookmarked URLs 301 instead of breaking.
async function getRedirectSlug(oldSlug: string): Promise<string | null> {
  try {
    const res = await api.resolveSlugRedirect(oldSlug)
    return res.new_slug
  } catch {
    return null
  }
}

// Generate static params for build pre-rendering
export async function generateStaticParams() {
  try {
    const slugs = await api.getProductSlugs()
    return slugs.map((p) => ({ slug: p.slug }))
  } catch (e) {
    return []
  }
}

// SEO metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const product = await getProductData(resolvedParams.slug)
  if (!product) return {}

  return buildMetadata({
    title: product.seo_title || `${product.name} Supplier Kenya`,
    description: product.seo_description || product.short_description,
    keywords: product.keywords,
    image: product.image,
    path: `/products/${product.slug}`,
  })
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const product = await getProductData(resolvedParams.slug)
  if (!product) {
    const newSlug = await getRedirectSlug(resolvedParams.slug)
    if (newSlug) permanentRedirect(`/products/${newSlug}`)
    notFound()
  }

  // Fetch related products (same category)
  let relatedProducts: any[] = []
  if (product.category_slug) {
    try {
      const res = await api.getProducts({ category: product.category_slug })
      relatedProducts = (res.results || [])
        .filter((p) => p.slug !== product.slug)
        .slice(0, 4)
    } catch (e) {}
  }

  // Schema structured markup
  const prodSchemaObj = productSchema(product)
  const breadcrumbItems = [
    { name: 'Home', url: SITE.url },
    { name: 'Products', url: `${SITE.url}/products` },
    { name: product.name, url: `${SITE.url}/products/${product.slug}` },
  ]
  const breadcrumbObj = breadcrumbSchema(breadcrumbItems)
  const faqs = Array.isArray(product.ai_faq) ? product.ai_faq.filter((f: any) => f?.question && f?.answer) : []

  return (
    <>
      <SchemaMarkup schema={prodSchemaObj} />
      <SchemaMarkup schema={breadcrumbObj} />
      {faqs.length > 0 && <SchemaMarkup schema={faqSchema(faqs)} />}

      <div className="min-h-screen py-12 font-sans" style={{ background: 'var(--bg-page)', color: 'var(--text-body)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
          <Breadcrumbs items={breadcrumbItems} />

          {/* Back button */}
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-kivi-cyan hover:text-kivi-cyan-hover transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Catalogue
            </Link>
          </div>

          {/* New Hero Signature Element: Molecular Context Panel */}
          <MolecularContextPanel product={product} />

          {/* Product Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white border border-kivi-gray-light p-6 md:p-8 rounded-kivi shadow-card">
            {/* Image Box */}
            <div className="lg:col-span-5 relative aspect-square bg-kivi-navy/5 border border-kivi-gray-light rounded-kivi overflow-hidden flex items-center justify-center">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.alt_text || product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority
                />
              ) : (
                <div className="text-kivi-navy/10 flex flex-col items-center justify-center p-8">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-2">Verified Compound</span>
                </div>
              )}
            </div>

            {/* General Specs details */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Category & Formula */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs uppercase font-bold tracking-widest text-kivi-cyan">
                    {product.category_name || 'Industrial Formulation'}
                  </span>
                  
                  {hasRealValue(product.chemical_formula) && (
                    <span className="chemical-formula text-xs bg-kivi-cyan-muted border border-kivi-cyan/20 px-3 py-1 rounded-kivi-sm">
                      {product.chemical_formula}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="font-display font-black text-3xl md:text-4xl text-kivi-navy uppercase tracking-wide">
                  {product.name}
                </h1>

                {/* Brand / Manufacturer */}
                {(hasRealValue(product.brand) || hasRealValue(product.manufacturer)) && (
                  <p className="text-xs text-[var(--paper-muted)] font-sans">
                    {hasRealValue(product.brand) && <span>Brand: <span className="font-bold text-kivi-navy">{product.brand}</span></span>}
                    {hasRealValue(product.brand) && hasRealValue(product.manufacturer) && <span className="mx-2">·</span>}
                    {hasRealValue(product.manufacturer) && <span>Manufactured by: <span className="font-bold text-kivi-navy">{product.manufacturer}</span></span>}
                  </p>
                )}

                {/* Properties list */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-kivi-gray-light py-4 text-xs font-mono">
                  {hasRealValue(product.cas_number) && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-[var(--paper-muted)] uppercase font-sans font-bold">CAS Registry</div>
                      <div className="text-kivi-navy font-bold">{product.cas_number}</div>
                    </div>
                  )}
                  {hasRealValue(product.grade) && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-[var(--paper-muted)] uppercase font-sans font-bold">Grade standard</div>
                      <div className="text-kivi-navy font-bold">{product.grade}</div>
                    </div>
                  )}
                  {hasRealValue(product.un_number) && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-[var(--paper-muted)] uppercase font-sans font-bold">UN Hazmat Tag</div>
                      <div className="text-kivi-hazard font-bold">{product.un_number}</div>
                    </div>
                  )}
                </div>

                {/* Grades Available */}
                {Array.isArray(product.grades_available) && product.grades_available.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-bold tracking-widest text-kivi-navy block">Grades Available:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.grades_available
                        .filter((g) => g?.grade)
                        .map((g, idx) => (
                          <span
                            key={idx}
                            title={g.note || undefined}
                            className="text-xs bg-kivi-cyan-muted border border-kivi-cyan/20 text-kivi-navy px-3 py-1 rounded-kivi-sm font-medium"
                          >
                            {g.grade}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Packaging Option */}
                {product.packaging && (
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-bold tracking-widest text-kivi-navy block">Available Packaging:</span>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(product.packaging) ? product.packaging.map((pkg: any, idx: number) => (
                        <span key={idx} className="text-xs bg-kivi-gray-light text-kivi-navy px-3 py-1 rounded-kivi-sm border border-kivi-gray-light font-medium">
                          {pkg.size} ({pkg.type})
                        </span>
                      )) : typeof product.packaging === 'string' ? (
                        <span className="text-xs bg-kivi-gray-light text-kivi-navy px-3 py-1 rounded-kivi-sm border border-kivi-gray-light font-medium">
                          {product.packaging}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Short description */}
                <p className="text-sm leading-relaxed text-[var(--paper-text)] font-sans">
                  {product.short_description}
                </p>
              </div>

              {/* Technical Sheet & Safety Sheet Download Panel */}
              <DatasheetDownloader product={product} />
            </div>
          </div>

          {/* Technical Specs & Safety details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Description & Applications */}
            <div className="lg:col-span-8 space-y-8 bg-white border border-kivi-gray-light p-6 md:p-8 rounded-kivi shadow-card">
              {/* 1. Product Introduction */}
              {product.introduction && (
                <div className="space-y-4">
                  <h2 className="font-display font-black text-sm uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-2">
                    Product Introduction
                  </h2>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--paper-text)] font-sans">
                    {product.introduction}
                  </p>
                </div>
              )}

              {/* 2. Detailed Product Overview */}
              <div className="space-y-4">
                <h2 className="font-display font-black text-sm uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-2">
                  Detailed Product Overview
                </h2>
                <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--paper-text)] font-sans">
                  {product.description}
                </p>
              </div>

              {/* 3. Applications & Uses — each use case explained individually */}
              {Array.isArray(product.applications_detailed) && product.applications_detailed.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="font-display font-black text-sm uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-2">
                    Applications & Uses
                  </h2>
                  <div className="space-y-5">
                    {product.applications_detailed.map((app: { title: string; description: string }, index: number) => (
                      <div key={index} className="space-y-1.5">
                        <h3 className="text-sm font-bold text-kivi-navy font-sans flex items-center gap-2">
                          <CheckCircle size={15} className="text-kivi-cyan flex-shrink-0" />
                          {app.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-[var(--paper-text)] font-sans pl-6">
                          {app.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                Array.isArray(product.applications) && product.applications.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="font-display font-black text-sm uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-2">
                      Primary Applications & Industry Uses
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.applications.map((app: string, index: number) => (
                        <div key={index} className="flex items-start gap-2.5 text-xs text-[var(--paper-text)] font-sans">
                          <CheckCircle size={16} className="text-kivi-cyan flex-shrink-0 mt-0.5" />
                          <span>{app}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* 4. Benefits & Advantages — paragraph form */}
              {product.benefits_content && (
                <div className="space-y-4">
                  <h2 className="font-display font-black text-sm uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-2">
                    Benefits & Advantages
                  </h2>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--paper-text)] font-sans">
                    {product.benefits_content}
                  </p>
                </div>
              )}

              {/* 6. Packaging Information */}
              {product.packaging_info && (
                <div className="space-y-4">
                  <h2 className="font-display font-black text-sm uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-2">
                    Packaging & Bulk Supply
                  </h2>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--paper-text)] font-sans">
                    {product.packaging_info}
                  </p>
                </div>
              )}

              {/* 7. Storage & Handling */}
              {product.storage_handling && (
                <div className="space-y-4">
                  <h2 className="font-display font-black text-sm uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-2">
                    Storage & Handling
                  </h2>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--paper-text)] font-sans">
                    {product.storage_handling}
                  </p>
                </div>
              )}

              {/* 8. External References & Further Reading */}
              {Array.isArray(product.external_references) && product.external_references.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-display font-black text-sm uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-2">
                    External References & Further Reading
                  </h2>
                  <ul className="space-y-2">
                    {product.external_references
                      .filter((ref) => ref?.title && ref?.url)
                      .map((ref, index) => (
                        <li key={index}>
                          <a
                            href={ref.url}
                            target="_blank"
                            rel={ref.nofollow ? 'nofollow noopener noreferrer' : 'noopener noreferrer'}
                            className="text-sm text-kivi-cyan hover:text-kivi-cyan-hover underline underline-offset-2 transition-colors"
                          >
                            {ref.title}
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Specifications & Safety Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Specs Table */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-kivi-navy border border-kivi-cyan/15 p-6 rounded-kivi text-[var(--panel-text)] shadow-glow-cyan">
                  <h2 className="font-display font-black text-xs uppercase tracking-wider text-kivi-cyan border-b border-kivi-cyan/10 pb-3 mb-4">
                    Technical Specifications
                  </h2>
                  <div className="border border-kivi-cyan/10 rounded-kivi-sm overflow-hidden text-xs">
                    <table className="w-full text-left specs-table">
                      <tbody>
                        {Object.entries(product.specifications).map(([key, val]) => (
                          <tr key={key} className="border-b border-kivi-cyan/5 font-mono">
                            <td className="px-4 py-2.5 font-bold text-[var(--panel-muted)]">{key}</td>
                            <td className="px-4 py-2.5 text-[var(--panel-text)] text-right">{String(val)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Safety Information */}
              {product.safety_info && (
                <div className="bg-kivi-error-bg border border-kivi-error p-6 rounded-kivi space-y-3" style={{ color: 'var(--text-body)' }}>
                  <div className="flex items-center gap-2 text-kivi-error">
                    <AlertTriangle size={18} className="text-kivi-error" />
                    <h2 className="font-display font-black text-xs uppercase tracking-wider text-kivi-error">
                      Safety & Handling Guidelines
                    </h2>
                  </div>
                  {hasRealValue(product.hazard_classification) && (
                    <p className="text-xs font-bold text-kivi-error leading-relaxed font-sans">
                      {product.hazard_classification}
                    </p>
                  )}
                  <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text-body)' }}>
                    {product.safety_info}
                  </p>
                </div>
              )}

              {/* Regulatory Compliance & Standards */}
              {Array.isArray(product.regulatory_compliance) && product.regulatory_compliance.length > 0 && (
                <div className="bg-white border border-kivi-gray-light p-6 rounded-kivi space-y-3">
                  <h2 className="font-display font-black text-xs uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-3">
                    Regulatory Compliance & Standards
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {product.regulatory_compliance.map((standard, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-kivi-gray-light text-kivi-navy px-3 py-1 rounded-kivi-sm border border-kivi-gray-light font-medium"
                      >
                        {standard}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 9. Frequently Asked Questions */}
          {faqs.length > 0 && (
            <div className="bg-white border border-kivi-gray-light p-6 md:p-8 rounded-kivi shadow-card space-y-6">
              <h2 className="font-display font-black text-lg text-kivi-navy uppercase tracking-wide">
                Frequently Asked Questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                {faqs.map((faq: { question: string; answer: string }, index: number) => (
                  <div key={index} className="space-y-1.5">
                    <h3 className="text-sm font-bold text-kivi-navy font-sans">{faq.question}</h3>
                    <p className="text-sm leading-relaxed text-[var(--paper-text)] font-sans">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* See Also — AI-curated cross-links to related products/categories */}
          {Array.isArray(product.internal_links) && product.internal_links.length > 0 && (
            <div className="bg-white border border-kivi-gray-light p-6 md:p-8 rounded-kivi shadow-card space-y-4">
              <h2 className="font-display font-black text-lg text-kivi-navy uppercase tracking-wide">
                See Also
              </h2>
              <div className="flex flex-wrap gap-3">
                {product.internal_links
                  .filter((link) => link?.title && link?.slug)
                  .map((link, index) => (
                    <Link
                      key={index}
                      href={`/products/${link.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-kivi-sm border border-kivi-gray-light text-kivi-navy hover:border-kivi-cyan hover:text-kivi-cyan transition-colors"
                    >
                      {link.title}
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="space-y-6">
              <h2 className="font-display font-black text-lg uppercase tracking-wide text-[var(--text-heading)]">
                Related Formulations
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
