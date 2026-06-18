import { useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import type { TransactionPaymentDetailViewModel } from '@/lib/transactions/payment-types'
import { presentPaymentInvoiceView } from '@/lib/transactions/present-payment-invoice-view'
import { ROUTES } from '@/lib/routes'
import { PaymentDetailsCard } from './payment-detail/PaymentDetailsCard'
import { PaymentInstructions } from './payment-detail/PaymentInstructions'
import { PaymentMethodCard } from './payment-detail/PaymentMethodCard'
import { PaymentProgressNavigation } from './payment-detail/PaymentProgressNavigation'
import { PaymentStatusHero } from './payment-detail/PaymentStatusHero'
import { PaymentSummaryCard } from './payment-detail/PaymentSummaryCard'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

type TransactionPaymentDetailViewProps = {
  backHref?: string
  detail: TransactionPaymentDetailViewModel
}

export function TransactionPaymentDetailView({
  backHref,
  detail,
}: TransactionPaymentDetailViewProps) {
  const invoice = presentPaymentInvoiceView(detail)
  const { copiedKey, copy } = useCopyToClipboard()
  const onCopy = useCallback((key: string, value: string) => void copy(key, value), [copy])
  const isPending = invoice.paymentStatus === 'pending'

  return (
    <main className="mx-auto w-full max-w-7xl pb-16">
      <div className="mb-5 flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="lg" className="-ml-3 min-h-11 px-3 text-slate-600">
          <Link to={backHref ?? ROUTES.student.transactions}>
            <ArrowLeft className="size-4" aria-hidden data-icon="inline-start" />
            Riwayat transaksi
          </Link>
        </Button>
        <span className="hidden text-xs font-semibold text-slate-400 sm:block">
          Pembayaran aman dan terenkripsi
        </span>
      </div>

      <div className="space-y-6">
        <PaymentStatusHero invoice={invoice} />

        <section className="rounded-[24px] border border-slate-200/80 bg-white px-4 py-5 shadow-sm sm:px-8">
          <PaymentProgressNavigation status={invoice.paymentStatus} />
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            <PaymentDetailsCard
              invoice={invoice}
              copiedKey={copiedKey}
              onCopy={onCopy}
            />

            {isPending && (invoice.payCode || invoice.qrUrl) ? (
              <PaymentMethodCard
                invoice={invoice}
                copiedKey={copiedKey}
                onCopy={onCopy}
              />
            ) : null}

            {invoice.instructions.length > 0 ? (
              <PaymentInstructions instructions={invoice.instructions} />
            ) : null}
          </div>

          <div className="lg:sticky lg:top-24">
            <PaymentSummaryCard
              invoice={invoice}
              copiedKey={copiedKey}
              onCopy={onCopy}
              downloadParams={{
                enrollmentUid: detail.payment.enrollmentUid,
                courseUid: detail.courseUid,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
