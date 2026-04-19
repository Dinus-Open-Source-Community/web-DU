'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { KeyRound, Shield } from 'lucide-react'

import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable'
import { ResetCredentialsDialog } from '@/components/admin/ResetCredentialsDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { SearchForm } from '@/components/ui/SearchForm'
import { listAdministrators } from '@/lib/data/repository'
import type { AdminAdministrator, AdminStatus } from '@/lib/types'

import { InviteAdminDialog } from './InviteAdminDialog'

type RoleFilter = 'all' | AdminAdministrator['role']
type StatusFilter = 'all' | AdminStatus

const PAGE_SIZE = 10

const roleOptions: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'Super Admin', label: 'Super Admin' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Content Moderator', label: 'Moderator' },
  { value: 'Support', label: 'Support' },
]

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

export function AdministratorsTable() {
  const administrators = listAdministrators()
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [resetTarget, setResetTarget] = useState<AdminAdministrator | null>(null)

  const filtered = useMemo(() => {
    const q = committedSearch.toLowerCase().trim()
    return administrators.filter((a) => {
      const matchRole = roleFilter === 'all' || a.role === roleFilter
      const matchStatus = statusFilter === 'all' || a.status === statusFilter
      const matchQuery =
        q === '' ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.uid.toLowerCase().includes(q)
      return matchRole && matchStatus && matchQuery
    })
  }, [administrators, committedSearch, roleFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: AdminDataTableColumn<AdminAdministrator>[] = [
    {
      id: 'name',
      header: 'Administrator',
      cell: (a) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100">
            <Image src={a.avatar} alt={a.name} fill className="object-cover" sizes="40px" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-slate-800">{a.name}</span>
            <span className="truncate text-xs text-slate-400">{a.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      cell: (a) => <Badge variant="userRole">{a.role}</Badge>,
    },
    {
      id: 'lastActive',
      header: 'Terakhir Aktif',
      cell: (a) => <span className="text-slate-500">{a.lastActive}</span>,
    },
    {
      id: 'created',
      header: 'Dibuat',
      cell: (a) => <span className="text-slate-500">{a.createdAt}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (a) => <Badge variant={statusVariant[a.status]}>{statusLabel[a.status]}</Badge>,
    },
    {
      id: 'action',
      header: <span className="sr-only">Aksi</span>,
      align: 'right',
      cell: (a) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-slate-200 px-3 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50"
          onClick={() => setResetTarget(a)}>
          <KeyRound className="h-3.5 w-3.5" aria-hidden />
          Reset
        </Button>
      ),
    },
  ]

  return (
    <>
      <AdminDataTable
        data={pagedRows}
        columns={columns}
        keyField={(a) => a.uid}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-8">
            <Shield className="h-8 w-8 text-slate-300" aria-hidden />
            <p className="text-sm font-medium text-slate-500">Belum ada administrator</p>
            <p className="text-xs text-slate-400">Undang administrator baru untuk mulai.</p>
          </div>
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
                placeholder="Cari nama atau email admin..."
                submitLabel="Cari"
                className="flex-1 min-w-[240px]"
              />
              <FilterSelect<RoleFilter>
                id="admin-role"
                label="Role"
                value={roleFilter}
                onChange={(v) => {
                  setRoleFilter(v)
                  setPage(1)
                }}
                options={roleOptions}
              />
              <FilterSelect<StatusFilter>
                id="admin-status"
                label="Status"
                value={statusFilter}
                onChange={(v) => {
                  setStatusFilter(v)
                  setPage(1)
                }}
                options={statusOptions}
              />
            </div>
            <InviteAdminDialog />
          </>
        }
      />

      <ResetCredentialsDialog
        open={resetTarget !== null}
        onOpenChange={(open) => {
          if (!open) setResetTarget(null)
        }}
        userName={resetTarget?.name}
        initialEmail={resetTarget?.email}
      />
    </>
  )
}
