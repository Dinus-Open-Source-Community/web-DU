export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED'

export interface TransactionHistoryItem {
  uid: string
  transactionId: string
  courseUid?: string
  studentUid?: string
  courseImage: string
  courseName: string
  classType: 'Premium' | 'Bootcamp' | 'Free'
  price: number
  paymentStatus: PaymentStatus
  purchasedAt: string
  paymentMethod: 'Bank Transfer' | 'Virtual Account' | 'E-Wallet' | 'QRIS'
  qrImage?: string
}

export interface AdminTransaction extends TransactionHistoryItem {
  studentName: string
  studentAvatar: string
}

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
