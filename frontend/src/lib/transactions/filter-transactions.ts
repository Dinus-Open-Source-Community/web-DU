import type { PaymentStatus, TransactionHistory } from '@/lib/types/transaction'

export type TransactionStatusFilter = 'ALL' | PaymentStatus

const normalizeText = (value: string) => value.toLowerCase().trim()

const STATUS_ALIASES: Record<string, PaymentStatus> = {
  pending: 'pending',
  unpaid: 'pending',
  awaiting_payment: 'pending',
  success: 'success',
  paid: 'success',
  failed: 'failed',
  expired: 'failed',
}

function normalizePaymentStatus(value?: string | null): PaymentStatus | null {
  if (!value) return null
  return STATUS_ALIASES[normalizeText(value)] ?? null
}

export function filterTransactions(
  transactions: TransactionHistory[],
  searchQuery: string,
  statusFilter: TransactionStatusFilter,
): TransactionHistory[] {
  const keyword = normalizeText(searchQuery)

  return transactions.filter((transaction) => {
    const normalizedStatus = normalizePaymentStatus(transaction.payment_status)
    const matchesStatus =
      statusFilter === 'ALL' ||
      normalizedStatus === statusFilter ||
      normalizeText(transaction.payment_status ?? '') === statusFilter

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
