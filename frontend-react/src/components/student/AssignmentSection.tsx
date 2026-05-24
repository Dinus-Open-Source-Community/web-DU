import { Link, useSearchParams } from 'react-router-dom'
import { Badge } from '../ui/badge'
import { useMemo, useState } from 'react'
import { PageHeader } from '../shared/Header'
import { SearchForm } from '../shared/SearchForm'
import { SegmentedFilter } from '../shared/SegemntedFilter'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { AlertTriangle, CalendarClock, ChevronRight, ClipboardList, Clock3, FileCheck2, Lock } from 'lucide-react'
import { Pagination } from '../shared/Pagination'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { IMentorAssignmentSubmission, IMentorCourseAssignment } from '@/lib/types/course'
import type { DeadlineUrgency } from '@/lib/types/utils'

export type StudentAssignmentFeedCategory = 'all' | 'todo' | 'pending_review' | 'done' | 'late'
export type StudentAssignmentRowKind = 'not_submitted' | 'pending_review' | 'graded' | 'returned'

export type StudentAssignmentSectionItem = {
  assignment: IMentorCourseAssignment
  courseTitle: string
  latestSubmission?: IMentorAssignmentSubmission | null
}

type StudentAssignmentRow = StudentAssignmentSectionItem & {
  deadlineUrgency: DeadlineUrgency
  rowKind: StudentAssignmentRowKind
}

type StudentAssignmentsSectionProps = {
  items: StudentAssignmentSectionItem[]
  now?: Date
  className?: string
}

const TABS: { id: StudentAssignmentFeedCategory; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'todo', label: 'Belum dikumpulkan' },
  { id: 'pending_review', label: 'Menunggu review' },
  { id: 'done', label: 'Selesai dinilai' },
  { id: 'late', label: 'Terlambat' },
]

const ITEMS_PER_PAGE = 6
const DUE_SOON_MS = 72 * 60 * 60 * 1000

const rowKindMeta: Record<StudentAssignmentRowKind, { label: string; className: string }> = {
  not_submitted: { label: 'Perlu dikumpulkan', className: 'border-sky-200 bg-sky-50 text-sky-700' },
  pending_review: { label: 'Menunggu review', className: 'border-amber-200 bg-amber-50 text-amber-800' },
  graded: { label: 'Selesai dinilai', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  returned: { label: 'Minta revisi', className: 'border-violet-200 bg-violet-50 text-violet-700' },
}

const urgencyTone: Record<DeadlineUrgency, { border: string; text: string; bg: string }> = {
  overdue: { border: 'border-rose-200', text: 'text-rose-700', bg: 'bg-rose-50' },
  due_soon: { border: 'border-amber-200', text: 'text-amber-800', bg: 'bg-amber-50' },
  ok: { border: 'border-slate-200', text: 'text-slate-700', bg: 'bg-slate-50' },
  closed: { border: 'border-slate-200', text: 'text-slate-500', bg: 'bg-slate-100' },
}

function getEffectiveAssignmentStatus(assignment: IMentorCourseAssignment, now: Date): IMentorCourseAssignment['status'] {
  if (assignment.status === 'draft' || assignment.status === 'closed') return assignment.status
  const deadline = new Date(assignment.deadlineAt).getTime()
  if (assignment.autoCloseAfterDeadline && now.getTime() > deadline) return 'closed'
  return assignment.status
}

function getDeadlineUrgency(assignment: IMentorCourseAssignment, now: Date): DeadlineUrgency {
  const effective = getEffectiveAssignmentStatus(assignment, now)
  if (effective === 'closed' || assignment.status === 'draft') return effective === 'draft' ? 'ok' : 'closed'

  const deadline = new Date(assignment.deadlineAt).getTime()
  const current = now.getTime()
  if (current > deadline) return 'overdue'
  if (deadline - current <= DUE_SOON_MS) return 'due_soon'
  return 'ok'
}

function getRowKind(submission?: IMentorAssignmentSubmission | null): StudentAssignmentRowKind {
  if (!submission) return 'not_submitted'
  switch (submission.reviewStatus) {
    case 'pending_review':
      return 'pending_review'
    case 'graded':
      return 'graded'
    case 'returned':
      return 'returned'
  }
}

function toRows(items: StudentAssignmentSectionItem[], now: Date): StudentAssignmentRow[] {
  return items
    .filter((item) => item.assignment.status !== 'draft')
    .map((item) => ({
      ...item,
      latestSubmission: item.latestSubmission ?? null,
      deadlineUrgency: getDeadlineUrgency(item.assignment, now),
      rowKind: getRowKind(item.latestSubmission),
    }))
    .sort((a, b) => new Date(a.assignment.deadlineAt).getTime() - new Date(b.assignment.deadlineAt).getTime())
}

function formatAssignmentDeadlineRelative(deadlineAt: string, now: Date, urgency: DeadlineUrgency): string {
  const deadline = new Date(deadlineAt).getTime()
  const current = now.getTime()
  const diff = deadline - current

  if (urgency === 'closed') return 'Ditutup'

  if (diff > 0) {
    const hours = diff / 3_600_000
    if (hours < 1) return `${Math.max(1, Math.ceil(diff / 60_000))} menit lagi`
    if (hours < 48) return `${Math.floor(hours)} jam lagi`

    const days = Math.floor(diff / 86_400_000)
    const remainingHours = Math.floor((diff % 86_400_000) / 3_600_000)
    return remainingHours > 0 ? `${days} hari ${remainingHours} jam lagi` : `${days} hari lagi`
  }

  const late = current - deadline
  const lateHours = late / 3_600_000
  if (lateHours < 1) return `Terlambat ${Math.max(1, Math.floor(late / 60_000))} menit`
  if (lateHours < 48) return `Terlambat ${Math.floor(lateHours)} jam`

  const days = Math.floor(late / 86_400_000)
  const remainingHours = Math.floor((late % 86_400_000) / 3_600_000)
  return remainingHours > 0 ? `Terlambat ${days} hari ${remainingHours} jam` : `Terlambat ${days} hari`
}

function canOpenAssignment(row: StudentAssignmentRow, now: Date): boolean {
  if (row.rowKind === 'pending_review') return false

  const isPastDeadline = new Date(row.assignment.deadlineAt).getTime() < now.getTime()
  if (isPastDeadline && row.rowKind === 'not_submitted') return false

  const effective = getEffectiveAssignmentStatus(row.assignment, now)
  if (effective === 'closed') {
    if (row.rowKind === 'graded') return true
    if (row.rowKind === 'returned' && row.assignment.allowResubmit) return true
    return false
  }

  return true
}

function getAccessDeniedReason(row: StudentAssignmentRow, now: Date): string {
  if (row.rowKind === 'pending_review') return 'Kiriman Anda sedang ditinjau mentor. Halaman pengumpulan tidak dapat dibuka untuk sementara.'

  const isPastDeadline = new Date(row.assignment.deadlineAt).getTime() < now.getTime()
  if (isPastDeadline && row.rowKind === 'not_submitted') return 'Tenggat sudah lewat dan Anda belum mengumpulkan. Akses halaman tugas dinonaktifkan.'
  if (getEffectiveAssignmentStatus(row.assignment, now) === 'closed') return 'Tugas sudah ditutup.'
  return 'Halaman tugas tidak tersedia untuk status ini.'
}

function filterRows(rows: StudentAssignmentRow[], category: StudentAssignmentFeedCategory): StudentAssignmentRow[] {
  if (category === 'all') return rows

  return rows.filter((row) => {
    switch (category) {
      case 'todo':
        return row.rowKind === 'not_submitted' || row.rowKind === 'returned'
      case 'pending_review':
        return row.rowKind === 'pending_review'
      case 'done':
        return row.rowKind === 'graded'
      case 'late':
        return row.deadlineUrgency === 'overdue' && row.rowKind !== 'graded'
      default:
        return true
    }
  })
}

function DeadlineUrgencyBadges({ urgency }: { urgency: DeadlineUrgency }) {
  if (urgency === 'overdue') return <Badge variant="deadlineOverdue">Terlambat</Badge>
  if (urgency === 'due_soon') return <Badge variant="deadlineDueSoon">Segera</Badge>
  if (urgency === 'closed') return <Badge variant="assignmentClosed">Ditutup</Badge>
  return null
}

function TaskBadges({ row }: { row: StudentAssignmentRow }) {
  const meta = rowKindMeta[row.rowKind]

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold', meta.className)}>{meta.label}</span>
      <DeadlineUrgencyBadges urgency={row.deadlineUrgency} />
    </div>
  )
}

function StatPill({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof ClipboardList; tone: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tone)}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none text-slate-900">{value}</p>
        <p className="mt-1 truncate text-xs font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export function StudentAssignmentsSection({ items, now: nowProp, className }: StudentAssignmentsSectionProps) {
  const [searchParams] = useSearchParams()
  const courseUidFilter = searchParams.get('courseUid')
  const now = useMemo(() => nowProp ?? new Date(), [nowProp])
  const [category, setCategory] = useState<StudentAssignmentFeedCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const rows = useMemo(() => toRows(items, now), [items, now])

  const scoped = useMemo(() => {
    if (!courseUidFilter) return rows
    return rows.filter((row) => row.assignment.courseId === courseUidFilter)
  }, [rows, courseUidFilter])

  const filtered = useMemo(() => filterRows(scoped, category), [scoped, category])

  const stats = useMemo(
    () => ({
      total: scoped.length,
      todo: scoped.filter((row) => row.rowKind === 'not_submitted' || row.rowKind === 'returned').length,
      review: scoped.filter((row) => row.rowKind === 'pending_review').length,
      urgent: scoped.filter((row) => row.deadlineUrgency === 'overdue' || row.deadlineUrgency === 'due_soon').length,
    }),
    [scoped],
  )

  const searchFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return filtered
    return filtered.filter((row) => row.assignment.title.toLowerCase().includes(q) || row.courseTitle.toLowerCase().includes(q))
  }, [filtered, searchQuery])

  const totalPages = Math.max(1, Math.ceil(searchFiltered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = searchFiltered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  return (
    <section className={cn('flex w-full flex-col gap-7 ', className)}>
      <div className="flex flex-col gap-5">
        <PageHeader title="Tugas" subtitle="Kelola dan kumpulkan tugas dari kursus Anda. Buka detail hanya saat tugas dapat dikerjakan atau sudah dinilai." />

        {courseUidFilter && (
          <p className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            Menyaring kursus terpilih.{' '}
            <Link to="/student/assignments" className="font-medium text-primary underline-offset-2 hover:underline">
              Tampilkan semua kursus
            </Link>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Total tugas" value={stats.total} icon={ClipboardList} tone="bg-primary/10 text-primary" />
        <StatPill label="Perlu aksi" value={stats.todo} icon={Clock3} tone="bg-sky-50 text-sky-700" />
        <StatPill label="Menunggu review" value={stats.review} icon={FileCheck2} tone="bg-amber-50 text-amber-800" />
        <StatPill label="Mendesak" value={stats.urgent} icon={AlertTriangle} tone="bg-rose-50 text-rose-700" />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-4">
          <SearchForm
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={() => {
              setSearchQuery(searchInput)
              setCurrentPage(1)
            }}
            placeholder="Cari judul atau nama kursus..."
            className="md:max-w-none"
          />

          <SegmentedFilter
            items={TABS.map((tab) => ({ value: tab.id, label: tab.label }))}
            value={category}
            onChange={(value) => {
              setCategory(value)
              setCurrentPage(1)
            }}
            variant="wrap"
          />
        </div>
      </div>

      {searchFiltered.length > 0 ? (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            {paginated.map((row) => {
              const canOpen = canOpenAssignment(row, now)
              const blockReason = canOpen ? null : getAccessDeniedReason(row, now)
              const href = `/student/assignments/${row.assignment.uid}`
              const urgency = urgencyTone[row.deadlineUrgency]
              const plainDescription = row.assignment.description.replace(/<[^>]*>/g, '')

              return (
                <article
                  key={row.assignment.uid}
                  className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
                  <div className="grid min-h-[220px] gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="flex min-w-0 flex-col justify-between gap-6 p-5 sm:p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase text-slate-400">Kursus</p>
                            <p className="mt-1 line-clamp-1 text-sm font-semibold text-primary">{row.courseTitle}</p>
                          </div>
                          <TaskBadges row={row} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 sm:text-xl">{row.assignment.title}</h3>
                          {plainDescription && <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">{plainDescription}</p>}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5">Pertemuan {row.assignment.meetingNumber}</span>
                        <span className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5">{row.assignment.taskType === 'quiz' ? 'Quiz' : 'Tugas teks'}</span>
                        {row.latestSubmission && <span className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5">Attempt {row.latestSubmission.attemptNumber}</span>}
                      </div>
                    </div>

                    <aside className="flex flex-col justify-between gap-4 border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6 lg:border-l lg:border-t-0">
                      <div className={cn('rounded-xl border px-4 py-3.5', urgency.border, urgency.bg)}>
                        <div className="flex items-center gap-2">
                          <CalendarClock className={cn('h-4 w-4', urgency.text)} aria-hidden />
                          <p className="text-xs font-semibold uppercase text-slate-500">Tenggat</p>
                        </div>
                        <p className={cn('mt-2 text-base font-bold leading-snug', urgency.text)}>{formatAssignmentDeadlineRelative(row.assignment.deadlineAt, now, row.deadlineUrgency)}</p>
                        <p className="mt-1 text-xs tabular-nums text-slate-500">{format(new Date(row.assignment.deadlineAt), 'd MMM yyyy - HH:mm', { locale: id })}</p>
                      </div>

                      {canOpen ? (
                        <Button asChild variant="default" size="sm" className="h-11 w-full justify-center gap-2 rounded-xl font-semibold shadow-none">
                          <Link to={href}>
                            Buka tugas
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                          </Link>
                        </Button>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3.5">
                          <div className="flex items-start gap-2.5">
                            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                            <p className="text-xs leading-5 text-slate-600">{blockReason}</p>
                          </div>
                        </div>
                      )}
                    </aside>
                  </div>
                </article>
              )
            })}
          </div>

          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/40 py-12 text-center text-sm text-slate-500">Tidak ada tugas untuk filter atau pencarian ini.</p>
      )}
    </section>
  )
}
