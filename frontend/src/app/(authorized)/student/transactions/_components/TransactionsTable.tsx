'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { SearchForm } from '@/components/ui/SearchForm'
import { Pagination } from '@/components/ui/pagination'
import { PaymentStatus } from '@/lib/types'
import { transactionsHistoryData } from '@/lib/dummyData'
import { filterTransactions, formatDateTime, formatRupiah, paginateTransactions } from '@/lib/func'

type StatusFilter = 'ALL' | PaymentStatus

const ITEMS_PER_PAGE = 6

export default function TransactionsList() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  // Filter by search query
  const searchFiltered = useMemo(
    () => filterTransactions(transactionsHistoryData, searchQuery),
    [searchQuery],
  )

  // Filter by status dropdown
  const filteredData = useMemo(() => {
    if (statusFilter === 'ALL') return searchFiltered
    return searchFiltered.filter((item) => item.paymentStatus === statusFilter)
  }, [searchFiltered, statusFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const paginatedData = useMemo(
    () => paginateTransactions(filteredData, currentPage, ITEMS_PER_PAGE),
    [filteredData, currentPage],
  )

  return (
    <div className="w-full space-y-6">
      {/* Toolbar: Search + Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchForm
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => setSearchQuery(searchInput)}
          placeholder="Cari ID transaksi atau nama kelas..."
        />

        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="status-filter" className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary">
            <option value="ALL">Semua</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs font-medium text-slate-400">
        Menampilkan {paginatedData.length} dari {filteredData.length} transaksi
      </p>

      {/* Cards */}
      {paginatedData.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16">
          <p className="text-sm font-medium text-slate-400">Tidak ada transaksi yang ditemukan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {paginatedData.map((item) => (
            <Card
              key={item.uid}
              variant="transaction"
              image={item.courseImage}
              title={item.courseName}
              transactionId={item.transactionId}
              classType={item.classType}
              price={formatRupiah(item.price)}
              paymentStatus={item.paymentStatus}
              paymentMethod={item.paymentMethod}
              purchasedAt={formatDateTime(item.purchasedAt)}
              detailHref={`/student/transactions/${item.uid}`}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  )
}
