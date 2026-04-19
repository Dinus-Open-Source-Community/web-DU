'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Plus, UsersRound, Star } from 'lucide-react'

import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable'
import { EmptyState } from '@/components/admin/EmptyState'
import { Badge, type AppBadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { SearchForm } from '@/components/ui/SearchForm'
import { getMentorSpecColors, listMentors } from '@/lib/data/repository'
import type { AdminMentor, AdminStatus, MentorSpecialization } from '@/lib/types'

type StatusFilter = 'all' | AdminStatus
type SpecFilter = 'all' | MentorSpecialization

const PAGE_SIZE = 10

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
  { value: 'pending', label: 'Pending' },
]

const specColors = getMentorSpecColors()

const specOptions: { value: SpecFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  ...(Object.keys(specColors) as MentorSpecialization[]).map((s) => ({
    value: s,
    label: s,
  })),
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

export function MentorsTable() {
  const mentors = listMentors()
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [specFilter, setSpecFilter] = useState<SpecFilter>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = committedSearch.toLowerCase().trim()
    return mentors.filter((m) => {
      const matchStatus = statusFilter === 'all' || m.status === statusFilter
      const matchSpec = specFilter === 'all' || m.specializations.includes(specFilter)
      const matchQuery =
        q === '' ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.uid.toLowerCase().includes(q)
      return matchStatus && matchSpec && matchQuery
    })
  }, [mentors, committedSearch, statusFilter, specFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: AdminDataTableColumn<AdminMentor>[] = [
    {
      id: 'name',
      header: 'Mentor',
      cell: (m) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100">
            <Image src={m.avatar} alt={m.name} fill className="object-cover" sizes="40px" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-slate-800">{m.name}</span>
            <span className="truncate text-xs text-slate-400">{m.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'spec',
      header: 'Spesialisasi',
      cell: (m) => (
        <div className="flex flex-wrap gap-1.5">
          {m.specializations.slice(0, 2).map((spec) => (
            <Badge key={spec} variant={specColors[spec] as AppBadgeVariant}>
              {spec}
            </Badge>
          ))}
          {m.specializations.length > 2 && (
            <span className="text-[11px] font-medium text-slate-400">
              +{m.specializations.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'classes',
      header: 'Kelas',
      align: 'center',
      cell: (m) => (
        <span className="font-medium tabular-nums text-slate-700">{m.totalCourses}</span>
      ),
    },
    {
      id: 'students',
      header: 'Siswa',
      align: 'center',
      cell: (m) => (
        <span className="font-medium tabular-nums text-slate-700">
          {m.studentsCount.toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      id: 'rating',
      header: 'Rating',
      cell: (m) => (
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
          <span className="font-semibold tabular-nums text-slate-700">
            {m.rating.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400">({m.totalReviews})</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (m) => <Badge variant={statusVariant[m.status]}>{statusLabel[m.status]}</Badge>,
    },
    {
      id: 'action',
      header: <span className="sr-only">Aksi</span>,
      align: 'right',
      cell: (m) => (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border-slate-200 px-3 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50">
          <Link href={`/admin/users/mentors/${m.uid}`}>Detail</Link>
        </Button>
      ),
    },
  ]

  return (
    <AdminDataTable
      data={pagedRows}
      columns={columns}
      keyField={(m) => m.uid}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      emptyState={
        <EmptyState
          icon={<UsersRound className="h-5 w-5" />}
          title="Belum ada mentor"
          description="Tidak ada mentor yang cocok dengan filter saat ini."
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
              placeholder="Cari nama, email, atau ID mentor..."
              submitLabel="Cari"
              className="flex-1 min-w-[240px]"
            />
            <FilterSelect<SpecFilter>
              id="mentor-spec"
              label="Spesialisasi"
              value={specFilter}
              onChange={(v) => {
                setSpecFilter(v)
                setPage(1)
              }}
              options={specOptions}
            />
            <FilterSelect<StatusFilter>
              id="mentor-status"
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
            Undang Mentor
          </Button>
        </>
      }
    />
  )
}
