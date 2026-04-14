import type { PaymentStatus } from '@/lib/types'

/** Label UI untuk status pembayaran (selaras dengan enum backend `PaymentStatus`). */
export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  FAILED: 'Failed',
}

/** Urutan untuk sort tabel transaksi menurut status. */
export const paymentStatusSortRank: Record<PaymentStatus, number> = {
  FAILED: 1,
  PENDING: 2,
  PAID: 3,
}

/** Kelas Tailwind untuk badge/chip status pembayaran. */
export const paymentStatusStyles: Record<PaymentStatus, string> = {
  PAID: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  FAILED: 'border-rose-200 bg-rose-50 text-rose-700',
}

