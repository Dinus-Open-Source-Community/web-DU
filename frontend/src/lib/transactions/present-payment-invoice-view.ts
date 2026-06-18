import { format } from 'date-fns'
import { id } from 'date-fns/locale'

import { formatPaymentMethodLabel } from './format-payment-method'
import { resolveSafeExternalHref, resolveSafeImageSrc } from '@/lib/security/safe-external-url'
import type { PaymentInstruction } from './payment-types'
import type { TransactionPaymentDetailViewModel } from './payment-types'

export type PaymentInvoiceLineItem = {
  label: string
  description: string
  amount: number
}

export type PaymentInvoiceReferenceField = {
  label: string
  value: string
  mono?: boolean
}

export type PaymentTrackingStep = {
  label: string
  date: string | null
  status: 'completed' | 'active' | 'failed' | 'upcoming'
}

export type PaymentInvoiceViewModel = {
  invoiceTitle: string
  courseTitle: string
  courseImageUrl: string | null
  statusLabel: string
  paymentStatus: TransactionPaymentDetailViewModel['payment']['paymentStatus']
  lineItems: PaymentInvoiceLineItem[]
  totalAmount: number
  customerName: string | null
  paymentMethodLabel: string
  tripayStatus: string
  subtitleLabel: string
  statusMessage: string
  paidDateLabel: string | null
  expiredDateLabel: string | null
  references: PaymentInvoiceReferenceField[]
  instructions: PaymentInstruction[]
  payCode: string
  qrUrl: string
  isQris: boolean
  canContinuePayment: boolean
  checkoutUrl: string
  trackingSteps: PaymentTrackingStep[]
  itemCount: number
  reference: string
  createdDateLabel: string | null
}

function formatInvoiceDate(value: string | null): string | null {
  if (!value) return null
  return format(new Date(value), 'd MMMM yyyy, HH:mm', { locale: id })
}

const STATUS_LABELS = {
  pending: 'Menunggu pembayaran',
  success: 'Lunas',
  failed: 'Gagal',
} as const

function isQrisMethod(method: string): boolean {
  const normalized = method.toUpperCase().trim()
  return normalized === 'QRIS' || normalized === 'QRIS2' || normalized === 'QRISC' || normalized === 'QRISE'
}

function buildStatusMessage(
  status: 'pending' | 'success' | 'failed',
  paidDate: string | null,
  expiredDate: string | null,
): string {
  if (status === 'success') {
    return paidDate
      ? `Pembayaran berhasil diterima pada ${paidDate}.`
      : 'Pembayaran berhasil diterima dan diverifikasi.'
  }

  if (status === 'failed') {
    return expiredDate
      ? `Transaksi tidak dapat dilanjutkan. Pembayaran hangus pada ${expiredDate}.`
      : 'Transaksi tidak dapat dilanjutkan.'
  }

  return expiredDate
    ? `Selesaikan pembayaran sebelum ${expiredDate}.`
    : 'Menunggu pembayaran.'
}

function buildTrackingSteps(
  paymentStatus: 'pending' | 'success' | 'failed',
  paidDate: string | null,
  expiredDate: string | null,
): PaymentTrackingStep[] {
  const paidLabel = paidDate ? formatInvoiceDate(paidDate) : null
  const expiredLabel = expiredDate ? formatInvoiceDate(expiredDate) : null

  if (paymentStatus === 'success') {
    return [
      { label: 'Pesanan Dibuat', date: null, status: 'completed' },
      { label: 'Menunggu Pembayaran', date: null, status: 'completed' },
      { label: 'Pembayaran Diterima', date: paidLabel, status: 'completed' },
      { label: 'Selesai', date: paidLabel, status: 'completed' },
    ]
  }

  if (paymentStatus === 'failed') {
    return [
      { label: 'Pesanan Dibuat', date: null, status: 'completed' },
      { label: 'Menunggu Pembayaran', date: null, status: 'completed' },
      { label: 'Gagal / Kedaluwarsa', date: expiredLabel, status: 'failed' },
      { label: 'Selesai', date: null, status: 'upcoming' },
    ]
  }

  return [
    { label: 'Pesanan Dibuat', date: null, status: 'completed' },
    { label: 'Menunggu Pembayaran', date: null, status: 'active' },
    { label: 'Pembayaran Diterima', date: null, status: 'upcoming' },
    { label: 'Selesai', date: null, status: 'upcoming' },
  ]
}

export function presentPaymentInvoiceView(
  detail: TransactionPaymentDetailViewModel,
): PaymentInvoiceViewModel {
  const { payment, courseTitle, courseImageUrl } = detail
  const isPending = payment.paymentStatus === 'pending'

  const references: PaymentInvoiceReferenceField[] = [
    { label: 'Referensi Tripay', value: payment.reference, mono: true },
    { label: 'Merchant reference', value: payment.merchantRef, mono: true },
  ]

  if (payment.enrollmentUid) {
    references.push({ label: 'Enrollment UID', value: payment.enrollmentUid, mono: true })
  }

  if (payment.payCode) {
    references.push({ label: 'Kode pembayaran', value: payment.payCode, mono: true })
  }

  const subtitleLabel = (() => {
    if (payment.paymentStatus === 'success' && payment.paidAt) {
      return `Dibayar pada ${formatInvoiceDate(payment.paidAt)}`
    }
    if (isPending && payment.expiredAt) {
      return `Selesaikan sebelum ${formatInvoiceDate(payment.expiredAt)}`
    }
    if (payment.expiredAt) {
      return `Batas waktu ${formatInvoiceDate(payment.expiredAt)}`
    }
    return `Referensi ${payment.reference}`
  })()

  const lineItems: PaymentInvoiceLineItem[] =
    payment.orderItems.length > 0
      ? payment.orderItems.map((item) => ({
          label: item.name,
          description: `${item.quantity}x`,
          amount: item.price * item.quantity,
        }))
      : [{ label: 'Kursus', description: courseTitle, amount: payment.amount }]

  const qris = isQrisMethod(payment.paymentMethod)
  const itemCount = payment.orderItems.length > 0
    ? payment.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    : 1
  const safeCheckoutUrl = resolveSafeExternalHref(payment.checkoutUrl) ?? ''
  const safeQrUrl = resolveSafeImageSrc(payment.qrUrl) ?? ''
  const safeCourseImageUrl = courseImageUrl ? resolveSafeImageSrc(courseImageUrl) : null

  const statusMessage = buildStatusMessage(
    payment.paymentStatus,
    formatInvoiceDate(payment.paidAt),
    formatInvoiceDate(payment.expiredAt),
  )

  return {
    invoiceTitle: 'Invoice Pembayaran',
    courseTitle,
    courseImageUrl: safeCourseImageUrl,
    statusLabel: STATUS_LABELS[payment.paymentStatus],
    paymentStatus: payment.paymentStatus,
    lineItems,
    totalAmount: payment.amount,
    customerName: payment.customerName || null,
    paymentMethodLabel: payment.paymentName || formatPaymentMethodLabel(payment.paymentMethod),
    tripayStatus: payment.tripayStatus,
    subtitleLabel,
    statusMessage,
    paidDateLabel: formatInvoiceDate(payment.paidAt),
    expiredDateLabel: isPending ? formatInvoiceDate(payment.expiredAt) : null,
    createdDateLabel: formatInvoiceDate(payment.paidAt) ?? formatInvoiceDate(payment.expiredAt),
    references,
    instructions: payment.instructions,
    payCode: payment.payCode,
    qrUrl: safeQrUrl,
    isQris: qris,
    canContinuePayment: isPending && Boolean(safeCheckoutUrl),
    checkoutUrl: safeCheckoutUrl,
    trackingSteps: buildTrackingSteps(payment.paymentStatus, payment.paidAt, payment.expiredAt),
    itemCount,
    reference: payment.reference,
  }
}
