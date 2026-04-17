'use client'

import { useMemo, useState } from 'react'
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react'

import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable'
import { EmptyState } from '@/components/admin/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { SearchForm } from '@/components/ui/SearchForm'
import {
  adminCoupons,
  type AdminCoupon,
  type CouponStatus,
} from '@/lib/data/admin-fixtures'
import { formatRupiah } from '@/lib/func'

import { CouponFormDialog } from './CouponFormDialog'

type StatusFilter = 'all' | CouponStatus

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'scheduled', label: 'Terjadwal' },
  { value: 'expired', label: 'Kadaluarsa' },
]

const statusVariantMap = {
  active: 'couponActive',
  expired: 'couponExpired',
  scheduled: 'couponScheduled',
} as const

const PAGE_SIZE = 10

export function CouponsTable() {
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCoupon | null>(null)

  const filtered = useMemo(() => {
    const q = committedSearch.toLowerCase().trim()
    return adminCoupons.filter((c) => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      const matchQuery = q === '' || c.code.toLowerCase().includes(q)
      return matchStatus && matchQuery
    })
  }, [committedSearch, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: AdminDataTableColumn<AdminCoupon>[] = [
    {
      id: 'code',
      header: 'Kode',
      cell: (c) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 font-mono text-xs font-semibold text-primary">
            <Tag className="h-3 w-3" aria-hidden /> {c.code}
          </span>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Diskon',
      cell: (c) => (
        <span className="font-semibold text-slate-800">
          {c.type === 'percent' ? `${c.value}%` : formatRupiah(c.value)}
        </span>
      ),
    },
    {
      id: 'min',
      header: 'Min. Belanja',
      cell: (c) => (
        <span className="tabular-nums text-slate-600">
          {c.minPurchase === 0 ? '—' : formatRupiah(c.minPurchase)}
        </span>
      ),
    },
    {
      id: 'usage',
      header: 'Penggunaan',
      cell: (c) => (
        <div className="flex min-w-[120px] flex-col gap-1">
          <span className="text-xs text-slate-500">
            {c.used.toLocaleString('id-ID')} / {c.usageLimit.toLocaleString('id-ID')}
          </span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(100, (c.used / c.usageLimit) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'period',
      header: 'Periode',
      cell: (c) => (
        <span className="text-xs text-slate-600">
          {c.startsAt} — {c.endsAt}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (c) => <Badge variant={statusVariantMap[c.status]} />,
    },
    {
      id: 'action',
      header: <span className="sr-only">Aksi</span>,
      align: 'right',
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setEditing(c)
              setFormOpen(true)
            }}
            aria-label="Edit coupon">
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
            aria-label="Delete coupon">
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <AdminDataTable
        data={pagedRows}
        columns={columns}
        keyField={(c) => c.uid}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={<Tag className="h-5 w-5" />}
            title="Belum ada kupon"
            description="Buat kupon pertama untuk mempromosikan kursus."
            action={
              <Button
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
                size="sm"
                className="h-9 rounded-lg">
                <Plus className="mr-1 h-4 w-4" aria-hidden />
                Buat kupon
              </Button>
            }
          />
        }
        toolbar={
          <>
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
                placeholder="Cari kode kupon..."
                submitLabel="Cari"
                className="flex-1 min-w-[240px]"
              />
              <FilterSelect<StatusFilter>
                id="coupon-status"
                label="Status"
                value={statusFilter}
                onChange={(v) => {
                  setStatusFilter(v)
                  setPage(1)
                }}
                options={statusOptions}
              />
            </div>
            <Button
              className="h-10 shrink-0 rounded-xl px-4"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              Buat Kupon
            </Button>
          </>
        }
      />

      <CouponFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={editing ? 'edit' : 'create'}
        initialValue={
          editing
            ? {
                code: editing.code,
                type: editing.type,
                value: editing.value,
                minPurchase: editing.minPurchase,
                usageLimit: editing.usageLimit,
              }
            : undefined
        }
      />
    </>
  )
}
