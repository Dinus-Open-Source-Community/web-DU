import { PaymentBadge } from '@/components/ui/badge'
import type { PaymentInvoiceViewModel } from '@/lib/transactions/present-payment-invoice-view'
import { CopyPaymentValueButton } from './CopyPaymentValueButton'
import { PaymentDetailField } from './PaymentDetailField'
import type { CopyablePaymentProps } from './payment-detail-types'

type PaymentDetailsCardProps = CopyablePaymentProps & {
  invoice: PaymentInvoiceViewModel
}

export function PaymentDetailsCard({
  copiedKey,
  invoice,
  onCopy,
}: PaymentDetailsCardProps) {
  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-bold tracking-wider text-primary uppercase">Transaksi</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
          Detail pembayaran
        </h2>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {invoice.customerName ? (
          <PaymentDetailField label="Pelanggan" value={invoice.customerName} />
        ) : null}
        <PaymentDetailField label="Metode" value={invoice.paymentMethodLabel} />
        <PaymentDetailField label="Status">
          <PaymentBadge status={invoice.paymentStatus} />
        </PaymentDetailField>
        {invoice.createdDateLabel ? (
          <PaymentDetailField label="Tanggal dibuat" value={invoice.createdDateLabel} />
        ) : null}
        {invoice.paidDateLabel ? (
          <PaymentDetailField label="Tanggal dibayar" value={invoice.paidDateLabel} />
        ) : null}
        {invoice.expiredDateLabel ? (
          <PaymentDetailField label="Batas waktu" value={invoice.expiredDateLabel} />
        ) : null}
      </dl>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Nomor referensi
          </p>
          <p className="mt-1 truncate font-mono text-sm font-bold text-slate-900">
            {invoice.reference}
          </p>
        </div>
        <CopyPaymentValueButton
          copyKey="reference"
          label="nomor referensi"
          value={invoice.reference}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      </div>
    </section>
  )
}
