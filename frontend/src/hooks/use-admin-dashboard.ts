import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { adminDashboardKeys } from './query-keys'
import {
  fetchDashboardKpis,
} from '@/services/admin-dashboard'
import {
  fetchAdminDashboardAnalytics,
} from '@/services/admin-dashboard-analytics'

const PERIOD_OPTIONS: { value: string; label: string }[] = [
  { value: '7d', label: '7 Hari' },
  { value: '30d', label: '30 Hari' },
  { value: '90d', label: '90 Hari' },
  { value: '12m', label: '12 Bulan' },
]

export function useAdminDashboard() {
  const [period, setPeriod] = useState('30d')

  const kpis = useQuery({
    queryKey: adminDashboardKeys.kpis('all'),
    queryFn: () => fetchDashboardKpis(),
    staleTime: 60_000,
  })

  const analytics = useQuery({
    queryKey: ['admin-dashboard', 'analytics', 30],
    queryFn: () => fetchAdminDashboardAnalytics(30),
    staleTime: 120_000,
  })

  return {
    period,
    setPeriod,
    periodOptions: PERIOD_OPTIONS,
    kpis,
    analytics,
  }
}
