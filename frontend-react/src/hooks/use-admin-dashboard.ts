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
    { label: 'Paid', value: summary.paidCount, color: '#10B981' },
    { label: 'Pending', value: summary.pendingCount, color: '#F59E0B' },
    { label: 'Failed', value: summary.failedCount, color: '#EF4444' },
  ]
}

export function useAdminDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>('30d')

  const kpis = useQuery({
    queryKey: adminDashboardKeys.kpis(period),
    queryFn: () => fetchDashboardKpis(period),
    staleTime: 60_000,
  })

  const recentTransactions = useQuery({
    queryKey: adminDashboardKeys.recentTransactions(5),
    queryFn: () => fetchRecentTransactions(5),
    staleTime: 60_000,
  })

  const transactionSummary = useQuery({
    queryKey: adminDashboardKeys.transactionSummary,
    queryFn: fetchTransactionSummary,
    staleTime: 60_000,
  })

  const financialCharts = useQuery({
    queryKey: adminDashboardKeys.financialCharts,
    queryFn: fetchFinancialSummary,
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
