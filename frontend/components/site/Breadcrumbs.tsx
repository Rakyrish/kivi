import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  name: string
  url: string
}

function toPath(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

// Visible breadcrumb trail that mirrors the BreadcrumbList JSON-LD emitted
// alongside it — Google's structured data guidelines expect markup to match
// what's actually visible on the page, and this also gives every product/
// category/blog page keyword-rich internal links back up the hierarchy.
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted, #8A98A8)' }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={item.url} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="flex-shrink-0" />}
            {isLast ? (
              <span className="font-bold" style={{ color: 'var(--text-heading, #002040)' }} aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link href={toPath(item.url) || '/'} className="hover:text-kivi-cyan transition-colors">
                {item.name}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
