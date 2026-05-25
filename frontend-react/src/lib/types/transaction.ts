import type { EnrollmentStatus } from './user'

export type PaymentStatus = 'pending' | 'success' | 'failed'

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
  pending: 'Pending',
  success: 'Success',
  failed: 'Failed',
}

/** Urutan untuk sort tabel transaksi menurut status. */
export const paymentStatusSortRank: Record<PaymentStatus, number> = {
  failed: 1,
  success: 2,
  pending: 3,
}

/** Kelas Tailwind untuk badge/chip status pembayaran. */
export const paymentStatusStyles: Record<PaymentStatus, string> = {
  pending: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  success: 'border-amber-200 bg-amber-50 text-amber-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
}

export type TransactionSortKey = 'transactionId' | 'courseName' | 'classType' | 'price' | 'paymentStatus'

export type SortDirection = 'asc' | 'desc'

/** Satu baris riwayat transaksi pembelian kursus (FE). */
export interface TransactionHistoryItem {
  uid: string
  transactionId: string
  /** FK ke course.uid */
  courseUid?: string
  /** FK ke student.uid (admin) / user id siswa */
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

// types dari backend (FE)
export interface TransactionCourse {
  uid: string
  slug: string
  title: string
}

export interface TransactionHistory {
  uid: string
  amount: number
  checkout_url: string
  course: TransactionCourse
  enrollment_status: EnrollmentStatus
  enrollment_uid: string
  paid_at: string | null
  payment_method: string
  payment_status: PaymentStatus
  reference: string
  transaction_at: string
}
