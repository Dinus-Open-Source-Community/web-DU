import type { TransactionHistory } from '@/lib/types/transaction'

type TransactionPaymentLinkProps = {
  transaction: TransactionHistory
}

export function TransactionPaymentLink({ transaction: _transaction }: TransactionPaymentLinkProps) {
  return (
    <span className="text-xs font-medium text-ink-400" title="Transaksi tidak tersedia">
      Tidak tersedia
    </span>
  )
}
