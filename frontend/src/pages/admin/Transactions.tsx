import { TransactionsDashboard } from '../../components/Admin/Transactions/TransDashboard'
import { PageHeader } from '../../components/shared/Header'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { useAdminTransactions } from '@/hooks/use-admin-transactions'

export default function AdminTransactionsPage() {
  const sidebarUser = useSidebarUser('admin')
  const vm = useAdminTransactions()

  return (
    <AppSidebarProvider role="admin" user={sidebarUser}>
      <div className="flex flex-col gap-6">
        <PageHeader title="Transaksi" subtitle="Pantau pendapatan, rasio status pembayaran, dan semua transaksi platform." />
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
