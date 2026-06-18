import { Download, ExternalLink, History } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { SafeExternalLink } from '@/components/shared/SafeExternalLink'
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
    downloadParams.courseUid
  const checkoutHref = invoice.checkoutUrl

  return (
    <div className="grid gap-2.5">
      {invoice.canContinuePayment && checkoutHref ? (
        <SafeExternalLink
          href={checkoutHref}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/15 transition-colors hover:bg-primary/90"
        >
          Lanjutkan pembayaran
          <ExternalLink className="size-4" aria-hidden />
        </SafeExternalLink>
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
