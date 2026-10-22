import { PageHeader } from '../../components/shared/Header'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import { DashboardError } from '../../components/Admin/Dashboard/DashboardError'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'

export default function AdminFinancialAnalyticsPage() {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
    >
      <div className="relative z-[1] flex flex-col gap-6">
        <PageHeader
          className="mb-0 space-y-1.5"
          title="Laporan Keuangan"
          subtitle="Halaman laporan keuangan tidak lagi tersedia"
        />
        <DashboardError
          message="Fitur laporan keuangan telah dihapus dari sistem"
        />
      </div>
    </AppSidebarProvider>
  )
}

