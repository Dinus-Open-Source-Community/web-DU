'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Check, Wallet, X, Clock, CreditCard } from 'lucide-react'

import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable'
import { EmptyState } from '@/components/admin/EmptyState'
import { StatCard } from '@/components/dashboard/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { SearchForm } from '@/components/ui/SearchForm'
import {
  adminPayouts,
  type AdminPayout,
  type PayoutStatus,
} from '@/lib/data/admin-fixtures'
import { formatRupiah } from '@/lib/func'

type StatusFilter = 'all' | PayoutStatus

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'requested', label: 'Diminta' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'paid', label: 'Terbayar' },
  { value: 'rejected', label: 'Ditolak' },
]

const statusVariantMap = {
  requested: 'payoutRequested',
  approved: 'payoutApproved',
  paid: 'payoutPaid',
  rejected: 'payoutRejected',
} as const

const PAGE_SIZE = 10

export function PayoutsTable() {
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = committedSearch.toLowerCase().trim()
    return adminPayouts.filter((p) => {
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const matchQuery =
        q === '' ||
        p.mentorName.toLowerCase().includes(q) ||
        p.bankName.toLowerCase().includes(q) ||
        p.accountHolder.toLowerCase().includes(q)
      return matchStatus && matchQuery
    })
  }, [committedSearch, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalRequested = adminPayouts.filter((p) => p.status === 'requested').length
  const totalPaid = adminPayouts
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + p.amount, 0)
  const totalPending = adminPayouts
    .filter((p) => p.status === 'requested' || p.status === 'approved')
    .reduce((acc, p) => acc + p.amount, 0)

  const columns: AdminDataTableColumn<AdminPayout>[] = [
    {
      id: 'mentor',
      header: 'Mentor',
      cell: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-100">
            <Image src={p.mentorAvatar} alt={p.mentorName} fill className="object-cover" sizes="32px" />
          </div>
          <span className="font-medium text-slate-800">{p.mentorName}</span>
        </div>
      ),
    },
    {
      id: 'bank',
      header: 'Rekening',
      cell: (p) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{p.bankName}</span>
          <span className="text-xs text-slate-400">
            {p.accountNumber} • {p.accountHolder}
          </span>
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'Jumlah',
      align: 'right',
      cell: (p) => (
        <span className="font-semibold tabular-nums text-slate-900">
          {formatRupiah(p.amount)}
        </span>
      ),
    },
    {
      id: 'requested',
      header: 'Diminta',
      cell: (p) => <span className="text-slate-600">{p.requestedAt}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (p) => <Badge variant={statusVariantMap[p.status]} />,
    },
    {
      id: 'action',
      header: <span className="sr-only">Aksi</span>,
      align: 'right',
      cell: (p) => {
        if (p.status === 'requested') {
          return (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 rounded-lg border-rose-200 px-3 text-xs font-semibold text-rose-700 shadow-none hover:bg-rose-50">
                <X className="h-3.5 w-3.5" aria-hidden />
                Tolak
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-none hover:bg-emerald-700">
                <Check className="h-3.5 w-3.5" aria-hidden />
                Setujui
              </Button>
            </div>
          )
        }
        if (p.status === 'approved') {
          return (
            <div className="flex justify-end">
              <Button
                size="sm"
                className="h-8 gap-1 rounded-lg px-3 text-xs font-semibold shadow-none">
                <Wallet className="h-3.5 w-3.5" aria-hidden />
                Tandai terbayar
              </Button>
            </div>
          )
        }
        return null
      },
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          variant="kpi"
          label="Permintaan Baru"
          value={totalRequested.toLocaleString('id-ID')}
          trendValue={2}
          trendDirection="up"
          trendLabel="vs minggu lalu"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          variant="kpi"
          label="Total Dibayarkan"
          value={formatRupiah(totalPaid)}
          trendValue={12.4}
          trendDirection="up"
          trendLabel="30 hari terakhir"
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          variant="kpi"
          label="Menunggu Pembayaran"
          value={formatRupiah(totalPending)}
          trendValue={-3.5}
          trendDirection="down"
          trendLabel="vs minggu lalu"
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      <AdminDataTable
        data={pagedRows}
        columns={columns}
        keyField={(p) => p.uid}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={<Wallet className="h-5 w-5" />}
            title="Belum ada permintaan pencairan"
            description="Tidak ada permintaan payout yang cocok dengan filter saat ini."
          />
        }
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
              placeholder="Cari mentor, bank, atau nama pemilik rekening..."
              submitLabel="Cari"
              className="flex-1 min-w-[240px]"
            />
            <FilterSelect<StatusFilter>
              id="payout-status"
              label="Status"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v)
                setPage(1)
              }}
              options={statusOptions}
            />
          </div>
        }
      />
    </section>
  )
}
