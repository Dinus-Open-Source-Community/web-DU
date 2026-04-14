import { isMockDataEnabled } from '@/lib/config/mock-data'
import { transactionsHistoryData } from '@/lib/dummyData'
import type { TransactionHistoryItem } from '@/lib/types'

/** Daftar transaksi untuk halaman riwayat; kosong di produksi tanpa mock hingga API menyalurkan data. */
export function getTransactionsSource(): TransactionHistoryItem[] {
  return isMockDataEnabled() ? transactionsHistoryData : []
}
