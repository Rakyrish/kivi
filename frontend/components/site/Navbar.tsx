'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowRight } from 'lucide-react'
import { SITE } from '@/lib/constants'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Blog', href: '/blog' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#002040] border-b border-[#00A0C0]/20 text-[#F4F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#00A0C0]/40 group-hover:ring-[#00A0C0] transition-all duration-300 flex-shrink-0">
                <Image
                  src="/kivi.jpeg"
                  alt="Kivi Chemicals Logo"
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl tracking-tight leading-none text-[#F4F7FA]">
                  {SITE.shortName.toUpperCase()}
                </span>
                <span className="text-[10px] text-[#00A0C0] uppercase tracking-wider font-bold">
                  Chemicals &amp; Solvents
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-[#00A0C0] ${
                  isActive(link.href) ? 'text-[#00A0C0] font-semibold border-b-2 border-[#00A0C0] pb-1' : 'text-[#94A3B8]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider font-bold bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] transition-all duration-300 rounded-[2px]"
            >
              Request Quote
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-sm text-[#94A3B8] hover:text-[#F4F7FA] hover:bg-[#081525] focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#081525] border-b border-[#00A0C0]/20 px-4 pt-2 pb-6 space-y-4">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-sm text-base font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-[#00A0C0] bg-[#002040]'
                  : 'text-[#94A3B8] hover:text-[#F4F7FA] hover:bg-[#002040]/50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#00A0C0]/10 px-3">
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm uppercase tracking-wider font-bold bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] transition-all rounded-[2px]"
            >
              Request Quote
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
