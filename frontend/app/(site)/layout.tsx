import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import FloatingContactCenter from '@/components/site/FloatingContactCenter'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <FloatingContactCenter />
    </>
  )
}
