import { ClipboardList, FileCheck, Pencil, Plus, RefreshCw, Timer, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { appPageContentClassName, gridStatsClassName } from '@/lib/layout/page-layout'
import {
  assignmentLifecycleBadgeVariant,
  deadlineUrgencyBadgeVariant,
  getAssignmentRowUrgencyClass,
  isAssignmentEffectivelyClosed,
  submissionReviewBadgeVariant,
} from '@/lib/mentor-assignments/assignment-table-presenters'
import type { MentorCourseAssignmentsViewModel } from '@/lib/mentor-assignments/mentor-assignments-view-model'
import { getDeadlineUrgency } from '@/lib/func/fungsi'
import type { IMentorCourseAssignment } from '@/lib/types/course'
import { ROUTES } from '@/lib/routes'

import { CardPanel } from '../ui/card'
import { CourseAssignmentDialog } from './CourseAssignmentDialog'
import { PageHeader } from './Header'
import { ReviewSubmissionDateRange } from './ReviewSubmissionDate'
import { StatCard } from './StatCard'
import { SubmissionReviewDialog } from './SubmissionReview'

type MentorCourseAssignmentsSectionProps = {
  view: MentorCourseAssignmentsViewModel
}

function AssignmentCrudRow({
  assignment,
  now,
  onEdit,
  onDelete,
}: {
  assignment: IMentorCourseAssignment
  now: Date
  onEdit: (assignment: IMentorCourseAssignment) => void
  onDelete: (assignment: IMentorCourseAssignment) => void
}) {
  const urgency = getDeadlineUrgency(assignment, now)
  const urgentVariant = deadlineUrgencyBadgeVariant(urgency)
  const effectivelyClosed = isAssignmentEffectivelyClosed(assignment, now)

  return (
    <tr
      className={cn('border-b border-slate-100', getAssignmentRowUrgencyClass(assignment, now))}>
      <td className="px-3 py-3 font-medium text-slate-900">{assignment.title}</td>
      <td className="px-3 py-3 tabular-nums text-slate-600">#{assignment.meetingNumber}</td>
      <td className="px-3 py-3 tabular-nums text-slate-600">
        {format(new Date(assignment.deadlineAt), 'd MMM yyyy HH:mm', { locale: id })}
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={assignmentLifecycleBadgeVariant(assignment, effectivelyClosed)} />
          {urgentVariant && <Badge variant={urgentVariant} />}
        </div>
      </td>
      <td className="px-3 py-3 text-slate-600">
        {assignment.autoCloseAfterDeadline ? 'Tutup otomatis setelah tenggat' : '—'}
        {assignment.allowResubmit ? ' · Resubmit diizinkan' : ''}
      </td>
      <td className="px-3 py-3 text-right">
        <div className="flex flex-wrap justify-end gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-xl border-slate-200 shadow-none"
            onClick={() => onEdit(assignment)}
            aria-label={`Edit tugas: ${assignment.title}`}>
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-xl border-rose-200 text-rose-800 shadow-none hover:bg-rose-50"
            onClick={() => onDelete(assignment)}
            aria-label={`Hapus tugas: ${assignment.title}`}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </td>
    </tr>
  )
}

export function MentorCourseAssignmentsSection({ view }: MentorCourseAssignmentsSectionProps) {
  const {
    now,
    meetingMax,
    courseData,
    assignmentData,
    stats,
    filteredSubmissions,
    assignmentTitleMap,
    assignmentUid,
    onAssignmentUidChange,
    submissionStatus,
    onSubmissionStatusChange,
    submissionDateRange,
    onSubmissionDateRangeChange,
    reviewOpen,
    onReviewOpenChange,
    activeSubmission,
    onOpenReview,
    assignmentFormOpen,
    onAssignmentFormOpenChange,
    assignmentFormMode,
    editingAssignment,
    onOpenCreateForm,
    onOpenEditForm,
    onDeleteAssignment,
    onReviewSaved,
    onAssignmentSaved,
  } = view

  return (
    <section className={appPageContentClassName}>
      <PageHeader
        title="Kelola tugas"
        subtitle={`${courseData.title} — ${meetingMax} pertemuan. Buat dan sunting tugas, atur tenggat, tinjau kiriman, dan beri feedback.`}
      />

      <div className={gridStatsClassName}>
        <StatCard
          variant="compact"
          className="shadow-none"
          label="Tugas aktif"
          value={stats.activeAssignments}
          icon={<ClipboardList className="h-6 w-6" />}
        />
        <StatCard
          variant="compact"
          className="shadow-none"
          label="Menunggu review"
          value={stats.awaitingReview}
          icon={<FileCheck className="h-6 w-6" />}
        />
        <StatCard
          variant="compact"
          className="shadow-none"
          label="Mendekati tenggat (≤72j)"
          value={stats.dueSoonCount}
          icon={<Timer className="h-6 w-6" />}
        />
        <StatCard
          variant="compact"
          className="shadow-none"
          label="Resubmit menunggu review"
          value={stats.resubmitAwaitingReview}
          icon={<RefreshCw className="h-6 w-6" />}
        />
      </div>

      <CardPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">CRUD tugas</h2>
            <p className="mt-1 text-sm text-slate-500">
              <span className="font-medium text-slate-600">Create</span> buat baru ·{' '}
              <span className="font-medium text-slate-600">Update</span> edit ·{' '}
              <span className="font-medium text-slate-600">Delete</span> hapus dari daftar.
            </p>
          </div>
          <Button type="button" className="w-fit shrink-0 gap-1.5 rounded-xl" onClick={onOpenCreateForm}>
            <Plus className="h-4 w-4" aria-hidden />
            Buat tugas
          </Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Judul
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Pertemuan
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Tenggat
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Kebijakan
                </th>
                <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {assignmentData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">
                    Belum ada tugas. Klik Buat tugas.
                  </td>
                </tr>
              )}
              {assignmentData.map((assignment) => (
                <AssignmentCrudRow
                  key={assignment.uid}
                  assignment={assignment}
                  now={now}
                  onEdit={onOpenEditForm}
                  onDelete={onDeleteAssignment}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardPanel>

      <CardPanel>
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">Kiriman peserta</h2>
        <p className="mt-1 text-sm text-slate-500">
          Filter lalu buka review untuk melihat teks, file, gambar, video, dan tautan.
        </p>

        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end">
          <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tugas</label>
            <select
              value={assignmentUid}
              onChange={(event) =>
                onAssignmentUidChange(event.target.value === 'all' ? 'all' : event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              <option value="all">Semua tugas</option>
              {assignmentData.map((assignment) => (
                <option key={assignment.uid} value={assignment.uid}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Status review
            </label>
            <select
              value={submissionStatus}
              onChange={(event) => onSubmissionStatusChange(event.target.value as typeof submissionStatus)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              <option value="all">Semua</option>
              <option value="pending_review">Menunggu review</option>
              <option value="graded">Selesai dinilai</option>
              <option value="returned">Minta revisi</option>
            </select>
          </div>
          <ReviewSubmissionDateRange
            htmlForId="review-submission-date-range"
            value={submissionDateRange}
            onChange={onSubmissionDateRangeChange}
            className="min-w-[220px] flex-1 lg:max-w-[280px]"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Siswa
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Tugas
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Dikirim
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Attempt
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Review
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {' '}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr key={submission.uid} className="border-b border-slate-100">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={submission.studentAvatar}
                        width={32}
                        height={32}
                        loading="lazy"
                        alt={submission.studentName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-slate-900">{submission.studentName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {assignmentTitleMap.get(submission.assignmentUid) ?? '—'}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-slate-600">
                    {format(new Date(submission.submittedAt), 'd MMM yyyy', { locale: id })}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-slate-600">{submission.attemptNumber}</td>
                  <td className="px-3 py-3">
                    <Badge variant={submissionReviewBadgeVariant(submission.reviewStatus)} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl shadow-none"
                      onClick={() => onOpenReview(submission)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSubmissions.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">Tidak ada kiriman untuk filter ini.</p>
          )}
        </div>
      </CardPanel>

      <SubmissionReviewDialog
        open={reviewOpen}
        onOpenChange={onReviewOpenChange}
        submission={activeSubmission}
        assignmentTitle={
          activeSubmission ? (assignmentTitleMap.get(activeSubmission.assignmentUid) ?? '—') : '—'
        }
        onSaved={onReviewSaved}
      />

      <CourseAssignmentDialog
        open={assignmentFormOpen}
        onOpenChange={onAssignmentFormOpenChange}
        course={courseData}
        courseUid={courseData.uid}
        mode={assignmentFormMode}
        editing={assignmentFormMode === 'edit' ? editingAssignment : null}
        onSaved={onAssignmentSaved}
      />
    </section>
  )
}

type MentorCourseAssignmentsNotFoundProps = {
  backHref?: string
}

export function MentorCourseAssignmentsNotFound({
  backHref = ROUTES.mentor.courses,
}: MentorCourseAssignmentsNotFoundProps) {
  return (
    <section className={appPageContentClassName}>
      <p className="text-slate-600">Kursus tidak ditemukan.</p>
      <Button asChild variant="outline" className="w-fit rounded-xl shadow-none">
        <Link to={backHref}>Kembali ke daftar</Link>
      </Button>
    </section>
  )
}
