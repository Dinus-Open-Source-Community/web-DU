import { ArrowUpRight, Receipt } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import { toTripayMerchantRef } from '@/lib/transactions/to-tripay-merchant-ref'
import type { TransactionHistory } from '@/lib/types/transaction'

type TransactionPaymentLinkProps = {
  transaction: TransactionHistory
}

export function TransactionPaymentLink({ transaction }: TransactionPaymentLinkProps) {
  const reference = transaction.reference?.trim()
  const enrollmentUid = transaction.enrollment_uid?.trim()

  if (!reference || !enrollmentUid) {
    return (
      <span className="text-xs font-medium text-slate-400" title="Data pembayaran tidak tersedia">
        Tidak tersedia
      </span>
    )
  }

  const merchantRef = toTripayMerchantRef(enrollmentUid)

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="h-9 gap-1.5 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50"
    >
      <Link
        to={ROUTES.student.transactionPayment({
          reference,
          merchantRef,
        })}
        aria-label={`Lihat detail pembayaran ${reference}`}
      >
        <Receipt className="size-3.5" aria-hidden />
        Detail
        <ArrowUpRight className="size-3.5 text-slate-400" aria-hidden />
      </Link>
    </Button>
  )
}
