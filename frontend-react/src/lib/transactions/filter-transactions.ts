import type { PaymentStatus, TransactionHistory } from '@/lib/types/transaction'

export type TransactionStatusFilter = 'ALL' | PaymentStatus

const normalizeText = (value: string) => value.toLowerCase().trim()

export function filterTransactions(
  transactions: TransactionHistory[],
  searchQuery: string,
  statusFilter: TransactionStatusFilter,
): TransactionHistory[] {
  const keyword = normalizeText(searchQuery)

  return transactions.filter((transaction) => {
    const matchesStatus =
      statusFilter === 'ALL' || transaction.payment_status === statusFilter

    const matchesSearch =
      !keyword ||
      [
        transaction.uid,
        transaction.reference,
        transaction.course?.title,
        transaction.payment_status,
        transaction.payment_method,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword)

    return matchesSearch && matchesStatus
  })
}

export function paginateTransactions<T>(
  items: T[],
  currentPage: number,
  rowsPerPage: number,
): T[] {
  const startIndex = (currentPage - 1) * rowsPerPage
  return items.slice(startIndex, startIndex + rowsPerPage)
}
