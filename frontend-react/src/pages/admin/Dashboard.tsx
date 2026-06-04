// import { BookOpen, CreditCard, DollarSign, Users } from 'lucide-react'
import { AppSidebarProvider } from '../../components/shared/Sidebar'

import { PageHeader } from '../../components/shared/Header'
import { KpiGrid, type AdminKpi } from '../../components/Admin/Dashboard/Kpi'
import { UnresolvedTickets, type AdminTicket } from '../../components/Admin/Dashboard/Ticket'
import { RecentTransactions } from '../../components/Admin/Dashboard/RecentTransactions'
import type { TransactionHistoryItem } from '../../lib/types/transaction'
import { useAuth } from '@/providers/auth-provider'
import type { IUserData } from '@/lib/types/user'
import { FormatRupiah } from '@/lib/func/func'

export default function Dashboard() {
  const { user } = useAuth()
  const dataKpi: AdminKpi[] = [
    {
      id: 'gross-revenue',
      label: 'Gross Revenue',
      value: FormatRupiah(128_750_000) as string,
      trendValue: 12.4,
      trendDirection: 'up',
      trendLabel: '30 hari terakhir',
      iconName: 'revenue',
    },
    {
      id: 'active-users',
      label: 'Active Users',
      value: '2.418',
      trendValue: 8.1,
      trendDirection: 'up',
      trendLabel: 'vs bulan lalu',
      iconName: 'users',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      value: '684',
      trendValue: 5.6,
      trendDirection: 'up',
      trendLabel: 'minggu ini',
      iconName: 'transactions',
    },
    {
      id: 'conversion-rate',
      label: 'Conversion Rate',
      value: '4,8%',
      trendValue: 0.4,
      trendDirection: 'neutral',
      trendLabel: 'stabil',
      iconName: 'conversion',
    },
  ]
  const dataTickets: AdminTicket[] = []
  const dataTransactions: TransactionHistoryItem[] = []

  return (
    <AppSidebarProvider role="admin" user={user as IUserData}>
      <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard" subtitle="Selamat datang di dashboard admin" />
        <KpiGrid adminKpis={dataKpi} />
        <UnresolvedTickets tickets={dataTickets} />
        <RecentTransactions transactions={dataTransactions} />
      </div>
    </AppSidebarProvider>
  )
}
