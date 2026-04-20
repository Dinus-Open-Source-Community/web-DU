'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Shield, KeyRound } from 'lucide-react'

import { EmptyState } from '@/components/admin/EmptyState'
import { ResetCredentialsDialog } from '@/components/admin/ResetCredentialsDialog'
import { Button } from '@/components/ui/button'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { SearchForm } from '@/components/ui/SearchForm'
import { Pagination } from '@/components/ui/pagination'
import { listAdministrators } from '@/lib/data/repository'
import type { AdminAdministrator, AdminStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

import { InviteAdminDialog } from './InviteAdminDialog'

type RoleFilter = 'all' | AdminAdministrator['role']
type StatusFilter = 'all' | AdminStatus

const PAGE_SIZE = 10

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
      const matchQuery = q === '' || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.uid.toLowerCase().includes(q)
      return matchRole && matchStatus && matchQuery
    })
  }, [administrators, committedSearch, roleFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const roleOptions = [
    { value: 'all', label: 'Semua role' },
    { value: 'Super Admin', label: 'Super Admin' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Content Moderator', label: 'Content Moderator' },
    { value: 'Support', label: 'Support' },
  ] as const

  const statusOptions = [
    { value: 'all', label: 'Semua status' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Nonaktif' },
    { value: 'pending', label: 'Menunggu' },
  ] as const

  return (
    <>
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3">
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
            className="w-full max-w-3xl"
          />

          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              id="admin-role-filter"
              label="Role"
              value={roleFilter}
              onChange={(value) => {
                setRoleFilter(value)
                setPage(1)
              }}
              options={roleOptions.map((option) => ({ value: option.value, label: option.label }))}
            />
            <FilterSelect
              id="admin-status-filter"
              label="Status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}
              options={statusOptions.map((option) => ({ value: option.value, label: option.label }))}
            />
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setCommittedSearch('')
                setRoleFilter('all')
                setStatusFilter('all')
                setPage(1)
              }}
              className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900">
              Reset filter
            </button>
            <div className="ml-auto">
              <InviteAdminDialog />
            </div>
          </div>
        </div>

        {pagedRows.length === 0 ? (
          <EmptyState icon={<Shield className="h-5 w-5" />} title="Belum ada administrator" description="Undang administrator baru untuk mulai mengelola sistem." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pagedRows.map((admin) => (
              <article key={admin.uid} className={cn('flex h-full flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs')}>
                <div className="flex items-start gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-100">
                    <Image src={admin.avatar} alt={admin.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-900">{admin.name}</h3>
                    <p className="truncate text-xs text-slate-500">{admin.email}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50/70 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Bergabung</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{admin.createdAt}</p>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl border-slate-200 px-4 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50"
                    onClick={() => setResetTarget(admin)}>
                    <KeyRound className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Reset kredensial
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

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
