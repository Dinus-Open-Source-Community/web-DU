import { useQuery } from '@tanstack/react-query'
import { adminDashboardKeys } from './query-keys'
import { fetchFinancialSummary, type DashboardPeriod } from '@/services/admin-dashboard'

// Halaman Laporan Keuangan selalu menampilkan rentang 12 bulan (tanpa periode
  // yang bisa dipilih), jadi period dikirim eksplisit agar tidak ikut berubah
  // oleh state dasbor.
const FINANCIAL_PERIOD: DashboardPeriod = '12m'

export function useAdminFinancial() {
  const query = useQuery({
    queryKey: adminDashboardKeys.financialCharts(FINANCIAL_PERIOD),
    queryFn: () => fetchFinancialSummary(FINANCIAL_PERIOD),
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
