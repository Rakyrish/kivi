import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kivi: {
          // ── Structural darks ──
          navy:          'var(--kivi-navy)',
          slate:         'var(--kivi-slate)',
          surface:       'var(--kivi-surface)',
          // ── Brand accent ──
          cyan:          'var(--kivi-cyan)',
          'cyan-hover':  'var(--kivi-cyan-hover)',
          'cyan-muted':  'var(--kivi-cyan-muted)',
          // ── Neutrals ──
          white:         'var(--kivi-white)',
          gray:          'var(--kivi-gray)',
          'gray-light':  'var(--kivi-gray-light)',
          mid:           'var(--kivi-mid)',
          // ── Chemical-industry semantic ──
          hazard:        'var(--kivi-hazard)',
          'hazard-bg':   'var(--kivi-hazard-bg)',
          success:       'var(--kivi-success)',
          'success-bg':  'var(--kivi-success-bg)',
          error:         'var(--kivi-error)',
          'error-bg':    'var(--kivi-error-bg)',
          purity:        'var(--kivi-purity)',
          'purity-bg':   'var(--kivi-purity-bg)',
        }
      },
      fontFamily: {
        display: ['var(--font-alice)', 'Georgia', 'serif'],
        sans:    ['var(--font-alice)', 'Georgia', 'serif'],
        // Data — JetBrains Mono (CAS numbers, MW, purity %, UN codes)
        mono:    ['var(--font-jetbrains-mono)', 'Cascadia Code', 'monospace'],
      },
      fontSize: {
        // Type scale from design system
        'xs':  ['0.75rem',  { lineHeight: '1.4' }],
        'sm':  ['0.875rem', { lineHeight: '1.5' }],
        'base':['1rem',     { lineHeight: '1.6' }],
        'lg':  ['1.125rem', { lineHeight: '1.5' }],
        'xl':  ['1.375rem', { lineHeight: '1.3' }],
        '2xl': ['1.75rem',  { lineHeight: '1.25' }],
        '3xl': ['2rem',     { lineHeight: '1.2' }],
        '4xl': ['2.5rem',   { lineHeight: '1.15' }],
        '5xl': ['3rem',     { lineHeight: '1.1' }],
        '6xl': ['3.5rem',   { lineHeight: '1.05' }],
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease-out both',
        'fade-in':   'fadeIn 0.3s ease-out both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.8)' },
        },
      },
      borderRadius: {
        'kivi': '4px',
        'kivi-sm': '2px',
        'kivi-lg': '8px',
      },
      boxShadow: {
        'card':      '0 1px 3px rgba(0,32,64,0.08), 0 1px 2px rgba(0,32,64,0.04)',
        'card-hover':'0 4px 12px rgba(0,32,64,0.12), 0 2px 4px rgba(0,32,64,0.06)',
        'glow-cyan': '0 0 20px rgba(0,160,192,0.2)',
      },
    },
  },
  plugins: [],
}
export default config
