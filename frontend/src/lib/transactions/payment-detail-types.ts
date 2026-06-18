import type { PaymentInvoiceViewModel } from '@/lib/transactions/present-payment-invoice-view'

export type CopyHandler = (key: string, value: string) => void

export type CopyablePaymentProps = {
  copiedKey: string | null
  onCopy: CopyHandler
}

export type InvoiceDownloadParams = {
  enrollmentUid: string | null
  courseUid: string | null
}

export type PaymentInvoiceProps = {
  invoice: PaymentInvoiceViewModel
}
