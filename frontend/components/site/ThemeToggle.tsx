'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'dark' | 'light'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('kivi-theme') as Theme | null
    const systemTheme: Theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    const initialTheme = stored || systemTheme
    setTheme(initialTheme)
    document.documentElement.dataset.theme = initialTheme
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem('kivi-theme', nextTheme)
  }

  if (!mounted) {
    return (
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-[2px]" />
    )
  }

  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      id="theme-toggle"
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] border transition-all duration-200"
      style={{
        background: 'var(--bg-input)',
        borderColor: 'var(--border-input)',
        color: 'var(--kivi-cyan)',
      }}
      aria-label={label}
      title={label}
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  )
}
