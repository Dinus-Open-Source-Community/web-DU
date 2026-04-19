/** Transaksi & pembayaran (selaraskan dengan respons API / invoice). */

export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED'

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

export interface ICertificate {
  uid: string
  courseUid?: string
  studentUid?: string
  title: string
  courseName: string
  issuedDate: string
  category: string
  credentialId: string
  imageUrl?: string
}
