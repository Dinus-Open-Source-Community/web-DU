import { DollarSign, Percent, ShoppingBag, TrendingUp } from 'lucide-react'
import { PageHeader } from '../../components/shared/Header'
import { StatCard } from '../../components/shared/StatCard'
import { ChartCard } from '../../components/shared/ChartCard'
import { CategoryBarChart } from '../../components/shared/BarChart'
import { TransactionRatioChart } from '../../components/shared/RatioChart'
import type { ChartDataPoint, ChartRatioPoint } from '../../lib/types/utils'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import { CurrencyCompact, FormatRupiah } from '../../lib/func/func'

export default function AdminFinancialAnalyticsPage() {
  const monthlyRevenue: ChartDataPoint[] = [
    { label: 'Jul 2023', value: 4_500_000 },
    { label: 'Aug 2023', value: 5_200_000 },
    { label: 'Sep 2023', value: 4_800_000 },
    { label: 'Oct 2023', value: 5_500_000 },
    { label: 'Nov 2023', value: 6_000_000 },
    { label: 'Dec 2023', value: 5_800_000 },
    { label: 'Jan 2024', value: 6_200_000 },
    { label: 'Feb 2024', value: 6_500_000 },
    { label: 'Mar 2024', value: 6_300_000 },
    { label: 'Apr 2024', value: 6_700_000 },
    { label: 'May 2024', value: 7_000_000 },
    { label: 'Jun 2024', value: 7_500_000 },
  ]
  const categoryData: ChartDataPoint[] = [
    { label: 'Programming', value: 15_000_000 },
    { label: 'Design', value: 10_000_000 },
    { label: 'Business', value: 8_000_000 },
    { label: 'Marketing', value: 5_000_000 },
    { label: 'Photography', value: 3_000_000 },
  ]
  const sourceRatio: ChartRatioPoint[] = [
    { label: 'Website', value: 0.5, color: '#4F46E5' },
    { label: 'Mobile App', value: 0.3, color: '#3B82F6' },
    { label: 'Affiliate', value: 0.15, color: '#10B981' },
    { label: 'Other', value: 0.05, color: '#6B7280' },
  ]
  const totalRevenue12m = monthlyRevenue.reduce((acc, m) => acc + m.value, 0)
  const lastMonth = monthlyRevenue.at(-1)?.value ?? 0
  const prevMonth = monthlyRevenue.at(-2)?.value ?? 0
  const momPct = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0

  return (
    <AppSidebarProvider role="admin" user={{ name: 'Admin', email: 'admin@doscom.id' }}>
      <div className="flex flex-col gap-6">
        <PageHeader title="Financial Reports" subtitle="Ringkasan pendapatan, distribusi kategori, dan sumber penjualan." />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard variant="kpi" label="Revenue (12 bulan)" value={FormatRupiah(totalRevenue12m)} trendValue={14.6} trendDirection="up" trendLabel="YoY" icon={<DollarSign className="h-5 w-5" />} />
          <StatCard
            variant="kpi"
            label="Revenue Bulan Ini"
            value={FormatRupiah(lastMonth)}
            trendValue={Number(momPct.toFixed(1))}
            trendDirection={momPct >= 0 ? 'up' : 'down'}
            trendLabel="vs bulan lalu"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard variant="kpi" label="Avg Order Value" value={FormatRupiah(486_000)} trendValue={2.1} trendDirection="up" trendLabel="30 hari" icon={<ShoppingBag className="h-5 w-5" />} />
          <StatCard variant="kpi" label="Conversion Rate" value="4,8%" trendValue={0.4} trendDirection="up" trendLabel="vs minggu lalu" icon={<Percent className="h-5 w-5" />} />
        </section>

        <ChartCard title="Monthly Revenue (12 bulan)" subtitle="Tren pendapatan kotor dari seluruh transaksi.">
          <CategoryBarChart data={monthlyRevenue} orientation="vertical" height={300} valueFormatter={CurrencyCompact} />
        </ChartCard>
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard title="Revenue by Category" subtitle="Kontribusi kategori terhadap total pendapatan." className="xl:col-span-2">
            <CategoryBarChart data={categoryData} orientation="horizontal" height={300} valueFormatter={CurrencyCompact} />
          </ChartCard>
          <ChartCard title="Revenue Source" subtitle="Rasio pendapatan berdasarkan sumbernya.">
            <TransactionRatioChart data={sourceRatio} height={300} />
          </ChartCard>
        </section>
      </div>
    </AppSidebarProvider>
  )
}
