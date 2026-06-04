import { useCallback, useEffect, useMemo, useState } from 'react'
import { SearchForm } from '../shared/SearchForm'
import { type PaymentStatus, type TransactionHistory } from '@/lib/types/transaction'
import { Pagination } from '../shared/Pagination'
import { FormatRupiah } from '@/lib/func/func'
import { PageHeader } from '../shared/Header'
import { SegmentedFilter } from '../shared/SegemntedFilter'
import type { IUserData } from '@/lib/types/user'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Link } from 'react-router-dom'
import { PaymentBadge } from '../ui/badge'
import { ReactIcon } from '../shared/icon'
import { SafeLottie } from '../ui/lottie'

type StatusFilter = 'ALL' | PaymentStatus

const ITEMS_PER_PAGE = 6

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'pending', label: 'Pending' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
]

const normalizeText = (value: string) => value.toLowerCase().trim()

export default function TransactionsList({ Data }: { Data?: IUserData | null }) {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  const transactions = useMemo(() => Data?.transaction_history ?? [], [Data])
  const courseImagesByUid = useMemo(() => {
    const courses = [...(Data?.joined_courses ?? []), ...(Data?.enrollment_invoices ?? []).map((invoice) => invoice.course)]

    return new Map(courses.map((course) => [course.uid, course.cover_url || course.thumbnail_url]))
  }, [Data])

  const filterTransactions = useCallback((transactions: TransactionHistory[], searchQuery: string, statusFilter: StatusFilter) => {
    const keyword = normalizeText(searchQuery)

    return transactions.filter((transaction) => {
      const matchesStatus = statusFilter === 'ALL' || transaction.payment_status === statusFilter
      const matchesSearch =
        !keyword || [transaction.uid, transaction.reference, transaction.course.title, transaction.payment_status, transaction.payment_method].filter(Boolean).join(' ').toLowerCase().includes(keyword)

      return matchesSearch && matchesStatus
    })
  }, [])

  const paginateTransactions = (transactions: TransactionHistory[], currentPage: number, rowsPerPage: number) => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return transactions.slice(startIndex, startIndex + rowsPerPage)
  }

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const filteredData = useMemo(() => filterTransactions(transactions, searchQuery, statusFilter), [transactions, searchQuery, statusFilter, filterTransactions])

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

          <SegmentedFilter value={statusFilter} onChange={(value) => setStatusFilter(value as StatusFilter)} items={STATUS_FILTER_OPTIONS} variant="wrap" />
        </div>

        {paginatedData.length === 0 ? (
          <div className="flex min-h-[60vh] w-full items-center justify-center text-center">
            <div className="flex flex-col items-center gap-4">
              <SafeLottie src="/transaction-not-found.lottie" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900">Transaksi tidak ditemukan</p>
                <p className="text-sm text-slate-500">Coba ubah kata kunci pencarian atau filter status.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead>Course Image</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.uid} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {courseImagesByUid.get(item.course.uid) ? (
                          <img src={courseImagesByUid.get(item.course.uid)} alt={item.course.title} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <ReactIcon />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-2 whitespace-normal font-semibold text-slate-900">{item.course.title}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{item.uid}</TableCell>
                    <TableCell>
                      <PaymentBadge status={item.payment_status} />
                    </TableCell>
                    <TableCell className="font-medium text-slate-600">{item.payment_method}</TableCell>
                    <TableCell className="text-slate-500">
                      {item.paid_at ? new Date(item.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum dibayar'}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-950">{FormatRupiah(item.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="h-9 rounded-xl text-xs font-bold">
                        <Link to={`/checkout/invoice/${item.uid}`}>Invoice</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </section>
  )
}
