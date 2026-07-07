import { Metadata } from 'next'
import { Alice, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import { SITE } from '@/lib/constants'
import './globals.css'

const alice = Alice({
  subsets: ['latin'],
  variable: '--font-alice',
  weight: '400',
  display: 'swap',
  preload: true,
})

// ── Data / Mono Face: JetBrains Mono ──
// For CAS numbers, molecular weights, purity %, UN codes, chemical formulas
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '700'],
  display: 'swap',
  preload: false, // Below-the-fold — don't block first paint
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.description,
  keywords: SITE.keywords,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: SITE.analytics.siteVerification,
  },
  icons: {
    icon: '/kivi.jpeg',
    shortcut: '/kivi.jpeg',
    apple: '/kivi.jpeg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: '/kivi.jpeg',
        width: 1550,
        height: 602,
        alt: `${SITE.name} — ${SITE.tagline}`,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ['/kivi.jpeg'],
    creator: SITE.social.twitter || '@kivichemicals',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${alice.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen flex flex-col bg-kivi-white font-sans">
        <Script id="kivi-theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var stored = localStorage.getItem('kivi-theme');
                var preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                document.documentElement.dataset.theme = stored || preferred;
              } catch (error) {
                document.documentElement.dataset.theme = 'dark';
              }
            })();
          `}
        </Script>
        {children}

        {/* Google Analytics — loads after interactive, never blocks rendering */}
        {SITE.analytics.gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${SITE.analytics.gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${SITE.analytics.gaId}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}

