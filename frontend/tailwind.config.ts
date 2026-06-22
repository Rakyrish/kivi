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
          navy: 'var(--kivi-navy)',
          cyan: 'var(--kivi-cyan)',
          'cyan-light': 'var(--kivi-cyan-light)',
          white: 'var(--kivi-white)',
          slate: 'var(--kivi-slate)',
          gray: 'var(--kivi-gray)',
          'gray-light': 'var(--kivi-gray-light)',
          surface: 'var(--kivi-surface)',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
