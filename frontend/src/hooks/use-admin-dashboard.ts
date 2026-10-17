import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { adminDashboardKeys } from './query-keys'
import {
  fetchDashboardKpis,
  fetchRecentTransactions,
  fetchTransactionSummary,
  fetchFinancialSummary,
  type DashboardPeriod,
  type TransactionSummary,
} from '@/services/admin-dashboard'
import type { IChartRatioPoint } from '@/lib/types/components/charts'

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: '7d', label: '7 Hari' },
  { value: '30d', label: '30 Hari' },
  { value: '90d', label: '90 Hari' },
  { value: '12m', label: '12 Bulan' },
]

function mapTransactionSummaryToRatio(summary: TransactionSummary): IChartRatioPoint[] {
  return [
    { label: 'Lunas', value: summary.paidCount, color: '#10B981' },
    { label: 'Menunggu', value: summary.pendingCount, color: '#F59E0B' },
    { label: 'Gagal', value: summary.failedCount, color: '#EF4444' },
  ]
}

export function useAdminDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>('30d')

  const kpis = useQuery({
    queryKey: adminDashboardKeys.kpis(period),
    queryFn: () => fetchDashboardKpis(period),
    staleTime: 60_000,
  })

  // Period diteruskan ke seluruh query, bukan hanya KPI, supaya grafik dan tabel
  // selalu konsisten dengan tab periode yang dipilih user.
  const RECENT_LIMIT = 5

  const recentTransactions = useQuery({
    queryKey: adminDashboardKeys.recentTransactions(RECENT_LIMIT, period),
    queryFn: () => fetchRecentTransactions(RECENT_LIMIT, period),
    staleTime: 60_000,
  })

  const transactionSummary = useQuery({
    queryKey: adminDashboardKeys.transactionSummary(period),
    queryFn: () => fetchTransactionSummary(period),
    staleTime: 60_000,
  })

  const financialCharts = useQuery({
    queryKey: adminDashboardKeys.financialCharts(period),
    queryFn: () => fetchFinancialSummary(period),
    staleTime: 120_000,
  })

  const transactionStatusRatio = useMemo(
    () => transactionSummary.data ? mapTransactionSummaryToRatio(transactionSummary.data) : [],
    [transactionSummary.data],
  )

  return {
    period,
    setPeriod,
    periodOptions: PERIOD_OPTIONS,
    kpis,
    recentTransactions,
    transactionSummary,
    transactionStatusRatio,
    financialCharts,
  }
}
