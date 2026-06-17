import { Download, ExternalLink, History } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import type { PaymentInvoiceViewModel } from '@/lib/transactions/present-payment-invoice-view'
import { ROUTES } from '@/lib/routes'
import type { InvoiceDownloadParams } from '@/lib/transactions/payment-detail-types'
import { useInvoiceDownload } from '@/hooks/transactions/use-invoice-download'

type PaymentActionsProps = {
  downloadParams: InvoiceDownloadParams
  invoice: PaymentInvoiceViewModel
}

export function PaymentActions({
  downloadParams,
  invoice,
}: PaymentActionsProps) {
  const { downloadInvoice, isDownloading } = useInvoiceDownload()
  const canDownload =
    invoice.paymentStatus === 'success' &&
    downloadParams.enrollmentUid &&
    downloadParams.userUid &&
    downloadParams.courseUid

  return (
    <div className="grid gap-2.5">
      {invoice.canContinuePayment ? (
        <Button asChild size="lg" className="min-h-12 w-full text-sm font-bold shadow-lg shadow-primary/15">
          <a href={invoice.checkoutUrl} target="_blank" rel="noopener noreferrer">
            Lanjutkan pembayaran
            <ExternalLink className="size-4" aria-hidden data-icon="inline-end" />
          </a>
        </Button>
      ) : null}

      {canDownload ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="min-h-12 w-full font-bold"
          disabled={isDownloading}
          onClick={() =>
            downloadInvoice(
              downloadParams.enrollmentUid!,
              downloadParams.userUid!,
              downloadParams.courseUid!,
            )
          }
        >
          {isDownloading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
          ) : (
            <Download className="size-4" aria-hidden data-icon="inline-start" />
          )}
          Unduh invoice
        </Button>
      ) : null}

      <Button asChild variant="ghost" size="lg" className="min-h-11 w-full text-slate-600">
        <Link to={ROUTES.student.transactions}>
          <History className="size-4" aria-hidden data-icon="inline-start" />
          Riwayat transaksi
        </Link>
      </Button>
    </div>
  )
}
