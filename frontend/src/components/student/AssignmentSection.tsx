import { Link } from 'react-router-dom'
import { Badge } from '../ui/badge'
import { PageHeader } from '../shared/Header'
import { SearchForm } from '../shared/SearchForm'
import { SegmentedFilter } from '../shared/SegemntedFilter'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileCheck2,
  Lock,
} from 'lucide-react'
import { Pagination } from '../shared/Pagination'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { StudentAssignmentFeedCategory, StudentAssignmentRowKind } from '@/lib/types/student-assignments'
import type { DeadlineUrgency } from '@/lib/types/utils'
import {
  canOpenStudentAssignment,
  getStudentAssignmentAccessDeniedReason,
} from '@/lib/student-assignments/assignment-access-rules'
import { formatAssignmentDeadlineRelative } from '@/lib/student-assignments/format-assignment-deadline'
import type { StudentAssignmentRow } from '@/lib/student-assignments/assignment-row-model'
import { buildStudentAssignmentHref } from '@/lib/student-assignments/assignment-navigation'
import type { StudentAssignmentListViewModel } from '@/lib/student-assignments/assignment-list-view-model'
import { SafeLottie } from '../ui/lottie'

type StudentAssignmentsSectionProps = {
  view: StudentAssignmentListViewModel
  isLoading?: boolean
  className?: string
}

const TABS: { id: StudentAssignmentFeedCategory; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'todo', label: 'Belum dikumpulkan' },
  { id: 'pending_review', label: 'Menunggu review' },
  { id: 'done', label: 'Selesai dinilai' },
  { id: 'late', label: 'Terlambat' },
]

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
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold',
          meta.className,
        )}>
        {meta.label}
      </span>
      <DeadlineUrgencyBadges urgency={row.deadlineUrgency} />
    </div>
  )
}

function StatPill({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: typeof ClipboardList
  tone: string
}) {
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

function AssignmentListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-[220px] animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100/70"
        />
      ))}
    </div>
  )
}

function AssignmentEmptyState({ hasAnyItems }: { hasAnyItems: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/40 px-6 py-14 text-center">
      <div className="h-28 w-28">
        <SafeLottie src="/transaction-not-found.lottie" />
      </div>
      <div className="max-w-md space-y-2">
        <p className="text-base font-semibold text-slate-800">
          {hasAnyItems ? 'Tidak ada tugas untuk filter ini' : 'Belum ada tugas yang bisa ditampilkan'}
        </p>
        <p className="text-sm leading-6 text-slate-500">
          {hasAnyItems
            ? 'Coba ubah filter atau kata kunci pencarian.'
            : 'Tugas dari kursus yang Anda ikuti akan muncul di sini setelah Anda mengumpulkan atau mengerjakan tugas pertama.'}
        </p>
      </div>
    </div>
  )
}

function AssignmentRowCard({ row, now }: { row: StudentAssignmentRow; now: Date }) {
  const canOpen = canOpenStudentAssignment(row, now)
  const blockReason = canOpen ? null : getStudentAssignmentAccessDeniedReason(row, now)
  const href = buildStudentAssignmentHref({
    courseUid: row.assignment.courseId,
    lessonUid: row.lessonUid,
    openAssignmentPane: canOpen,
  })
  const urgency = urgencyTone[row.deadlineUrgency]
  const plainDescription = row.assignment.description.replace(/<[^>]*>/g, '')

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
      <div className="grid min-h-[220px] gap-0 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col justify-between gap-6 p-5 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">{row.courseTitle}</p>
                {row.moduleTitle && row.lessonTitle && (
                  <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">
                    {row.moduleTitle} · {row.lessonTitle}
                  </p>
                )}
              </div>
              <TaskBadges row={row} />
            </div>

            <div className="min-w-0">
              <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-slate-900 sm:text-xl">
                {row.assignment.title}
              </h3>
              {plainDescription && (
                <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
                  {plainDescription}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5">
              Pelajaran {row.assignment.meetingNumber}
            </span>
            <span className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5">
              {row.assignment.taskType === 'quiz' ? 'Quiz' : 'Tugas teks'}
            </span>
            {row.latestSubmission && (
              <span className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5">
                Percobaan {row.latestSubmission.attemptNumber}
              </span>
            )}
          </div>
        </div>

        <aside className="flex flex-col justify-between gap-4 border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6 xl:border-l xl:border-t-0">
          <div className={cn('rounded-xl border px-4 py-3.5', urgency.border, urgency.bg)}>
            <div className="flex items-center gap-2">
              <CalendarClock className={cn('h-4 w-4', urgency.text)} aria-hidden />
              <p className="text-xs font-semibold uppercase text-slate-500">Tenggat</p>
            </div>
            <p className={cn('mt-2 text-base font-bold leading-snug', urgency.text)}>
              {formatAssignmentDeadlineRelative(row.assignment.deadlineAt, now, row.deadlineUrgency)}
            </p>
            <p className="mt-1 text-xs tabular-nums text-slate-500">
              {format(new Date(row.assignment.deadlineAt), 'd MMM yyyy - HH:mm', { locale: id })}
            </p>
          </div>

          {canOpen ? (
            <Button
              asChild
              variant="default"
              size="sm"
              className="h-11 w-full justify-center gap-2 rounded-xl font-semibold shadow-none active:scale-[0.98]">
              <Link to={href}>
                {row.rowKind === 'graded' ? 'Lihat hasil' : 'Kerjakan tugas'}
                <ChevronRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
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
}

export function StudentAssignmentsSection({ view, isLoading = false, className }: StudentAssignmentsSectionProps) {
  const {
    now,
    courseUidFilter,
    clearCourseFilterHref,
    category,
    onCategoryChange,
    searchInput,
    onSearchInputChange,
    onSearchSubmit,
    stats,
    paginatedRows,
    scopedCount,
    hasVisibleRows,
    currentPage,
    totalPages,
    onPageChange,
  } = view

  return (
    <section className={cn('flex w-full flex-col gap-8', className)}>
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Tugas"
          subtitle="Pantau deadline, status pengumpulan, dan nilai tugas dari seluruh kursus yang Anda ikuti."
        />

        {courseUidFilter && (
          <p className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            Menyaring kursus terpilih.{' '}
            <Link
              to={clearCourseFilterHref}
              className="font-medium text-primary underline-offset-2 hover:underline">
              Tampilkan semua kursus
            </Link>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Total tugas" value={stats.total} icon={ClipboardList} tone="bg-primary/10 text-primary" />
        <StatPill label="Perlu aksi" value={stats.todo} icon={Clock3} tone="bg-sky-50 text-sky-700" />
        <StatPill
          label="Menunggu review"
          value={stats.review}
          icon={FileCheck2}
          tone="bg-amber-50 text-amber-800"
        />
        <StatPill label="Mendesak" value={stats.urgent} icon={AlertTriangle} tone="bg-rose-50 text-rose-700" />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-4">
          <SearchForm
            value={searchInput}
            onChange={onSearchInputChange}
            onSubmit={onSearchSubmit}
            placeholder="Cari judul atau nama kursus..."
            className="md:max-w-none"
          />

          <SegmentedFilter
            items={TABS.map((tab) => ({ value: tab.id, label: tab.label }))}
            value={category}
            onChange={onCategoryChange}
            variant="wrap"
          />
        </div>
      </div>

      {isLoading ? (
        <AssignmentListSkeleton />
      ) : hasVisibleRows ? (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            {paginatedRows.map((row) => (
              <AssignmentRowCard key={row.assignment.uid} row={row} now={now} />
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      ) : (
        <AssignmentEmptyState hasAnyItems={scopedCount > 0} />
      )}
    </section>
  )
}
