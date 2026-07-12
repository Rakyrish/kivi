import Link from 'next/link'

interface AdminPaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export default function AdminPagination({ currentPage, totalPages, basePath }: AdminPaginationProps) {
  if (totalPages <= 1) return null

  const pageHref = (page: number) => (page <= 1 ? basePath : `${basePath}?page=${page}`)

  let pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1)
  if (totalPages > 7) {
    if (currentPage <= 4) pages = Array.from({ length: 7 }, (_, i) => i + 1)
    else if (currentPage >= totalPages - 3) pages = Array.from({ length: 7 }, (_, i) => totalPages - 6 + i)
    else pages = Array.from({ length: 7 }, (_, i) => currentPage - 3 + i)
  }

  return (
    <div className="flex justify-center items-center gap-2 pt-2">
      <Link
        href={pageHref(Math.max(currentPage - 1, 1))}
        aria-disabled={currentPage === 1}
        className="px-4 py-2 text-xs font-bold uppercase rounded-[2px] border transition-all"
        style={{
          color: 'var(--kivi-cyan)',
          borderColor: 'var(--border-input)',
          background: 'var(--bg-input)',
          pointerEvents: currentPage === 1 ? 'none' : 'auto',
          opacity: currentPage === 1 ? 0.4 : 1,
        }}
      >
        Previous
      </Link>
      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <Link
            key={page}
            href={pageHref(page)}
            className="w-8 h-8 flex items-center justify-center text-xs font-mono rounded-[2px] transition-all border"
            style={{
              background: currentPage === page ? 'var(--kivi-cyan)' : 'var(--bg-input)',
              color: currentPage === page ? '#002040' : 'var(--text-secondary)',
              borderColor: currentPage === page ? 'var(--kivi-cyan)' : 'var(--border-input)',
            }}
          >
            {page}
          </Link>
        ))}
      </div>
      <Link
        href={pageHref(Math.min(currentPage + 1, totalPages))}
        aria-disabled={currentPage === totalPages}
        className="px-4 py-2 text-xs font-bold uppercase rounded-[2px] border transition-all"
        style={{
          color: 'var(--kivi-cyan)',
          borderColor: 'var(--border-input)',
          background: 'var(--bg-input)',
          pointerEvents: currentPage === totalPages ? 'none' : 'auto',
          opacity: currentPage === totalPages ? 0.4 : 1,
        }}
      >
        Next
      </Link>
    </div>
  )
}
