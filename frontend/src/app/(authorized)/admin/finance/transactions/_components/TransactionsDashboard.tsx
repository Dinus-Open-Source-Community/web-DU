'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import {
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable'
import { ChartCard } from '@/components/charts/ChartCard'
import { TimelineAreaChart } from '@/components/charts/TimelineAreaChart'
import { TransactionRatioChart } from '@/components/charts/TransactionRatioChart'
import { StatCard } from '@/components/dashboard/StatCard'
import { PaymentBadge } from '@/components/ui/badge'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { SearchForm } from '@/components/ui/SearchForm'
import { getTransactionRatio, getTransactionTimeline30d, listAdminTransactions } from '@/lib/data/repository'
import type { AdminTransaction } from '@/lib/types'
import { formatDateTime, formatRupiah } from '@/lib/func'
import type { PaymentStatus } from '@/lib/types'

type StatusFilter = 'all' | PaymentStatus
type MethodFilter = 'all' | AdminTransaction['paymentMethod']

const PAGE_SIZE = 10

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
]

const methodOptions: { value: MethodFilter; label: string }[] = [
  { value: 'all', label: 'Semua Metode' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Virtual Account', label: 'Virtual Account' },
  { value: 'E-Wallet', label: 'E-Wallet' },
  { value: 'QRIS', label: 'QRIS' },
]

export function TransactionsDashboard() {
  const allTransactions = listAdminTransactions()
  const timeline30d = getTransactionTimeline30d()
  const ratioData = getTransactionRatio()
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = committedSearch.toLowerCase().trim()
    return allTransactions.filter((t) => {
      const matchStatus = statusFilter === 'all' || t.paymentStatus === statusFilter
      const matchMethod = methodFilter === 'all' || t.paymentMethod === methodFilter
      const matchQuery =
        q === '' ||
        t.transactionId.toLowerCase().includes(q) ||
        t.courseName.toLowerCase().includes(q) ||
        t.studentName.toLowerCase().includes(q)
      return matchStatus && matchMethod && matchQuery
    })
  }, [committedSearch, statusFilter, methodFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalGross = allTransactions
    .filter((t) => t.paymentStatus === 'PAID')
    .reduce((acc, t) => acc + t.price, 0)
  const totalFailed = allTransactions.filter((t) => t.paymentStatus === 'FAILED').length
  const totalPending = allTransactions.filter((t) => t.paymentStatus === 'PENDING').length
  const totalPaid = allTransactions.filter((t) => t.paymentStatus === 'PAID').length

  const columns: AdminDataTableColumn<AdminTransaction>[] = [
    {
      id: 'id',
      header: 'Transaksi',
      cell: (t) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{t.transactionId}</span>
          <span className="text-xs text-slate-400">{formatDateTime(t.purchasedAt)}</span>
        </div>
      ),
    },
    {
      id: 'student',
      header: 'Siswa',
      cell: (t) => (
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-100">
            <Image src={t.studentAvatar} alt={t.studentName} fill className="object-cover" sizes="32px" />
          </div>
          <span className="truncate text-slate-700">{t.studentName}</span>
        </div>
      ),
    },
    {
      id: 'course',
      header: 'Kursus',
      cell: (t) => <span className="line-clamp-1 max-w-[240px] text-slate-700">{t.courseName}</span>,
    },
    {
      id: 'method',
      header: 'Metode',
      cell: (t) => <span className="text-slate-600">{t.paymentMethod}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (t) => <PaymentBadge status={t.paymentStatus} />,
    },
    {
      id: 'price',
      header: 'Total',
      align: 'right',
      cell: (t) => (
        <span className="font-semibold tabular-nums text-slate-900">
          {t.price === 0 ? 'Gratis' : formatRupiah(t.price)}
        </span>
      ),
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          variant="kpi"
          label="Gross Revenue"
          value={formatRupiah(totalGross)}
          trendValue={11.3}
          trendDirection="up"
          trendLabel="30 hari terakhir"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          variant="kpi"
          label="Paid"
          value={totalPaid.toLocaleString('id-ID')}
          trendValue={8.2}
          trendDirection="up"
          trendLabel="vs minggu lalu"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          variant="kpi"
          label="Pending"
          value={totalPending.toLocaleString('id-ID')}
          trendValue={-4.1}
          trendDirection="down"
          trendLabel="vs minggu lalu"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          variant="kpi"
          label="Failed"
          value={totalFailed.toLocaleString('id-ID')}
          trendValue={1.2}
          trendDirection="up"
          trendLabel="vs minggu lalu"
          icon={<TrendingDown className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Timeline Transaksi"
          subtitle="Distribusi paid / pending / failed 30 hari."
          className="xl:col-span-2">
          <TimelineAreaChart
            data={timeline30d}
            height={280}
            series={[
              { dataKey: 'paid', label: 'Paid', color: 'var(--chart-1)' },
              { dataKey: 'pending', label: 'Pending', color: 'var(--chart-3)' },
              { dataKey: 'failed', label: 'Failed', color: 'var(--chart-2)' },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="Rasio Status"
          subtitle="Proporsi status transaksi bulan ini.">
          <TransactionRatioChart data={ratioData} height={280} />
        </ChartCard>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <CreditCard className="h-4 w-4 text-slate-400" aria-hidden />
          Daftar Transaksi
        </div>
        <p className="text-xs text-slate-500">
          Semua transaksi platform. Filter untuk menemukan transaksi spesifik.
        </p>
      </div>

      <AdminDataTable
        data={pagedRows}
        columns={columns}
        keyField={(t) => t.uid}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        toolbar={
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <SearchForm
              value={search}
              onChange={(v) => {
                setSearch(v)
                if (v === '') {
                  setCommittedSearch('')
                  setPage(1)
                }
              }}
              onSubmit={() => {
                setCommittedSearch(search)
                setPage(1)
              }}
              placeholder="Cari transaksi, siswa, atau kursus..."
              submitLabel="Cari"
              className="flex-1 min-w-[240px]"
            />
            <FilterSelect<StatusFilter>
              id="tx-status"
              label="Status"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v)
                setPage(1)
              }}
              options={statusOptions}
            />
            <FilterSelect<MethodFilter>
              id="tx-method"
              label="Metode"
              value={methodFilter}
              onChange={(v) => {
                setMethodFilter(v)
                setPage(1)
              }}
              options={methodOptions}
            />
          </div>
        }
      />
    </section>
  )
}
