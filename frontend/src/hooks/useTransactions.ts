import { useMemo } from 'react'
import { filterTransactions, sortTransactions, paginateTransactions } from '@/lib/func'
import { transactionsHistoryData } from '@/lib/dummyData'
import type { TransactionHistoryItem, TransactionSortKey, SortDirection } from '@/lib/types'

interface UseTransactionsOptions {
  searchQuery?: string
  sortKey?: TransactionSortKey
  sortDirection?: SortDirection
  currentPage?: number
  rowsPerPage?: number
}

/**
 * Hook untuk fetch dan manipulasi transaction history
 * Supports searching, sorting, dan pagination
 * Data sumber: dummyData.tsx
 */
export function useTransactions({ searchQuery = '', sortKey = 'transactionId', sortDirection = 'desc', currentPage = 1, rowsPerPage = 10 }: UseTransactionsOptions = {}) {
  const { filtered, sorted, paginated, totalPages } = useMemo(() => {
    // 1. Filter berdasarkan search query
    const filtered = filterTransactions(transactionsHistoryData, searchQuery)

    // 2. Sort hasil filter
    const sorted = sortTransactions(filtered, sortKey, sortDirection)

    // 3. Paginate hasil sort
    const paginated = paginateTransactions(sorted, currentPage, rowsPerPage)
    const totalPages = Math.ceil(sorted.length / rowsPerPage)

    return { filtered, sorted, paginated, totalPages }
  }, [searchQuery, sortKey, sortDirection, currentPage, rowsPerPage])

  return {
    transactions: paginated,
    totalTransactions: filtered.length,
    totalPages,
    isLoading: false,
    error: null,
  }
}

/**
 * Hook untuk mendapatkan transaction detail berdasarkan UID
 */
export function useTransaction(uid: string) {
  const transaction = useMemo(() => {
    return transactionsHistoryData.find((t) => t.uid === uid) || null
  }, [uid])

  return {
    transaction,
    isLoading: false,
    found: transaction !== null,
  }
}

/**
 * Hook untuk mendapatkan transaction statistics
 */
export function useTransactionStats() {
  const stats = useMemo(() => {
    const total = transactionsHistoryData.length
    const paid = transactionsHistoryData.filter((t) => t.paymentStatus === 'PAID').length
    const pending = transactionsHistoryData.filter((t) => t.paymentStatus === 'PENDING').length
    const failed = transactionsHistoryData.filter((t) => t.paymentStatus === 'FAILED').length

    const totalAmount = transactionsHistoryData.reduce((sum, t) => sum + t.price, 0)

    return {
      total,
      paid,
      pending,
      failed,
      totalAmount,
    }
  }, [])

  return stats
}
