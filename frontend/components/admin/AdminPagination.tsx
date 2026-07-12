import Link from 'next/link'

interface AdminPaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export default function AdminPagination({ currentPage, totalPages, basePath }: AdminPaginationProps) {
  if (totalPages <= 1) return null

  const pageHref = (page: number) => {
    if (page <= 1) return basePath
    const separator = basePath.includes('?') ? '&' : '?'
    return `${basePath}${separator}page=${page}`
  }

  // Desktop: up to 7 pages; mobile: up to 5 to avoid overflow
  const clamp = (n: number) => Math.min(totalPages, n)
  const buildPages = (count: number) => {
    if (totalPages <= count) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= Math.ceil(count / 2)) return Array.from({ length: count }, (_, i) => i + 1)
    if (currentPage >= totalPages - Math.floor(count / 2))
      return Array.from({ length: count }, (_, i) => totalPages - count + 1 + i)
    return Array.from({ length: count }, (_, i) => currentPage - Math.floor(count / 2) + i)
  }

  const desktopPages = buildPages(7)
  const mobilePages = buildPages(5)

  const NavBtn = ({
    href,
    disabled,
    children,
  }: {
    href: string
    disabled: boolean
    children: React.ReactNode
  }) => (
    <Link
      href={href}
      aria-disabled={disabled}
      className="px-3 py-2 text-xs font-bold uppercase rounded-[2px] border transition-all"
      style={{
        color: 'var(--kivi-cyan)',
        borderColor: 'var(--border-input)',
        background: 'var(--bg-input)',
        pointerEvents: disabled ? 'none' : 'auto',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </Link>
  )

  const PageLink = ({ page, pages }: { page: number; pages: number[] }) =>
    pages.includes(page) ? null : null // handled in map

  return (
    <div className="flex justify-center items-center gap-1.5 pt-2">
      <NavBtn href={pageHref(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>
        ‹ Prev
      </NavBtn>

      {/* Mobile: 5 pages */}
      <div className="flex items-center gap-1 sm:hidden">
        {mobilePages.map((page) => (
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

      {/* Desktop: 7 pages */}
      <div className="hidden sm:flex items-center gap-1">
        {desktopPages.map((page) => (
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

      <NavBtn href={pageHref(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages}>
        Next ›
      </NavBtn>
    </div>
  )
}
