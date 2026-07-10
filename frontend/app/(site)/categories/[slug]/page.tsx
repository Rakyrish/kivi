import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { CheckCircle, Factory, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema, faqSchema } from '@/lib/schema'
import SchemaMarkup from '@/components/site/SchemaMarkup'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import ProductCard from '@/components/site/ProductCard'
import { SITE } from '@/lib/constants'
import type { Category, Product } from '@/types'

export const revalidate = 3600

async function getCategoryData(slug: string): Promise<Category | null> {
  try {
    return await api.getCategory(slug)
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  try {
    const categories = await api.getCategories()
    return categories.map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryData(slug)
  if (!category) return {}

  return buildMetadata({
    title: category.seo_title || `${category.name} Supplier Kenya Uganda Tanzania`,
    description:
      category.seo_description ||
      `Buy ${category.name.toLowerCase()} from Kivi Chemicals — verified grades, COA with every batch, delivered across Kenya, Uganda and Tanzania.`,
    image: category.featured_image || category.image,
    path: `/categories/${category.slug}`,
  })
}

export default async function CategoryAuthorityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await getCategoryData(slug)
  if (!category) notFound()

  let products: Product[] = []
  try {
    const res = await api.getProducts({ category: category.slug, page_size: 100 })
    products = res.results || []
  } catch {}

  const breadcrumbItems = [
    { name: 'Home', url: SITE.url },
    { name: 'Categories', url: `${SITE.url}/categories` },
    { name: category.name, url: `${SITE.url}/categories/${category.slug}` },
  ]
  const breadcrumbObj = breadcrumbSchema(breadcrumbItems)
  const faqs = Array.isArray(category.faq)
    ? category.faq.filter((f) => f?.question && f?.answer)
    : []

  return (
    <>
      <SchemaMarkup schema={breadcrumbObj} />
      {faqs.length > 0 && <SchemaMarkup schema={faqSchema(faqs)} />}

      <div className="bg-kivi-white min-h-screen py-12 text-kivi-gray font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
          <Breadcrumbs items={breadcrumbItems} />

          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <span className="text-xs uppercase font-bold tracking-widest text-kivi-cyan">
              Product Category — Kenya · Uganda · Tanzania
            </span>
            <h1 className="font-display font-black text-3xl md:text-4xl text-kivi-navy uppercase tracking-wide">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-sm leading-relaxed text-kivi-gray">{category.description}</p>
            )}
          </div>

          {/* Long-form authority content */}
          {category.overview_content && (
            <div className="bg-white border border-kivi-gray-light p-6 md:p-8 rounded-kivi shadow-card space-y-4 max-w-4xl">
              <h2 className="font-display font-black text-sm uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-2">
                Industry Overview & Buying Guidance
              </h2>
              <div className="text-sm leading-relaxed whitespace-pre-line text-kivi-gray">
                {category.overview_content}
              </div>
            </div>
          )}

          {/* Benefits + Industries */}
          {((category.benefits?.length ?? 0) > 0 || (category.industries_served?.length ?? 0) > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {(category.benefits?.length ?? 0) > 0 && (
                <div className="lg:col-span-8 bg-white border border-kivi-gray-light p-6 md:p-8 rounded-kivi shadow-card space-y-5">
                  <h2 className="font-display font-black text-sm uppercase tracking-wider text-kivi-navy border-b border-kivi-cyan/15 pb-2">
                    Why Source {category.name} From Kivi Chemicals
                  </h2>
                  <div className="space-y-4">
                    {category.benefits!.map((benefit, i) => (
                      <div key={i} className="space-y-1">
                        <h3 className="text-sm font-bold text-kivi-navy flex items-center gap-2">
                          <CheckCircle size={15} className="text-kivi-cyan flex-shrink-0" />
                          {benefit.title}
                        </h3>
                        {benefit.description && (
                          <p className="text-sm leading-relaxed text-kivi-gray pl-6">{benefit.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(category.industries_served?.length ?? 0) > 0 && (
                <div className="lg:col-span-4 bg-kivi-surface border border-kivi-cyan/15 p-6 rounded-kivi text-kivi-white shadow-glow-cyan space-y-4">
                  <h2 className="font-display font-black text-xs uppercase tracking-wider text-kivi-cyan border-b border-kivi-cyan/10 pb-3 flex items-center gap-2">
                    <Factory size={14} /> Industries Served
                  </h2>
                  <ul className="space-y-2 text-xs">
                    {category.industries_served!.map((industry, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-kivi-cyan" />
                        {industry}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Products in this category — internal links */}
          {products.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-black text-lg text-kivi-navy uppercase tracking-wide">
                  {category.name} Products ({products.length})
                </h2>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-kivi-cyan hover:text-kivi-cyan-hover transition-colors"
                >
                  Browse in Catalogue <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {faqs.length > 0 && (
            <div className="bg-white border border-kivi-gray-light p-6 md:p-8 rounded-kivi shadow-card space-y-6">
              <h2 className="font-display font-black text-lg text-kivi-navy uppercase tracking-wide">
                Frequently Asked Questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                {faqs.map((faq, i) => (
                  <div key={i} className="space-y-1.5">
                    <h3 className="text-sm font-bold text-kivi-navy">{faq.question}</h3>
                    <p className="text-sm leading-relaxed text-kivi-gray">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
