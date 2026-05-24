// import { BookOpen, CreditCard, DollarSign, Users } from 'lucide-react'
import { AdminSidebarProvider } from '../../components/shared/Sidebar'

import { PageHeader } from '../../components/shared/Header'
import { KpiGrid, type AdminKpi } from '../../components/Admin/Dashboard/Kpi'
import { UnresolvedTickets, type AdminTicket } from '../../components/Admin/Dashboard/Ticket'
import { RecentTransactions } from '../../components/Admin/Dashboard/RecentTransactions'
import type { TransactionHistoryItem } from '../../lib/types/transaction'

export default function Dashboard() {
  const dataKpi: AdminKpi[] = []
  const dataTickets: AdminTicket[] = []
  const dataTransactions: TransactionHistoryItem[] = []

  return (
    <AdminSidebarProvider>
      <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard" subtitle="Selamat datang di dashboard admin" />
        <KpiGrid adminKpis={dataKpi} />
        <UnresolvedTickets tickets={dataTickets} />
        <RecentTransactions transactions={dataTransactions} />
      </div>
    </AdminSidebarProvider>
  )
}
