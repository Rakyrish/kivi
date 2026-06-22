import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { CheckCircle, AlertTriangle, ArrowLeft, MessageSquare, Tag } from 'lucide-react'
import { api } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import { productSchema, breadcrumbSchema } from '@/lib/schema'
import SchemaMarkup from '@/components/site/SchemaMarkup'
import ProductCard from '@/components/site/ProductCard'
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

      <div className="bg-[#F4F7FA] min-h-screen py-12 text-[#606060]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Back button */}
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00A0C0] hover:text-[#00A0E0] transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Catalogue
            </Link>
          </div>

          {/* Product Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white border border-[#E8EEF4] p-6 md:p-8 rounded-[4px] shadow-sm">
            {/* Image Box */}
            <div className="lg:col-span-5 relative aspect-square bg-[#002040]/5 border border-[#E8EEF4] rounded-[2px] overflow-hidden flex items-center justify-center">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="text-[#002040]/10 flex flex-col items-center justify-center p-8">
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
                  <span className="text-xs uppercase font-bold tracking-widest text-[#00A0C0]">
                    {product.category_name || 'Industrial Formulation'}
                  </span>
                  
                  {product.chemical_formula && (
                    <span className="font-mono font-bold text-xs bg-[#00A0C0]/10 border border-[#00A0C0]/20 text-[#00A0C0] px-3 py-1 rounded-[2px]">
                      {product.chemical_formula}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="font-display font-black text-3xl md:text-4xl text-[#002040] uppercase tracking-wide">
                  {product.name}
                </h1>

                {/* Properties list */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-[#E8EEF4] py-4 text-xs font-mono">
                  {product.cas_number && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-[#94A3B8] uppercase font-sans font-bold">CAS Registry</div>
                      <div className="text-[#002040] font-bold">{product.cas_number}</div>
                    </div>
                  )}
                  {product.grade && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-[#94A3B8] uppercase font-sans font-bold">Grade standard</div>
                      <div className="text-[#002040] font-bold">{product.grade}</div>
                    </div>
                  )}
                  {product.un_number && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-[#94A3B8] uppercase font-sans font-bold">UN Hazmat Tag</div>
                      <div className="text-[#00A0C0] font-bold">{product.un_number}</div>
                    </div>
                  )}
                </div>

                {/* Short description */}
                <p className="text-xs leading-relaxed text-[#606060] font-sans">
                  {product.short_description}
                </p>
              </div>

              {/* Inquiry Action */}
              <div className="pt-4 border-t border-[#E8EEF4]">
                {SITE.whatsapp && (
                  <a
                    href={`https://wa.me/${SITE.whatsapp}?text=Hello,%20I%20am%20enquiring%20about%20${encodeURIComponent(product.name)}%20from%20the%20Kivi%20Chemicals%20catalogue.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] transition-all font-bold text-xs uppercase tracking-wider rounded-[2px]"
                  >
                    <MessageSquare size={16} />
                    Enquire on WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Technical Specs & Safety details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Description & Applications */}
            <div className="lg:col-span-8 space-y-8 bg-white border border-[#E8EEF4] p-6 md:p-8 rounded-[4px] shadow-sm">
              {/* Full Description */}
              <div className="space-y-4">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#002040] border-b border-[#00A0C0]/15 pb-2">
                  Chemical Description
                </h3>
                <p className="text-xs leading-relaxed whitespace-pre-line text-[#606060]">
                  {product.description}
                </p>
              </div>

              {/* Applications */}
              {product.applications && product.applications.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#002040] border-b border-[#00A0C0]/15 pb-2">
                    Primary Applications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.applications.map((app, index) => (
                      <div key={index} className="flex items-start gap-2.5 text-xs text-[#606060]">
                        <CheckCircle size={16} className="text-[#00A0C0] flex-shrink-0 mt-0.5" />
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
                <div className="bg-[#081525] border border-[#00A0C0]/15 p-6 rounded-[4px] text-[#F4F7FA] shadow-lg">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-[#00A0C0] border-b border-[#00A0C0]/10 pb-3 mb-4">
                    Technical Specifications
                  </h3>
                  <div className="border border-[#00A0C0]/10 rounded-[2px] overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <tbody>
                        {Object.entries(product.specifications).map(([key, val]) => (
                          <tr key={key} className="border-b border-[#00A0C0]/5 font-mono">
                            <td className="px-4 py-2.5 font-bold text-[#94A3B8]">{key}</td>
                            <td className="px-4 py-2.5 text-[#F4F7FA] text-right">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Safety Information */}
              {product.safety_info && (
                <div className="bg-red-950/60 border border-red-500/30 text-red-200 p-6 rounded-[4px] space-y-3">
                  <div className="flex items-center gap-2 text-[#00A0C0]">
                    <AlertTriangle size={18} className="text-red-400" />
                    <h3 className="font-display font-black text-xs uppercase tracking-wider text-red-200">
                      Safety & Handling
                    </h3>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {product.safety_info}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-display font-black text-lg text-[#002040] uppercase tracking-wide">
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
