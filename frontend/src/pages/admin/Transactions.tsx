import { TransactionsDashboard } from '../../components/Admin/Transactions/TransDashboard'
import { PageHeader } from '../../components/shared/Header'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import {
  appShellGridOverlayClassName,
  appShellPageBgClassName,
} from '@/lib/design/app-shell-tokens'
import { appPageContentClassName } from '@/lib/layout/page-layout'
import { cn } from '@/lib/utils'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { useAdminTransactions } from '@/hooks/use-admin-transactions'

export default function AdminTransactionsPage() {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()
  const vm = useAdminTransactions()

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
      contentClassName={cn(appPageContentClassName, appShellPageBgClassName, 'relative')}
    >
      <div aria-hidden className={appShellGridOverlayClassName} />
      <div className="relative z-[1] flex flex-col gap-6">
        <PageHeader
          className="mb-0 space-y-1.5"
          title="Transaksi"
          subtitle="Pantau pendapatan, rasio status pembayaran, dan semua transaksi platform."
        />
        <TransactionsDashboard
          transactions={vm.transactions}
          summary={vm.summary}
          dailyStats={vm.dailyStats}
          ratioData={vm.ratioData}
          page={vm.page}
          totalPages={vm.totalPages}
          onPageChange={vm.setPage}
          search={vm.search}
          onSearchChange={vm.handleSearchChange}
          onSearchSubmit={vm.handleSearchSubmit}
          statusFilter={vm.statusFilter}
          onStatusChange={vm.handleStatusChange}
          methodFilter={vm.methodFilter}
          onMethodChange={vm.handleMethodChange}
          isLoading={vm.isLoading}
          isFetching={vm.isFetching}
        />
      </div>
    </AppSidebarProvider>
  )
}
