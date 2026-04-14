import { PaymentStatus, SortDirection, TransactionHistoryItem, TransactionSortKey } from './types'
import { paymentStatusSortRank } from './constants/payment-status'
import { getTransactionsSource } from './data/transactions-source'

const normalizeText = (value: string) => value.toLowerCase().trim()

export const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatDateTime = (isoDate: string) => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const formatCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export const filterTransactions = (transactions: TransactionHistoryItem[], searchQuery: string) => {
  if (!searchQuery.trim()) return transactions

  const keyword = normalizeText(searchQuery)
  return transactions.filter((transaction) => {
    return [transaction.uid, transaction.transactionId, transaction.courseName, transaction.classType, transaction.paymentStatus, transaction.paymentMethod].join(' ').toLowerCase().includes(keyword)
  })
}

export const sortTransactions = (transactions: TransactionHistoryItem[], sortKey: TransactionSortKey, sortDirection: SortDirection) => {
  return [...transactions].sort((a, b) => {
    let comparison = 0

    if (sortKey === 'transactionId') {
      const aId = Number(a.transactionId.replace(/\D/g, ''))
      const bId = Number(b.transactionId.replace(/\D/g, ''))
      comparison = aId - bId
    } else if (sortKey === 'courseName') {
      comparison = a.courseName.localeCompare(b.courseName)
    } else if (sortKey === 'classType') {
      comparison = a.classType.localeCompare(b.classType)
    } else if (sortKey === 'price') {
      comparison = a.price - b.price
    } else {
      comparison = paymentStatusSortRank[a.paymentStatus] - paymentStatusSortRank[b.paymentStatus]
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })
}

export const paginateTransactions = (transactions: TransactionHistoryItem[], currentPage: number, rowsPerPage: number) => {
  const startIndex = (currentPage - 1) * rowsPerPage
  return transactions.slice(startIndex, startIndex + rowsPerPage)
}

// ──── Payment Progress Utilities ─────────────────────────────────────────────

export interface PaymentStepConfig {
  label: string
  subtitle: string
}

export const getPaymentStepsConfig = (status: PaymentStatus, formattedDate: string): PaymentStepConfig[] => {
  if (status === 'PAID') {
    return [
      { label: 'Invoice Dibuat', subtitle: formattedDate },
      { label: 'Pembayaran Diterima', subtitle: 'Terverifikasi' },
      { label: 'Akses Dibuka', subtitle: 'Kelas aktif' },
    ]
  }
  if (status === 'FAILED') {
    return [
      { label: 'Invoice Dibuat', subtitle: formattedDate },
      { label: 'Gagal', subtitle: 'Pembayaran ditolak' },
      { label: 'Akses Ditutup', subtitle: 'Hubungi support' },
    ]
  }
  // PENDING
  return [
    { label: 'Invoice Dibuat', subtitle: formattedDate },
    { label: 'Pending', subtitle: 'Menunggu konfirmasi' },
    { label: 'Akses Dibuka', subtitle: 'Estimasi 5-10 menit' },
  ]
}

export const getPaymentActiveStep = (status: PaymentStatus): number => {
  if (status === 'PAID') return 3
  if (status === 'FAILED') return 3
  return 2 // PENDING stays at step 2
}

export const formatPaymentDate = (purchasedAt: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(purchasedAt))
}

export const getTransactionByUid = (uid: string) => {
  return getTransactionsSource().find((transaction) => transaction.uid === uid)
}

/* ─── Payment Instructions ─── */
export type PaymentMethodKey = TransactionHistoryItem['paymentMethod']

export interface PaymentInstructionSet {
  iconKey: 'qr-code' | 'wallet' | 'landmark' | 'credit-card'
  title: string
  steps: string[]
}

export const getPaymentInstructions = (method: PaymentMethodKey): PaymentInstructionSet => {
  switch (method) {
    case 'QRIS':
      return {
        iconKey: 'qr-code',
        title: 'Cara Pembayaran via QRIS',
        steps: [
          'Unduh atau screenshot kode QR yang tertera pada halaman invoice.',
          'Buka aplikasi E-Wallet atau Mobile Banking yang mendukung QRIS (GoPay, OVO, DANA, ShopeePay, dll).',
          'Pilih menu "Scan" atau "Bayar", lalu tap ikon galeri/upload gambar.',
          'Pilih gambar QR Code yang telah kamu simpan di galeri.',
          'Periksa kembali nominal pembayaran yang muncul, pastikan sesuai.',
          'Konfirmasi dan selesaikan pembayaran.',
        ],
      }
    case 'E-Wallet':
      return {
        iconKey: 'wallet',
        title: 'Cara Pembayaran via E-Wallet',
        steps: [
          'Buka aplikasi E-Wallet yang kamu gunakan (GoPay, OVO, DANA, ShopeePay, dll).',
          'Pilih menu "Bayar" atau "Transfer" pada halaman utama.',
          'Masukkan nomor virtual account atau kode pembayaran yang tertera pada invoice.',
          'Periksa kembali detail transaksi dan nominal yang muncul.',
          'Masukkan PIN keamanan untuk konfirmasi.',
          'Pembayaran berhasil, simpan bukti transaksi sebagai referensi.',
        ],
      }
    case 'Bank Transfer':
      return {
        iconKey: 'landmark',
        title: 'Cara Pembayaran via Bank Transfer',
        steps: [
          'Login ke aplikasi Mobile Banking atau Internet Banking bank kamu.',
          'Pilih menu "Transfer" lalu pilih "Transfer ke Bank Lain" jika berbeda bank.',
          'Masukkan nomor rekening tujuan yang tertera pada halaman invoice.',
          'Masukkan nominal pembayaran sesuai total tagihan (pastikan hingga digit terakhir).',
          'Periksa kembali semua detail, lalu konfirmasi transfer.',
          'Simpan bukti transfer sebagai referensi. Verifikasi otomatis membutuhkan waktu 1-5 menit.',
        ],
      }
    case 'Virtual Account':
      return {
        iconKey: 'credit-card',
        title: 'Cara Pembayaran via Virtual Account',
        steps: [
          'Login ke aplikasi Mobile Banking, Internet Banking, atau kunjungi ATM bank terkait.',
          'Pilih menu "Bayar" atau "Transfer ke Virtual Account".',
          'Masukkan nomor Virtual Account yang tertera pada halaman invoice.',
          'Nominal pembayaran akan muncul secara otomatis. Pastikan sudah sesuai.',
          'Konfirmasi pembayaran dan masukkan PIN atau password.',
          'Pembayaran berhasil diproses. Verifikasi biasanya instant atau membutuhkan waktu maksimal 5 menit.',
        ],
      }
  }
}
