import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import { productSchema, breadcrumbSchema } from '@/lib/schema'
import SchemaMarkup from '@/components/site/SchemaMarkup'
import ProductCard from '@/components/site/ProductCard'
import MolecularContextPanel from '@/components/site/MolecularContextPanel'
import DatasheetDownloader from '@/components/site/DatasheetDownloader'
import { SITE } from '@/lib/constants'

export const revalidate = 3600 // ISR revalidation

// Fetch product details
async function getProductData(slug: string) {
  try {
    return await api.getProduct(slug)
  } catch (e) {
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
  if (!product) notFound()

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
  const breadcrumbObj = breadcrumbSchema([
    { name: 'Home', url: SITE.url },
    { name: 'Products', url: `${SITE.url}/products` },
    { name: product.name, url: `${SITE.url}/products/${product.slug}` },
  ])

  return (
    <>
      <SchemaMarkup schema={prodSchemaObj} />
      <SchemaMarkup schema={breadcrumbObj} />

      <div className="bg-kivi-white min-h-screen py-12 text-kivi-gray font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
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
                  
                  {product.chemical_formula && (
                    <span className="chemical-formula text-xs bg-kivi-cyan-muted border border-kivi-cyan/20 px-3 py-1 rounded-kivi-sm">
                      {product.chemical_formula}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="font-display font-black text-3xl md:text-4xl text-kivi-navy uppercase tracking-wide">
                  {product.name}
                </h1>

                {/* Properties list */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-kivi-gray-light py-4 text-xs font-mono">
                  {product.cas_number && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-kivi-mid uppercase font-sans font-bold">CAS Registry</div>
                      <div className="text-kivi-navy font-bold">{product.cas_number}</div>
                    </div>
                  )}
                  {product.grade && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-kivi-mid uppercase font-sans font-bold">Grade standard</div>
                      <div className="text-kivi-navy font-bold">{product.grade}</div>
                    </div>
                  )}
                  {product.un_number && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-kivi-mid uppercase font-sans font-bold">UN Hazmat Tag</div>
                      <div className="text-kivi-hazard font-bold">{product.un_number}</div>
                    </div>
                  )}
                </div>

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
                <p className="text-sm leading-relaxed text-kivi-gray font-sans">
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
              {/* Full Description */}
              <div className="space-y-4">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-2">
                  Chemical Description & Properties
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-line text-kivi-gray font-sans">
                  {product.description}
                </p>
              </div>

              {/* Applications */}
              {product.applications && (Array.isArray(product.applications) ? product.applications.length > 0 : false) && (
                <div className="space-y-4">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-2">
                    Primary Applications & Industry Uses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.isArray(product.applications) && product.applications.map((app: string, index: number) => (
                      <div key={index} className="flex items-start gap-2.5 text-xs text-kivi-gray font-sans">
                        <CheckCircle size={16} className="text-kivi-cyan flex-shrink-0 mt-0.5" />
                        <span>{app}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Specifications & Safety Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Specs Table */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-kivi-surface border border-kivi-cyan/15 p-6 rounded-kivi text-kivi-white shadow-glow-cyan">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-kivi-cyan border-b border-kivi-cyan/10 pb-3 mb-4">
                    Technical Specifications
                  </h3>
                  <div className="border border-kivi-cyan/10 rounded-kivi-sm overflow-hidden text-xs">
                    <table className="w-full text-left specs-table">
                      <tbody>
                        {Object.entries(product.specifications).map(([key, val]) => (
                          <tr key={key} className="border-b border-kivi-cyan/5 font-mono">
                            <td className="px-4 py-2.5 font-bold text-kivi-mid">{key}</td>
                            <td className="px-4 py-2.5 text-kivi-white text-right">{String(val)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Safety Information */}
              {product.safety_info && (
                <div className="bg-kivi-error-bg border border-kivi-error text-kivi-navy p-6 rounded-kivi space-y-3">
                  <div className="flex items-center gap-2 text-kivi-error">
                    <AlertTriangle size={18} className="text-kivi-error" />
                    <h3 className="font-display font-black text-xs uppercase tracking-wider text-kivi-error">
                      Safety & Handling Guidelines
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed text-kivi-navy font-sans">
                    {product.safety_info}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-display font-black text-lg text-kivi-navy uppercase tracking-wide">
                Related Formulations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
