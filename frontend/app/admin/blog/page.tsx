import Link from 'next/link'
import { Plus, Pencil, CheckCircle, XCircle, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import type { BlogPost } from '@/types'

export default async function AdminBlogPage() {
  let posts: BlogPost[] = []

  try {
    posts = await api.getBlogPosts()
  } catch (_) {}

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-[#F4F7FA] uppercase tracking-wide">Blog Posts</h1>
          <p className="text-xs text-[#606060] mt-1">{posts.length} articles in the insights desk</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] transition-colors text-xs font-bold uppercase tracking-wider rounded-[2px]"
        >
          <Plus size={14} />
          New Post
        </Link>
      </div>

      {/* Posts Table */}
      <div className="bg-[#081525] border border-[#00A0C0]/15 rounded-[4px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#94A3B8]">
            <thead>
              <tr className="bg-[#002040]/60 border-b border-[#00A0C0]/15 font-display text-[#00A0C0] uppercase tracking-wider text-[10px]">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3 text-center">Published</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#606060]">
                    No blog posts yet. Click &ldquo;New Post&rdquo; to get started.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-b border-[#00A0C0]/5 hover:bg-[#002040]/20 transition-colors">
                    <td className="px-5 py-3 font-bold text-[#F4F7FA] max-w-xs truncate">
                      {post.title}
                    </td>
                    <td className="px-5 py-3 font-mono text-[10px] text-[#606060]">{post.slug}</td>
                    <td className="px-5 py-3 text-center">
                      {post.is_published
                        ? <CheckCircle size={14} className="text-emerald-400 inline" />
                        : <XCircle size={14} className="text-red-400 inline" />}
                    </td>
                    <td className="px-5 py-3 font-mono text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#606060]" />
                        {new Date(post.created_at).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/blog/${post.slug}/edit`}
                        className="text-[#00A0C0] hover:text-[#00A0E0] transition-colors"
                        title="Edit post"
                      >
                        <Pencil size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
