import { PageHeader } from '../../components/shared/Header'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import { DashboardError } from '../../components/Admin/Dashboard/DashboardError'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'

export default function AdminTransactionsPage() {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
    >
      <div className="relative z-[1] flex flex-col gap-6">
        <PageHeader
          className="mb-0 space-y-1.5"
          title="Transaksi"
          subtitle="Halaman transaksi tidak lagi tersedia"
        />
        <DashboardError
          message="Fitur transaksi dan laporan keuangan telah dihapus dari sistem"
        />
      </div>
    </AppSidebarProvider>
  )
}
