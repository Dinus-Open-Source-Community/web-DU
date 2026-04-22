'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Shield } from 'lucide-react'

import { EmptyState } from '@/components/admin/EmptyState'
import { SearchForm } from '@/components/ui/SearchForm'
import { Pagination } from '@/components/ui/pagination'
import { listAdministrators } from '@/lib/data/repository'
import { cn } from '@/lib/utils'

import { InviteAdminDialog } from './InviteAdminDialog'

const PAGE_SIZE = 10

export function AdministratorsTable() {
  const administrators = listAdministrators()
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = committedSearch.toLowerCase().trim()
    return administrators.filter((a) => {
      const matchQuery = q === '' || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.uid.toLowerCase().includes(q)
      return matchQuery
    })
  }, [administrators, committedSearch])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <div className="flex flex-col gap-5  p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-row justify-between items-center gap-3">
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

          <InviteAdminDialog />
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
              </article>
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  )
}
