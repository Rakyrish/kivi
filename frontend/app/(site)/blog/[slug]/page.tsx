import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import { articleSchema, breadcrumbSchema } from '@/lib/schema'
import SchemaMarkup from '@/components/site/SchemaMarkup'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import { SITE } from '@/lib/constants'

export const revalidate = 3600 // ISR

async function getPostData(slug: string) {
  try {
    return await api.getBlogPost(slug)
  } catch (e) {
    return null
  }
}

export async function generateStaticParams() {
  try {
    const posts = await api.getBlogPosts()
    return posts.map((p) => ({ slug: p.slug }))
  } catch (e) {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const post = await getPostData(resolvedParams.slug)
  if (!post) return {}

  return buildMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.summary,
    keywords: post.keywords,
    image: post.image,
    path: `/blog/${post.slug}`,
    type: 'article',
  })
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const post = await getPostData(resolvedParams.slug)
  if (!post) notFound()

  const publishedDate = post.published_at || post.created_at
  const breadcrumbItems = [
    { name: 'Home', url: SITE.url },
    { name: 'Blog', url: `${SITE.url}/blog` },
    { name: post.title, url: `${SITE.url}/blog/${post.slug}` },
  ]

  return (
    <div className="min-h-screen py-12" style={{ background: 'var(--bg-page)', color: 'var(--text-muted)' }}>
      <SchemaMarkup schema={articleSchema(post)} />
      <SchemaMarkup schema={breadcrumbSchema(breadcrumbItems)} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Back Link */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00A0C0] hover:text-[#00A0E0] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Insights
          </Link>
        </div>

        {/* Article Box */}
        <article
          className="border rounded-[4px] shadow-sm overflow-hidden p-6 md:p-10 space-y-6"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
        >
          {/* Metadata */}
          <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            <Calendar size={12} />
            <time dateTime={publishedDate} className="font-mono">
              {new Date(publishedDate).toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
          </div>

          {/* Title */}
          <h1 className="font-display font-black text-2xl md:text-4xl uppercase tracking-wide leading-tight" style={{ color: 'var(--text-heading)' }}>
            {post.title}
          </h1>

          {/* Summary / Lead paragraph */}
          <p className="text-xs md:text-sm font-semibold italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {post.summary}
          </p>

          {/* Cover Image */}
          {post.image && (
            <div className="relative aspect-video w-full rounded-[2px] overflow-hidden border" style={{ background: 'var(--bg-card-alt)', borderColor: 'var(--border-card)' }}>
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Body Content */}
          <div className="border-t pt-8 text-xs md:text-sm leading-relaxed space-y-4 whitespace-pre-line font-sans" style={{ borderColor: 'var(--border-card)', color: 'var(--text-muted)' }}>
            {post.content}
          </div>
        </article>
      </div>
    </div>
  )
}
