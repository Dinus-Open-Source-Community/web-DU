import type { SortDirection, TransactionHistoryItem, TransactionSortKey } from '@/lib/types'
import { paymentStatusSortRank } from '@/lib/constants/payment-status'
import { getTransactionsSource } from '@/lib/data/repository'

const normalizeText = (value: string) => value.toLowerCase().trim()

export const filterTransactions = (transactions: TransactionHistoryItem[], searchQuery: string) => {
  if (!searchQuery.trim()) return transactions

  const keyword = normalizeText(searchQuery)
  return transactions.filter((transaction) => {
    return [transaction.uid, transaction.transactionId, transaction.courseName, transaction.classType, transaction.paymentStatus, transaction.paymentMethod].join(' ').toLowerCase().includes(keyword)
  })
}

export const sortTransactions = (transactions: TransactionHistoryItem[], sortKey: TransactionSortKey, sortDirection: SortDirection) => {
  return [...transactions].sort((a, b) => {
    let comparison = 0

    if (sortKey === 'transactionId') {
      const aId = Number(a.transactionId.replace(/\D/g, ''))
      const bId = Number(b.transactionId.replace(/\D/g, ''))
      comparison = aId - bId
    } else if (sortKey === 'courseName') {
      comparison = a.courseName.localeCompare(b.courseName)
    } else if (sortKey === 'classType') {
      comparison = a.classType.localeCompare(b.classType)
    } else if (sortKey === 'price') {
      comparison = a.price - b.price
    } else {
      comparison = paymentStatusSortRank[a.paymentStatus] - paymentStatusSortRank[b.paymentStatus]
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })
}

export const paginateTransactions = (transactions: TransactionHistoryItem[], currentPage: number, rowsPerPage: number) => {
  const startIndex = (currentPage - 1) * rowsPerPage
  return transactions.slice(startIndex, startIndex + rowsPerPage)
}

export const getTransactionByUid = (uid: string) => {
  return getTransactionsSource().find((transaction) => transaction.uid === uid)
}
