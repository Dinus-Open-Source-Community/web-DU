import { useCallback, useEffect, useMemo, useState } from 'react'
import { SearchForm } from '../shared/SearchForm'
import { type PaymentStatus, type TransactionHistory } from '@/lib/types/transaction'
import { Pagination } from '../shared/Pagination'
import TransactionsCard from '../shared/TransactionsCard'
import { FormatRupiah } from '@/lib/func/func'
import { PageHeader } from '../shared/Header'
import { SegmentedFilter } from '../shared/SegemntedFilter'

type StatusFilter = 'ALL' | PaymentStatus

const ITEMS_PER_PAGE = 6

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'pending', label: 'Pending' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
]

export default function TransactionsList({ Data }: { Data: TransactionHistory[] }) {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  const normalizeText = (value: string) => value.toLowerCase().trim()

  const filterTransactions = useCallback(
    (transactions: TransactionHistory[], searchQuery: string) => {
      if (!searchQuery.trim()) return transactions

      const keyword = normalizeText(searchQuery)
      return transactions.filter((transaction) => {
        return [transaction.uid, transaction.course.title, transaction.payment_status, transaction.payment_method].join(' ').toLowerCase().includes(keyword)
      })
    },
    [normalizeText],
  )

  const paginateTransactions = (transactions: TransactionHistory[], currentPage: number, rowsPerPage: number) => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return transactions.slice(startIndex, startIndex + rowsPerPage)
  }

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  // Filter by search query
  const searchFiltered = useMemo(() => filterTransactions(Data, searchQuery), [Data, searchQuery, filterTransactions])

  // Filter by status dropdown
  const filteredData = useMemo(() => {
    if (statusFilter === 'ALL') return searchFiltered
    return searchFiltered.filter((item) => item.payment_status === statusFilter)
  }, [searchFiltered, statusFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const paginatedData = useMemo(() => paginateTransactions(filteredData, currentPage, ITEMS_PER_PAGE), [filteredData, currentPage])

  return (
    <section className="w-full h-full ">
      <PageHeader title="Riwayat Transaksi" subtitle="Lihat status pembayaran dan akses detail invoice dari seluruh pembelian kelas Anda." />

      <div className="w-full space-y-6">
        {/* Toolbar: Search + Filter */}
        <div className="flex flex-col gap-4 ">
          <SearchForm value={searchInput} onChange={setSearchInput} onSubmit={() => setSearchQuery(searchInput)} placeholder="Cari ID transaksi atau nama kelas..." className="md:flex-1" />

          <SegmentedFilter value={statusFilter} onChange={(value) => setStatusFilter(value as StatusFilter)} items={STATUS_FILTER_OPTIONS} />
        </div>

        {/* Cards */}
        {paginatedData.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16">
            <p className="text-sm font-medium text-slate-400">Tidak ada transaksi yang ditemukan.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {paginatedData.map((item) => (
              <TransactionsCard
                key={item.uid}
                data={{
                  title: item.course.title,
                  transactionId: item.uid,
                  price: FormatRupiah(item.amount) as string,
                  paymentStatus: item.payment_status,
                  paymentMethod: item.payment_method,
                  purchasedAt: item.paid_at ? new Date(item.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum dibayar',
                  detailHref: `/checkout/invoice/${item.uid}`,
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </section>
  )
}
