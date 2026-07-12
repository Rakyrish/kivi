import Link from 'next/link'
import { Plus, Pencil, CheckCircle, XCircle, Calendar, FileText } from 'lucide-react'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
import type { BlogPost } from '@/types'

export default async function AdminBlogPage() {
  let posts: BlogPost[] = []

  try {
    posts = await api.getBlogPosts({ forwardAuth: true })
  } catch (_) {}

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-xl sm:text-2xl uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Blog Posts</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{posts.length} articles in the insights desk</p>
        </div>
        <Link
          href={ROUTES.admin.blogNew}
          className="inline-flex items-center gap-2 px-3 sm:px-5 py-2.5 transition-colors text-xs font-bold uppercase tracking-wider rounded-[2px] shrink-0"
          style={{ background: 'var(--kivi-cyan)', color: '#002040' }}
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Post</span>
        </Link>
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden sm:block border rounded-[4px] overflow-hidden shadow-lg" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
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

      {/* ── Mobile card list ── */}
      <div className="sm:hidden space-y-3">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-xs rounded-[4px] border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)', color: 'var(--text-muted)' }}>
            No blog posts yet. Tap &ldquo;New Post&rdquo; to get started.
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="rounded-[4px] border p-4 flex items-start gap-3"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
            >
              <FileText size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--kivi-cyan)' }} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs mb-1 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                  {post.title}
                </div>
                <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="font-mono truncate max-w-[120px]">{post.slug}</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(post.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="mt-1.5">
                  {post.is_published
                    ? <span className="badge-in-stock text-[9px] px-1.5 py-0.5 rounded font-bold">Published</span>
                    : <span className="badge-out-of-stock text-[9px] px-1.5 py-0.5 rounded font-bold">Draft</span>}
                </div>
              </div>
              <Link
                href={ROUTES.admin.blogEdit(post.slug)}
                className="p-1.5 rounded-[2px] transition-colors shrink-0"
                style={{ color: 'var(--kivi-cyan)', background: 'var(--kivi-cyan-muted)' }}
                title="Edit post"
              >
                <Pencil size={13} />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
