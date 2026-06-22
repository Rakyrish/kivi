import Sidebar from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0D1B2A]">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 text-[#F4F7FA]">
        {children}
      </main>
    </div>
  )
}
