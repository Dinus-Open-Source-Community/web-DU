import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useMemo, useState, useCallback } from 'react'
import { adminTransactionsKeys } from './query-keys'
import { fetchAdminTransactions, type AdminTransactionsParams } from '@/services/admin-transactions'
import type { IAdminTransaction, PaymentStatus } from '@/lib/types/transaction'
import type { IChartRatioPoint } from '@/lib/types/components/charts'

export type StatusFilter = 'all' | PaymentStatus
export type MethodFilter = 'all' | 'Bank Transfer' | 'Virtual Account' | 'E-Wallet' | 'QRIS'

export interface DailyTransactionStat {
  date: string
  revenue: number
  paid: number
  pending: number
  failed: number
}

function buildDailyStats(transactions: IAdminTransaction[]): DailyTransactionStat[] {
  if (transactions.length === 0) return []

  const dayMap = new Map<string, DailyTransactionStat>()

  for (const t of transactions) {
    const day = t.purchasedAt.slice(0, 10)
    let stat = dayMap.get(day)
    if (!stat) {
      stat = { date: day, revenue: 0, paid: 0, pending: 0, failed: 0 }
      dayMap.set(day, stat)
    }

    if (t.paymentStatus === 'success') {
      stat.revenue += t.price
      stat.paid += 1
    } else if (t.paymentStatus === 'pending') {
      stat.pending += 1
    } else {
      stat.failed += 1
    }
  }

  return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

const PER_PAGE = 10

function buildApiParams(
  page: number,
  status: StatusFilter,
  search: string,
): AdminTransactionsParams {
  const params: AdminTransactionsParams = {
    page,
    per_page: PER_PAGE,
  }
  if (status !== 'all') params.status = status
  if (search.trim()) params.search = search.trim()
  return params
}

export function useAdminTransactions() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all')
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')

  const apiParams = useMemo(
    () => buildApiParams(page, statusFilter, committedSearch),
    [page, statusFilter, committedSearch],
  )

  const query = useQuery({
    queryKey: adminTransactionsKeys.list(apiParams),
    queryFn: () => fetchAdminTransactions(apiParams),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })

  const transactions = useMemo(() => {
    const rows = query.data?.transactions ?? []
    if (methodFilter === 'all') return rows
    return rows.filter((t) => t.paymentMethod === methodFilter)
  }, [query.data?.transactions, methodFilter])

  const summary = query.data?.summary
  const meta = query.data?.meta

  const dailyStats = useMemo(
    () => buildDailyStats(query.data?.transactions ?? []),
    [query.data?.transactions],
  )

  const ratioData = useMemo<IChartRatioPoint[]>(() => {
    if (!summary) return []
    return [
      { label: 'Paid', value: summary.paidCount, color: '#10B981' },
      { label: 'Pending', value: summary.pendingCount, color: '#F59E0B' },
      { label: 'Failed', value: summary.failedCount, color: '#EF4444' },
    ]
  }, [summary])

  const handleStatusChange = useCallback((value: StatusFilter) => {
    setStatusFilter(value)
    setPage(1)
  }, [])

  const handleMethodChange = useCallback((value: MethodFilter) => {
    setMethodFilter(value)
    setPage(1)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    if (value === '') {
      setCommittedSearch('')
      setPage(1)
    }
  }, [])

  const handleSearchSubmit = useCallback(() => {
    setCommittedSearch(search)
    setPage(1)
  }, [search])

  return {
    transactions,
    summary,
    meta,
    dailyStats,
    ratioData,

    page,
    setPage,
    totalPages: meta?.total_pages ?? 1,

    search,
    statusFilter,
    methodFilter,

    handleSearchChange,
    handleSearchSubmit,
    handleStatusChange,
    handleMethodChange,

    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  }
}
