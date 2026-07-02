import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, BookOpen, Tag } from 'lucide-react'
import { api } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import type { BlogPost } from '@/types'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({
  title: 'Kivi Insights Desk — Chemical Industry Blog',
  description: 'Technical resources, procurement insights, chemical engineering standards, and regulatory updates for East Africa industrial buyers.',
  path: '/blog',
})

export default async function BlogPage() {
  let posts: BlogPost[] = []
  try { posts = await api.getBlogPosts() } catch {}

  const publishedPosts = posts.filter((p) => p.is_published !== false)
  const featured = publishedPosts[0]
  const latest = publishedPosts.slice(1)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="min-h-screen py-12" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="overline mb-2">Industry Updates</div>
          <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>
            Kivi Insights Desk
          </h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Technical resources, regulatory guidance, chemical engineering standards, and supply management insights for East Africa industrial buyers.
          </p>
        </div>

        {publishedPosts.length === 0 ? (
          <div className="text-center py-16 border rounded-[4px]" style={{ borderColor: 'var(--border-card)', background: 'var(--bg-card)' }}>
            <BookOpen size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--kivi-cyan)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No articles published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Article */}
            {featured && (
              <section>
                <div className="overline mb-4">Featured Article</div>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[4px] border overflow-hidden transition-all duration-300"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)', boxShadow: 'var(--shadow-card)' }}
                >
                  {/* Featured Image */}
                  <div className="relative aspect-video lg:aspect-auto lg:min-h-[320px] overflow-hidden" style={{ background: 'var(--bg-card-alt)' }}>
                    {featured.image ? (
                      <Image
                        src={featured.image}
                        alt={featured.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen size={48} style={{ color: 'var(--kivi-cyan)', opacity: 0.2 }} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-[2px]" style={{ background: 'var(--kivi-cyan)', color: '#002040' }}>
                        Featured
                      </span>
                    </div>
                  </div>

                  {/* Featured Content */}
                  <div className="p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(featured.published_at || featured.created_at)}</span>
                        {featured.reading_time && featured.reading_time > 0 ? (
                          <span className="flex items-center gap-1"><Clock size={11} /> {featured.reading_time} min read</span>
                        ) : null}
                      </div>
                      <h2 className="font-display font-black text-xl md:text-2xl uppercase tracking-wide leading-tight group-hover:text-[var(--kivi-cyan)] transition-colors" style={{ color: 'var(--text-heading)' }}>
                        {featured.title}
                      </h2>
                      <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>
                        {featured.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-6 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--kivi-cyan)' }}>
                      Read Full Article <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Latest Articles */}
            {latest.length > 0 && (
              <section>
                <div className="overline mb-6">Latest Articles</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latest.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group border rounded-[4px] overflow-hidden flex flex-col h-full transition-all duration-300"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)', boxShadow: 'var(--shadow-card)' }}
                    >
                      {/* Post Image */}
                      <div className="relative aspect-video overflow-hidden" style={{ background: 'var(--bg-card-alt)' }}>
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 350px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen size={32} style={{ color: 'var(--kivi-cyan)', opacity: 0.2 }} />
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex flex-col justify-between flex-grow">
                        <div className="space-y-3">
                          {/* Meta */}
                          <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                            <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(post.published_at || post.created_at)}</span>
                            {post.reading_time && post.reading_time > 0 ? (
                              <span className="flex items-center gap-1"><Clock size={10} /> {post.reading_time}m</span>
                            ) : null}
                          </div>


                          {/* Title */}
                          <h3 className="font-display font-bold text-sm uppercase tracking-wide line-clamp-2 group-hover:text-[var(--kivi-cyan)] transition-colors" style={{ color: 'var(--text-heading)' }}>
                            {post.title}
                          </h3>

                          {/* Summary */}
                          <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            {post.summary}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-5 mt-auto">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--kivi-cyan)' }}>
                            Read More <ArrowRight size={12} />
                          </div>
                          {post.ai_generated && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px]" style={{ background: 'var(--kivi-cyan-muted)', color: 'var(--kivi-cyan)' }}>
                              AI Enhanced
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
