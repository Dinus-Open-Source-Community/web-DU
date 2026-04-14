'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { DateRange } from 'react-day-picker'
import { ArrowLeft, ClipboardList, FileCheck, Pencil, Plus, RefreshCw, Timer, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { CardPanel, StatCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { IMentorCourse, IMentorCourseAssignment, IMentorAssignmentSubmission } from '@/lib/types'
import { getCourseMeetingCount, getMentorCourseByUid } from '@/lib/mentorCourseStorage'
import {
  computeAssignmentStats,
  deleteMentorAssignment,
  filterSubmissions,
  getAssignmentsForCourse,
  getDeadlineUrgency,
  getEffectiveAssignmentStatus,
  getSubmissionsForCourse,
  type SubmissionFilterStatus,
} from '@/lib/mentorAssignmentsData'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { notifyDeleted, notifyError } from '@/lib/notify'
import { cn } from '@/lib/utils'
import { SubmissionReviewDialog } from './SubmissionReviewDialog'
import { CourseAssignmentDialog } from './CourseAssignmentDialog'
import { ReviewSubmissionDateRange } from './ReviewSubmissionDateRange'

type MentorCourseAssignmentsClientProps = {
  courseUid: string
}

function assignmentLifecycleVariant(
  a: IMentorCourseAssignment,
  effectiveClosed: boolean
): 'assignmentDraft' | 'assignmentPublished' | 'assignmentClosed' {
  if (a.status === 'draft') return 'assignmentDraft'
  if (effectiveClosed || a.status === 'closed') return 'assignmentClosed'
  return 'assignmentPublished'
}

function deadlineUrgencyVariant(urg: ReturnType<typeof getDeadlineUrgency>): 'deadlineOverdue' | 'deadlineDueSoon' | null {
  if (urg === 'closed') return null
  if (urg === 'overdue') return 'deadlineOverdue'
  if (urg === 'due_soon') return 'deadlineDueSoon'
  return null
}

function submissionReviewVariant(
  status: IMentorAssignmentSubmission['reviewStatus']
): 'reviewPending' | 'reviewGraded' | 'reviewReturned' {
  switch (status) {
    case 'pending_review':
      return 'reviewPending'
    case 'graded':
      return 'reviewGraded'
    case 'returned':
      return 'reviewReturned'
  }
}

export function MentorCourseAssignmentsClient({ courseUid }: MentorCourseAssignmentsClientProps) {
  const confirm = useConfirm()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [course, setCourse] = useState<IMentorCourse | null | undefined>(undefined)
  const [assignments, setAssignments] = useState<IMentorCourseAssignment[]>([])
  const [submissions, setSubmissions] = useState<IMentorAssignmentSubmission[]>([])
  const [assignmentUid, setAssignmentUid] = useState<string | 'all'>('all')
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionFilterStatus>('all')
  const [submissionDateRange, setSubmissionDateRange] = useState<DateRange | undefined>()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [activeSubmission, setActiveSubmission] = useState<IMentorAssignmentSubmission | null>(null)

  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false)
  const [assignmentFormMode, setAssignmentFormMode] = useState<'create' | 'edit'>('create')
  const [editingAssignment, setEditingAssignment] = useState<IMentorCourseAssignment | null>(null)

  const refreshAssignments = useCallback(() => {
    setAssignments(getAssignmentsForCourse(courseUid))
  }, [courseUid])

  const refreshSubmissions = useCallback(() => {
    setSubmissions(getSubmissionsForCourse(courseUid))
  }, [courseUid])

  useEffect(() => {
    setCourse(getMentorCourseByUid(courseUid) ?? null)
  }, [courseUid])

  useEffect(() => {
    refreshAssignments()
    refreshSubmissions()
  }, [refreshAssignments, refreshSubmissions])

  useEffect(() => {
    if (!course) return
    if (searchParams.get('new') === '1') {
      setAssignmentFormMode('create')
      setEditingAssignment(null)
      setAssignmentFormOpen(true)
      router.replace(`/mentor/courses/${courseUid}/assignments`, { scroll: false })
    }
  }, [course, searchParams, router, courseUid])

  const now = useMemo(() => new Date(), [])
  const stats = useMemo(() => computeAssignmentStats(assignments, submissions, now), [assignments, submissions, now])

  const reviewDateFrom = useMemo(
    () => (submissionDateRange?.from ? format(submissionDateRange.from, 'yyyy-MM-dd') : undefined),
    [submissionDateRange]
  )
  const reviewDateTo = useMemo(
    () => (submissionDateRange?.to ? format(submissionDateRange.to, 'yyyy-MM-dd') : undefined),
    [submissionDateRange]
  )

  const filteredSubmissions = useMemo(
    () =>
      filterSubmissions(submissions, {
        assignmentUid,
        status: submissionStatus,
        from: reviewDateFrom,
        to: reviewDateTo,
      }),
    [submissions, assignmentUid, submissionStatus, reviewDateFrom, reviewDateTo]
  )

  const assignmentTitleMap = useMemo(() => {
    const m = new Map<string, string>()
    assignments.forEach((a) => m.set(a.uid, a.title))
    return m
  }, [assignments])

  const meetingMax = course ? getCourseMeetingCount(course) : 8

  const openReview = useCallback((s: IMentorAssignmentSubmission) => {
    setActiveSubmission(s)
    setReviewOpen(true)
  }, [])

  const onReviewSaved = useCallback(
    (updated: IMentorAssignmentSubmission) => {
      setSubmissions((prev) => prev.map((x) => (x.uid === updated.uid ? updated : x)))
    },
    []
  )

  const openCreate = useCallback(() => {
    setAssignmentFormMode('create')
    setEditingAssignment(null)
    setAssignmentFormOpen(true)
  }, [])

  const openEdit = useCallback((a: IMentorCourseAssignment) => {
    setAssignmentFormMode('edit')
    setEditingAssignment(a)
    setAssignmentFormOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (a: IMentorCourseAssignment) => {
      const ok = await confirm({
        title: "Hapus tugas?",
        description: `Tugas "${a.title}" akan dihapus dari daftar.`,
        confirmLabel: "Hapus",
        variant: "destructive",
      })
      if (!ok) return
      if (deleteMentorAssignment(a.uid)) {
        notifyDeleted()
        refreshAssignments()
        refreshSubmissions()
        if (assignmentUid === a.uid) setAssignmentUid('all')
      } else {
        notifyError("Gagal menghapus tugas.")
      }
    },
    [confirm, refreshAssignments, refreshSubmissions, assignmentUid]
  )

  const onAssignmentFormSaved = useCallback(() => {
    refreshAssignments()
  }, [refreshAssignments])

  if (course === undefined) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-sm text-slate-500">Memuat…</p>
      </section>
    )
  }

  if (course === null) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-slate-600">Kursus tidak ditemukan.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl shadow-none">
          <Link href="/mentor/courses">Kembali ke daftar</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Button asChild variant="outline" size="sm" className="w-fit gap-2 rounded-lg border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground">
        <Link href={`/mentor/courses/${courseUid}`}>
          <ArrowLeft className="size-3.5 opacity-80" aria-hidden />
          Kembali ke kursus
        </Link>
      </Button>

      <PageHeader
        title="Kelola tugas"
        subtitle={`${course.title} — ${meetingMax} pertemuan. Buat dan sunting tugas, atur tenggat, tinjau kiriman, dan beri feedback.`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          variant="compact"
          className="shadow-none"
          label="Tugas aktif"
          value={stats.activeAssignments}
          icon={<ClipboardList className="h-6 w-6" />}
        />
        <StatCard variant="compact" className="shadow-none" label="Menunggu review" value={stats.awaitingReview} icon={<FileCheck className="h-6 w-6" />} />
        <StatCard variant="compact" className="shadow-none" label="Mendekati tenggat (≤72j)" value={stats.dueSoonCount} icon={<Timer className="h-6 w-6" />} />
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
          <Button type="button" className="w-fit shrink-0 gap-1.5 rounded-xl" onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Buat tugas
          </Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Judul</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pertemuan</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tenggat</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Kebijakan</th>
                <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">
                    Belum ada tugas. Klik Buat tugas.
                  </td>
                </tr>
              )}
              {assignments.map((a) => {
                const eff = getEffectiveAssignmentStatus(a, now)
                const urg = getDeadlineUrgency(a, now)
                const urgentVariant = deadlineUrgencyVariant(urg)
                return (
                  <tr
                    key={a.uid}
                    className={cn(
                      'border-b border-slate-100',
                      urg === 'due_soon' && 'border-l-4 border-l-amber-400 bg-amber-50/40',
                      urg === 'overdue' && 'border-l-4 border-l-rose-300 bg-rose-50/35'
                    )}>
                    <td className="px-3 py-3 font-medium text-slate-900">{a.title}</td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">#{a.meetingNumber}</td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">
                      {format(new Date(a.deadlineAt), 'd MMM yyyy HH:mm', { locale: id })}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={assignmentLifecycleVariant(a, eff === 'closed')} />
                        {urgentVariant && <Badge variant={urgentVariant} />}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {a.autoCloseAfterDeadline ? 'Tutup otomatis setelah tenggat' : '—'}
                      {a.allowResubmit ? ' · Resubmit diizinkan' : ''}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="rounded-xl border-slate-200 shadow-none"
                          onClick={() => openEdit(a)}
                          aria-label={`Edit tugas: ${a.title}`}>
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="rounded-xl border-rose-200 text-rose-800 shadow-none hover:bg-rose-50"
                          onClick={() => handleDelete(a)}
                          aria-label={`Hapus tugas: ${a.title}`}>
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardPanel>

      <CardPanel>
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">Kiriman peserta</h2>
        <p className="mt-1 text-sm text-slate-500">Filter lalu buka review untuk melihat teks, file, gambar, video, dan tautan.</p>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tugas</label>
            <select
              value={assignmentUid}
              onChange={(e) => setAssignmentUid(e.target.value === 'all' ? 'all' : e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              <option value="all">Semua tugas</option>
              {assignments.map((a) => (
                <option key={a.uid} value={a.uid}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status review</label>
            <select
              value={submissionStatus}
              onChange={(e) => setSubmissionStatus(e.target.value as SubmissionFilterStatus)}
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
            onChange={setSubmissionDateRange}
            className="min-w-[220px] flex-1 lg:max-w-[280px]"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Siswa</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tugas</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Dikirim</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Attempt</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Review</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500"> </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((s) => (
                <tr key={s.uid} className="border-b border-slate-100">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.studentAvatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                      <span className="font-medium text-slate-900">{s.studentName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{assignmentTitleMap.get(s.assignmentUid) ?? '—'}</td>
                  <td className="px-3 py-3 tabular-nums text-slate-600">{format(new Date(s.submittedAt), 'd MMM yyyy', { locale: id })}</td>
                  <td className="px-3 py-3 tabular-nums text-slate-600">{s.attemptNumber}</td>
                  <td className="px-3 py-3">
                    <Badge variant={submissionReviewVariant(s.reviewStatus)} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Button type="button" variant="outline" size="sm" className="rounded-xl shadow-none" onClick={() => openReview(s)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSubmissions.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Tidak ada kiriman untuk filter ini.</p>}
        </div>
      </CardPanel>

      <SubmissionReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        submission={activeSubmission}
        assignmentTitle={activeSubmission ? assignmentTitleMap.get(activeSubmission.assignmentUid) ?? '—' : '—'}
        onSaved={onReviewSaved}
      />

      <CourseAssignmentDialog
        open={assignmentFormOpen}
        onOpenChange={setAssignmentFormOpen}
        course={course}
        courseUid={courseUid}
        mode={assignmentFormMode}
        editing={assignmentFormMode === 'edit' ? editingAssignment : null}
        onSaved={onAssignmentFormSaved}
      />
    </section>
  )
}
