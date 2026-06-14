import type { TransactionHistory } from '@/lib/types/transaction'

export function findTransactionByEnrollmentUid(
  transactions: TransactionHistory[],
  enrollmentUid: string,
): TransactionHistory | null {
  return transactions.find((transaction) => transaction.enrollment_uid === enrollmentUid) ?? null
}
