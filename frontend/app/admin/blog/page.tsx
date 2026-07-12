import Link from 'next/link'
import { Plus, Pencil, CheckCircle, XCircle, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
import type { BlogPost } from '@/types'

export default async function AdminBlogPage() {
  let posts: BlogPost[] = []

  try {
    posts = await api.getBlogPosts({ forwardAuth: true })
  } catch (_) {}

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Blog Posts</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{posts.length} articles in the insights desk</p>
        </div>
        <Link
          href={ROUTES.admin.blogNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 transition-colors text-xs font-bold uppercase tracking-wider rounded-[2px]"
          style={{ background: 'var(--kivi-cyan)', color: '#002040' }}
        >
          <Plus size={14} />
          New Post
        </Link>
      </div>

      {/* Posts Table */}
      <div className="border rounded-[4px] overflow-hidden shadow-lg" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" style={{ color: 'var(--text-secondary)' }}>
            <thead>
              <tr className="font-display uppercase tracking-wider text-[10px]" style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-divider)', color: 'var(--kivi-cyan)' }}>
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
                  <td colSpan={5} className="px-5 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    No blog posts yet. Click &ldquo;New Post&rdquo; to get started.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-b transition-colors hover:bg-[var(--bg-table-row-alt)]" style={{ borderColor: 'var(--border-table)' }}>
                    <td className="px-5 py-3 font-bold max-w-xs truncate" style={{ color: 'var(--text-primary)' }}>
                      {post.title}
                    </td>
                    <td className="px-5 py-3 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{post.slug}</td>
                    <td className="px-5 py-3 text-center">
                      {post.is_published
                        ? <CheckCircle size={14} className="text-emerald-400 inline" />
                        : <XCircle size={14} className="text-red-400 inline" />}
                    </td>
                    <td className="px-5 py-3 font-mono text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                        {new Date(post.created_at).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={ROUTES.admin.blogEdit(post.slug)}
                        className="transition-colors"
                        style={{ color: 'var(--kivi-cyan)' }}
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

