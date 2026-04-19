'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Users2, Plus } from 'lucide-react'

import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable'
import { EmptyState } from '@/components/admin/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { SearchForm } from '@/components/ui/SearchForm'
import { listStudents } from '@/lib/data/repository'
import type { AdminStatus, AdminStudent } from '@/lib/types'

type StatusFilter = 'all' | AdminStatus

const PAGE_SIZE = 10

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
  { value: 'pending', label: 'Pending' },
]

const statusVariant: Record<AdminStatus, 'userActive' | 'userInactive' | 'userPending'> = {
  active: 'userActive',
  inactive: 'userInactive',
  pending: 'userPending',
}

const statusLabel: Record<AdminStatus, string> = {
  active: 'Aktif',
  inactive: 'Nonaktif',
  pending: 'Pending',
}

function ProgressCell({ value }: { value: number }) {
  return (
    <div className="flex w-32 flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600 tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function StudentsTable() {
  const students = listStudents()
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = committedSearch.toLowerCase().trim()
    return students.filter((s) => {
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      const matchQuery =
        q === '' ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.uid.toLowerCase().includes(q)
      return matchStatus && matchQuery
    })
  }, [students, committedSearch, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: AdminDataTableColumn<AdminStudent>[] = [
    {
      id: 'name',
      header: 'Nama',
      cell: (s) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100">
            <Image src={s.avatar} alt={s.name} fill className="object-cover" sizes="40px" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-slate-800">{s.name}</span>
            <span className="truncate text-xs text-slate-400">{s.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'enrolled',
      header: 'Kursus',
      cell: (s) => <span className="font-medium tabular-nums text-slate-700">{s.enrolledCourses}</span>,
      align: 'center',
    },
    {
      id: 'progress',
      header: 'Rata-rata Progres',
      cell: (s) => <ProgressCell value={s.averageProgress} />,
    },
    {
      id: 'joined',
      header: 'Bergabung',
      cell: (s) => <span className="text-slate-600">{s.joinedAt}</span>,
    },
    {
      id: 'active',
      header: 'Terakhir Aktif',
      cell: (s) => <span className="text-slate-500">{s.lastActive}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (s) => <Badge variant={statusVariant[s.status]}>{statusLabel[s.status]}</Badge>,
    },
    {
      id: 'action',
      header: <span className="sr-only">Aksi</span>,
      align: 'right',
      cell: (s) => (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border-slate-200 px-3 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50">
          <Link href={`/admin/users/students/${s.uid}`}>Detail</Link>
        </Button>
      ),
    },
  ]

  return (
    <AdminDataTable
      data={pagedRows}
      columns={columns}
      keyField={(s) => s.uid}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      emptyState={
        <EmptyState
          icon={<Users2 className="h-5 w-5" />}
          title="Belum ada siswa"
          description="Tidak ada siswa yang cocok dengan filter saat ini."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setCommittedSearch('')
                setStatusFilter('all')
              }}>
              Reset filter
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
              placeholder="Cari nama, email, atau ID siswa..."
              submitLabel="Cari"
              className="flex-1 min-w-[240px]"
            />
            <FilterSelect<StatusFilter>
              id="student-status"
              label="Status"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v)
                setPage(1)
              }}
              options={statusOptions}
            />
          </div>
          <Button className="h-10 shrink-0 rounded-xl px-4">
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            Tambah Siswa
          </Button>
        </>
      }
    />
  )
}
