import type { EnrollmentStatus, PaymentStatus } from '../common/domain'

export type TransactionSortKey =
  | 'transactionId'
  | 'courseName'
  | 'classType'
  | 'price'
  | 'paymentStatus'

/** Satu baris riwayat transaksi untuk tampilan UI. */
export interface ITransactionHistoryItem {
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

export interface IAdminTransaction extends ITransactionHistoryItem {
  studentName: string
  studentAvatar: string
}

export interface ITransactionCourse {
  uid: string
  slug: string
  title: string
}

/** Response transaksi dari backend (snake_case). */
export interface ITransactionHistory {
  uid: string
  amount: number
  checkout_url: string
  course: ITransactionCourse
  enrollment_status: EnrollmentStatus
  enrollment_uid: string
  paid_at: string | null
  payment_method: string
  payment_status: PaymentStatus
  reference: string
  transaction_at: string
}

/** Label UI untuk status pembayaran. */
export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'Pending',
  success: 'Success',
  failed: 'Failed',
}

/** Urutan sort tabel transaksi menurut status. */
export const paymentStatusSortRank: Record<PaymentStatus, number> = {
  failed: 1,
  success: 2,
  pending: 3,
}

/** Kelas Tailwind untuk badge status pembayaran. */
export const paymentStatusStyles: Record<PaymentStatus, string> = {
  pending: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  success: 'border-amber-200 bg-amber-50 text-amber-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
}

/** Alias backward-compat. */
export type TransactionHistoryItem = ITransactionHistoryItem
export type TransactionCourse = ITransactionCourse
export type TransactionHistory = ITransactionHistory
export type AdminTransaction = IAdminTransaction
