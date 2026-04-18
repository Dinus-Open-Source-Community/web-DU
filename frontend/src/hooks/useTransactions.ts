import { useMemo } from 'react'
import { filterTransactions, sortTransactions, paginateTransactions } from '@/lib/func'
import { getTransactionsSource } from '@/lib/data/repository'
import type { TransactionSortKey, SortDirection } from '@/lib/types'

interface UseTransactionsOptions {
  searchQuery?: string
  sortKey?: TransactionSortKey
  sortDirection?: SortDirection
  currentPage?: number
  rowsPerPage?: number
}

/**
 * Riwayat transaksi; sumber data dari fixture hanya jika mock aktif.
 */
export function useTransactions({
  searchQuery = '',
  sortKey = 'transactionId',
  sortDirection = 'desc',
  currentPage = 1,
  rowsPerPage = 10,
}: UseTransactionsOptions = {}) {
  const { filtered, sorted, paginated, totalPages } = useMemo(() => {
    const source = getTransactionsSource()
    const filtered = filterTransactions(source, searchQuery)
    const sorted = sortTransactions(filtered, sortKey, sortDirection)
    const paginated = paginateTransactions(sorted, currentPage, rowsPerPage)
    const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage))
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

export function useTransaction(uid: string) {
  const transaction = useMemo(() => {
    return getTransactionsSource().find((t) => t.uid === uid) || null
  }, [uid])

  return {
    transaction,
    isLoading: false,
    found: transaction !== null,
  }
}

export function useTransactionStats() {
  const stats = useMemo(() => {
    const transactionsHistoryData = getTransactionsSource()
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
