import type { TransactionHistory } from '@/lib/types/transaction'

export function findTransactionByReference(
  transactions: TransactionHistory[],
  reference: string,
): TransactionHistory | null {
  const normalizedReference = reference.trim()
  if (!normalizedReference) return null

  return (
    transactions.find(
      (transaction) =>
        transaction.reference === normalizedReference || transaction.uid === normalizedReference,
    ) ?? null
  )
}
