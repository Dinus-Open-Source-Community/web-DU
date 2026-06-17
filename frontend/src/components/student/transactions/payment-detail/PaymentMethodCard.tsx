import { QrCode } from 'lucide-react'

import type { PaymentInvoiceViewModel } from '@/lib/transactions/present-payment-invoice-view'
import { CopyPaymentValueButton } from './CopyPaymentValueButton'
import type { CopyablePaymentProps } from '@/lib/transactions/payment-detail-types'

type PaymentMethodCardProps = CopyablePaymentProps & {
  invoice: PaymentInvoiceViewModel
}

export function PaymentMethodCard({
  copiedKey,
  invoice,
  onCopy,
}: PaymentMethodCardProps) {
  const paymentCode = invoice.payCode

  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="text-center">
        <p className="text-xs font-bold tracking-wider text-primary uppercase">Metode pembayaran</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
          {invoice.isQris ? 'Scan QRIS' : 'Gunakan kode pembayaran'}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {invoice.isQris
            ? 'Buka aplikasi bank atau dompet digital, lalu pindai kode berikut.'
            : 'Salin kode berikut dan selesaikan pembayaran melalui kanal yang dipilih.'}
        </p>
      </div>

      {invoice.isQris ? (
        <div className="mx-auto mt-6 flex size-56 items-center justify-center overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-4 shadow-inner sm:size-64">
          {invoice.qrUrl ? (
            <img
              src={invoice.qrUrl}
              alt="Kode QRIS pembayaran"
              className="size-full rounded-2xl bg-white object-contain"
            />
          ) : (
            <QrCode className="size-16 text-slate-300" aria-hidden />
          )}
        </div>
      ) : null}

      {paymentCode ? (
        <div className="mx-auto mt-5 flex max-w-lg items-center gap-3 rounded-2xl border border-primary/15 bg-primary/[0.035] p-3 sm:p-4">
          <p className="min-w-0 flex-1 break-all text-center font-mono text-base font-bold tracking-wider text-slate-950 sm:text-lg">
            {paymentCode}
          </p>
          <CopyPaymentValueButton
            copyKey="payment-code"
            label="kode pembayaran"
            value={paymentCode}
            copiedKey={copiedKey}
            onCopy={onCopy}
          />
        </div>
      ) : null}
    </section>
  )
}
