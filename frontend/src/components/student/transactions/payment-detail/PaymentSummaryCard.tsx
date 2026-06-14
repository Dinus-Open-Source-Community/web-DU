import { ReactIcon } from '@/components/shared/icon'
import { FormatRupiah } from '@/lib/func/func'
import type { PaymentInvoiceViewModel } from '@/lib/transactions/present-payment-invoice-view'
import { CopyPaymentValueButton } from './CopyPaymentValueButton'
import { PaymentActions } from './PaymentActions'
import type { CopyablePaymentProps, InvoiceDownloadParams } from './payment-detail-types'

type PaymentSummaryCardProps = CopyablePaymentProps & {
  downloadParams: InvoiceDownloadParams
  invoice: PaymentInvoiceViewModel
}

export function PaymentSummaryCard({
  copiedKey,
  downloadParams,
  invoice,
  onCopy,
}: PaymentSummaryCardProps) {
  const itemsTotal = invoice.lineItems.reduce((total, item) => total + item.amount, 0)
  const serviceFee = invoice.totalAmount - itemsTotal

  return (
    <aside className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-lg shadow-slate-900/5">
      <div className="border-b border-slate-100 p-5">
        <p className="text-xs font-bold tracking-wider text-primary uppercase">Ringkasan</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
          Pesanan Anda
        </h2>
      </div>

      <div className="flex gap-4 border-b border-slate-100 p-5">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
          {invoice.courseImageUrl ? (
            <img
              src={invoice.courseImageUrl}
              alt={invoice.courseTitle}
              className="size-full object-cover"
            />
          ) : (
            <ReactIcon className="size-8 text-slate-400" />
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm leading-6 font-bold text-slate-950">
            {invoice.courseTitle}
          </p>
          <p className="mt-1 text-xs text-slate-500">{invoice.paymentMethodLabel}</p>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {invoice.lineItems.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-4 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-slate-700">{item.label}</p>
              {item.description ? (
                <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
              ) : null}
            </div>
            <span className="shrink-0 font-semibold text-slate-900 tabular-nums">
              {FormatRupiah(item.amount)}
            </span>
          </div>
        ))}
        {serviceFee > 0 ? (
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-slate-500">Biaya layanan</span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {FormatRupiah(serviceFee)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="border-y border-primary/10 bg-primary/[0.035] p-5">
        <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
          Total pembayaran
        </p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-2xl font-extrabold tracking-tight text-primary tabular-nums">
            {FormatRupiah(invoice.totalAmount)}
          </p>
          <CopyPaymentValueButton
            copyKey="total"
            label="total pembayaran"
            value={String(invoice.totalAmount)}
            copiedKey={copiedKey}
            onCopy={onCopy}
          />
        </div>
      </div>

      <div className="p-5">
        <PaymentActions invoice={invoice} downloadParams={downloadParams} />
      </div>
    </aside>
  )
}
