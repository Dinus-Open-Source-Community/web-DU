'use client'

import { CategoryBarChart } from '@/components/charts/CategoryBarChart'
import { ChartCard } from '@/components/charts/ChartCard'
import { TransactionRatioChart } from '@/components/charts/TransactionRatioChart'
import { getMonthlyRevenue12m, getRevenueByCategory, getRevenueSourceRatio } from '@/lib/data/repository'

const currencyCompact = (v: number) =>
  v >= 1_000_000_000
    ? `${(v / 1_000_000_000).toFixed(1)}M`
    : `${(v / 1_000_000).toFixed(0)}jt`

export function MonthlyRevenueChart() {
  const monthlyRevenue = getMonthlyRevenue12m()
  return (
    <ChartCard
      title="Monthly Revenue (12 bulan)"
      subtitle="Tren pendapatan kotor dari seluruh transaksi.">
      <CategoryBarChart
        data={monthlyRevenue}
        orientation="vertical"
        height={300}
        valueFormatter={currencyCompact}
      />
    </ChartCard>
  )
}

export function RevenueBreakdownCharts() {
  const categoryData = getRevenueByCategory()
  const sourceRatio = getRevenueSourceRatio()
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <ChartCard
        title="Revenue by Category"
        subtitle="Kontribusi kategori terhadap total pendapatan."
        className="xl:col-span-2">
        <CategoryBarChart
          data={categoryData}
          orientation="horizontal"
          height={300}
          valueFormatter={currencyCompact}
        />
      </ChartCard>
      <ChartCard title="Revenue Source" subtitle="Rasio pendapatan berdasarkan sumbernya.">
        <TransactionRatioChart data={sourceRatio} height={300} />
      </ChartCard>
    </section>
  )
}
