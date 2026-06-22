import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import type { BlogPost } from '@/types'

export const revalidate = 3600 // ISR revalidation

export const metadata: Metadata = buildMetadata({
  title: 'Blog & Insights',
  description: 'Stay updated on chemical engineering standards, B2B procurement trends, and industrial supply insights in East Africa.',
  path: '/blog',
})

export default async function BlogPage() {
  let posts: BlogPost[] = []

  try {
    posts = await api.getBlogPosts()
  } catch (e) {
    posts = []
  }

  return (
    <div className="bg-[#F4F7FA] min-h-screen py-16 border-t border-[#00A0C0]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-xl mb-12">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#00A0C0] mb-2">
            Industry Updates
          </div>
          <h1 className="font-display font-black text-3xl text-[#002040] uppercase tracking-wide">
            Kivi Insights Desk
          </h1>
          <p className="text-xs text-[#606060] mt-2">
            Read technical resources, regulatory warnings, and supply management guidelines.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 border border-[#00A0C0]/10 bg-white rounded-[4px]">
            <p className="text-xs text-[#94A3B8]">No blog posts found at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group bg-white border border-[#E8EEF4] hover:border-[#00A0C0] rounded-[4px] overflow-hidden flex flex-col h-full transition-all duration-300 shadow-sm"
              >
                {/* Post Image */}
                <div className="relative aspect-video w-full bg-[#002040]/10 overflow-hidden">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 350px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#00A0C0]/20">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2-2m2 2a2 2 0 00.5-2.83l-8.47-8.47a2 2 0 00-2.83 0l-4 4a2 2 0 000 2.83l8.47 8.47a2 2 0 002.83 0l4-4z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] text-[#94A3B8]">
                      <Calendar size={12} />
                      <span className="font-mono">
                        {new Date(post.created_at).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-sm text-[#002040] uppercase tracking-wide line-clamp-2 group-hover:text-[#00A0C0] transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-[11px] text-[#606060] line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  <div className="pt-6 mt-auto">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00A0C0] hover:text-[#00A0E0] transition-colors"
                    >
                      Read Full Article
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
