import { useQuery } from '@tanstack/react-query'
import { adminDashboardKeys } from './query-keys'
import { fetchFinancialSummary } from '@/services/admin-dashboard'

export function useAdminFinancial() {
  const query = useQuery({
    queryKey: adminDashboardKeys.financialCharts,
    queryFn: fetchFinancialSummary,
    staleTime: 120_000,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
