import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  filterTransactions,
  paginateTransactions,
  type TransactionStatusFilter,
} from '@/lib/transactions/filter-transactions'
import type { IUserData } from '@/lib/types/user'

const ITEMS_PER_PAGE = 6

export function useStudentTransactionsViewModel(profile: IUserData | null | undefined) {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TransactionStatusFilter>('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  const transactions = useMemo(() => profile?.transaction_history ?? [], [profile])

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, searchQuery, statusFilter),
    [transactions, searchQuery, statusFilter],
  )

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE))

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedTransactions = useMemo(
    () => paginateTransactions(filteredTransactions, currentPage, ITEMS_PER_PAGE),
    [filteredTransactions, currentPage],
  )

  const submitSearch = useCallback(() => {
    setSearchQuery(searchInput)
  }, [searchInput])

  return {
    searchInput,
    setSearchInput,
    submitSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedTransactions,
    hasTransactions: filteredTransactions.length > 0,
    totalFilteredCount: filteredTransactions.length,
  }
}
