'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { ChevronRight, Lock } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { CARD_PANEL_CLASS } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { SearchForm } from '@/components/ui/SearchForm'
import { SegmentedFilter } from '@/components/ui/SegmentedFilter'
import { Badge } from '@/components/ui/badge'
import { DeadlineUrgencyBadges } from '@/components/assignments/DeadlineUrgencyBadges'
import { cn } from '@/lib/utils'
import {
  canStudentOpenAssignmentDetail,
  filterStudentFeed,
  formatAssignmentDeadlineRelative,
  getStudentAssignmentDetailAccessDeniedReason,
  listStudentAssignmentFeed,
  STUDENT_DEMO_UID,
  type StudentAssignmentFeedCategory,
  type StudentAssignmentFeedRow,
} from '@/lib/studentAssignmentsData'

const TABS: { id: StudentAssignmentFeedCategory; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'todo', label: 'Belum dikumpulkan' },
  { id: 'pending_review', label: 'Menunggu review' },
  { id: 'done', label: 'Selesai dinilai' },
  { id: 'late', label: 'Terlambat' },
]

const ITEMS_PER_PAGE = 6

function TaskBadges({ row }: { row: StudentAssignmentFeedRow }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {row.rowKind === 'pending_review' && <Badge variant="reviewPending">Menunggu review</Badge>}
      {row.rowKind === 'graded' && <Badge variant="reviewGraded">Selesai dinilai</Badge>}
      {row.rowKind === 'returned' && <Badge variant="reviewReturned">Minta revisi</Badge>}
    </div>
  )
}

export function StudentAssignmentsSection() {
  const searchParams = useSearchParams()
  const courseUidFilter = searchParams.get('courseUid')
  const [category, setCategory] = useState<StudentAssignmentFeedCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [rows, setRows] = useState<StudentAssignmentFeedRow[]>([])
  const [now, setNow] = useState(() => new Date())

  const load = useCallback(() => {
    setNow(new Date())
    setRows(listStudentAssignmentFeed(STUDENT_DEMO_UID))
  }, [])

  useEffect(() => {
    load()
    window.addEventListener('focus', load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener('focus', load)
      window.removeEventListener('storage', load)
    }
  }, [load])

  useEffect(() => {
    setCurrentPage(1)
  }, [category, searchQuery, courseUidFilter])

  const scoped = useMemo(() => {
    if (!courseUidFilter) return rows
    return rows.filter((r) => r.assignment.courseId === courseUidFilter)
  }, [rows, courseUidFilter])

  const filtered = useMemo(() => filterStudentFeed(scoped, category, now), [scoped, category, now])

  const searchFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return filtered
    return filtered.filter((r) => {
      const title = r.assignment.title.toLowerCase()
      const course = r.courseTitle.toLowerCase()
      return title.includes(q) || course.includes(q)
    })
  }, [filtered, searchQuery])

  const totalPages = Math.max(1, Math.ceil(searchFiltered.length / ITEMS_PER_PAGE))
  const paginated = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages)
    return searchFiltered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)
  }, [searchFiltered, currentPage, totalPages])

  return (
    <section className="flex w-full flex-col gap-8 px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Tugas"
          subtitle="Kelola dan kumpulkan tugas dari kursus Anda. Buka detail hanya saat tugas dapat dikerjakan atau sudah dinilai."
        />

        {courseUidFilter && (
          <p className="text-sm text-slate-600">
            Menyaring kursus terpilih.{' '}
            <Link href="/student/assignments" className="font-medium text-primary underline-offset-2 hover:underline">
              Tampilkan semua kursus
            </Link>
          </p>
        )}

        <SearchForm
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => setSearchQuery(searchInput)}
          placeholder="Cari judul atau nama kursus…"
        />
      </div>

      <SegmentedFilter items={TABS.map((t) => ({ value: t.id, label: t.label }))} value={category} onChange={setCategory} variant="wrap" />

      {searchFiltered.length > 0 ? (
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((row) => {
              const canOpen = canStudentOpenAssignmentDetail(row, now)
              const blockReason = canOpen ? null : getStudentAssignmentDetailAccessDeniedReason(row, now)
              const href = `/student/assignments/${row.assignment.uid}`

              return (
                <article
                  key={row.assignment.uid}
                  className={cn(
                    CARD_PANEL_CLASS,
                    'flex flex-col overflow-hidden transition-colors hover:border-slate-300/90'
                  )}>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <TaskBadges row={row} />

                    <div className="min-h-0 space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Kursus</p>
                      <p className="text-sm font-medium leading-snug text-slate-600">{row.courseTitle}</p>
                      <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-slate-900 md:text-lg">
                        {row.assignment.title}
                      </h3>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tenggat</p>
                        <DeadlineUrgencyBadges urgency={row.deadlineUrgency} />
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatAssignmentDeadlineRelative(row.assignment.deadlineAt, now, row.deadlineUrgency)}
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-slate-500">
                        {format(new Date(row.assignment.deadlineAt), 'd MMM yyyy · HH:mm', { locale: id })}
                      </p>
                    </div>

                    {canOpen ? (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-auto h-9 w-full justify-center gap-2 rounded-lg border-slate-200 font-semibold text-slate-800 shadow-none hover:bg-slate-50 hover:text-slate-900">
                        <Link href={href}>
                          Buka tugas
                          <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
                        </Link>
                      </Button>
                    ) : (
                      <div className="mt-auto rounded-lg border border-dashed border-slate-200/90 bg-slate-50/50 px-3 py-3">
                        <div className="flex items-start gap-2">
                          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                          <p className="text-xs leading-relaxed text-slate-600">{blockReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          <Pagination currentPage={Math.min(currentPage, totalPages)} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/40 py-12 text-center text-sm text-slate-500">
          Tidak ada tugas untuk filter atau pencarian ini.
        </p>
      )}
    </section>
  )
}
