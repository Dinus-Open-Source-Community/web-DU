import type { Metadata } from 'next'
import { DollarSign, Percent, ShoppingBag, TrendingUp } from 'lucide-react'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { getMonthlyRevenue12m } from '@/lib/data/repository'
import { formatRupiah } from '@/lib/func'

import {
  MonthlyRevenueChart,
  RevenueBreakdownCharts,
} from './_components/FinancialCharts'

export const metadata: Metadata = {
  title: 'Financial Reports — Admin',
  robots: { index: false, follow: false },
}

export default function AdminFinancialAnalyticsPage() {
  const monthlyRevenue = getMonthlyRevenue12m()
  const totalRevenue12m = monthlyRevenue.reduce((acc, m) => acc + m.value, 0)
  const lastMonth = monthlyRevenue[monthlyRevenue.length - 1].value
  const prevMonth = monthlyRevenue[monthlyRevenue.length - 2].value
  const momPct = ((lastMonth - prevMonth) / prevMonth) * 100

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Financial Reports"
        subtitle="Ringkasan pendapatan, distribusi kategori, dan sumber penjualan."
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          variant="kpi"
          label="Revenue (12 bulan)"
          value={formatRupiah(totalRevenue12m)}
          trendValue={14.6}
          trendDirection="up"
          trendLabel="YoY"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          variant="kpi"
          label="Revenue Bulan Ini"
          value={formatRupiah(lastMonth)}
          trendValue={Number(momPct.toFixed(1))}
          trendDirection={momPct >= 0 ? 'up' : 'down'}
          trendLabel="vs bulan lalu"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          variant="kpi"
          label="Avg Order Value"
          value={formatRupiah(486_000)}
          trendValue={2.1}
          trendDirection="up"
          trendLabel="30 hari"
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatCard
          variant="kpi"
          label="Conversion Rate"
          value="4,8%"
          trendValue={0.4}
          trendDirection="up"
          trendLabel="vs minggu lalu"
          icon={<Percent className="h-5 w-5" />}
        />
      </section>

      <MonthlyRevenueChart />
      <RevenueBreakdownCharts />
    </div>
  )
}
