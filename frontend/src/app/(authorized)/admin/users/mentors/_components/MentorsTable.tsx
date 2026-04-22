'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { UsersRound } from 'lucide-react'
import { EmptyState } from '@/components/admin/EmptyState'
import { Button } from '@/components/ui/button'
import { SearchForm } from '@/components/ui/SearchForm'
import { Pagination } from '@/components/ui/pagination'
import { listMentors } from '@/lib/data/repository'

import { InviteMentorDialog } from './InviteMentorDialog'

const PAGE_SIZE = 10

export function MentorsTable() {
  const mentors = listMentors()
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = committedSearch.toLowerCase().trim()
    return mentors.filter((m) => {
      const matchQuery = q === '' || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.uid.toLowerCase().includes(q)
      return matchQuery
    })
  }, [mentors, committedSearch])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-5 p-5">
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
          placeholder="Cari nama, email, atau ID mentor..."
          submitLabel="Cari"
          className="w-full max-w-3xl"
        />
        <InviteMentorDialog />
      </div>

      {pagedRows.length === 0 ? (
        <EmptyState icon={<UsersRound className="h-5 w-5" />} title="Belum ada mentor" description="Tidak ada mentor yang cocok dengan filter saat ini." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pagedRows.map((mentor) => (
            <article key={mentor.uid} className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-100">
                  <Image src={mentor.avatar} alt={mentor.name} fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900">{mentor.name}</h3>
                  <p className="truncate text-xs text-slate-500">{mentor.email}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kelas</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">{mentor.totalCourses}</p>
              </div>

              <div className="mt-auto flex items-center justify-end gap-3">
                <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 px-4 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50">
                  <Link href={`/admin/users/mentors/${mentor.uid}`}>Detail</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
