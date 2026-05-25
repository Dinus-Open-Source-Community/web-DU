import { useMemo, useState } from 'react'
import { Users2 } from 'lucide-react'
import type { AdminStatus, AdminStudent } from '../../../lib/types/user'
import { SearchForm } from '../../shared/SearchForm'
import { EmptyState } from '../../shared/EmptyState'
import { Button } from '../../ui/button'
import { cn } from '../../../lib/utils'
import { Link } from 'react-router-dom'
import { Pagination } from '../../shared/Pagination'

type StatusFilter = 'all' | AdminStatus

const PAGE_SIZE = 10

function ProgressCell({ value }: { value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-600 tabular-nums">{value}%</span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export function TableManagementUsers({ studentData }: { studentData: AdminStudent[] }) {
  const students = useMemo<AdminStudent[]>(() => studentData || [], [studentData])
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = committedSearch.toLowerCase().trim()
    return students.filter((s) => {
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      const matchQuery = q === '' || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.uid.toLowerCase().includes(q)
      return matchStatus && matchQuery
    })
  }, [students, committedSearch, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-5 ">
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
        className="w-full max-w-3xl"
      />

      {pagedRows.length === 0 ? (
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
                setPage(1)
              }}>
              Reset filter
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pagedRows.map((student) => (
            <article key={student.uid} className={cn('flex h-full flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs')}>
              <div className="flex items-start gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-100">
                  <img src={student.avatar} alt={student.name} className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900">{student.name}</h3>
                  <p className="truncate text-xs text-slate-500">{student.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50/70 p-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kursus</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">{student.enrolledCourses}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Rata-rata progres</p>
                  <div className="mt-1">
                    <ProgressCell value={student.averageProgress} />
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Bergabung {student.joinedAt}</p>
                <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 px-4 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50">
                  <Link to={`/admin/users/students/${student.uid}`}>Detail</Link>
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
