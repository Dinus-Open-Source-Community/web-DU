import type { DeadlineUrgency, IMentorAssignmentSubmission, IMentorCourseAssignment, SubmissionContentBlock } from '@/lib/types'
import { getMentorCourseByUid } from '@/lib/mentorCourseStorage'
import {
  findAssignmentByUid,
  getAssignmentsForCourse,
  getDeadlineUrgency,
  getEffectiveAssignmentStatus,
  getSubmissionsForStudent,
  pushExtraSubmission,
} from '@/lib/mentorAssignmentsData'

/** Selaras dengan seed `SUBMISSION_SEED` (Rina Kusuma) */
export const STUDENT_DEMO_UID = 'stu-1'
export const STUDENT_DEMO_NAME = 'Rina Kusuma'
export const STUDENT_DEMO_AVATAR = 'https://i.pravatar.cc/150?img=32'

/** Kursus yang diikuti siswa demo (sinkron My Learning) */
export const STUDENT_ENROLLED_COURSE_IDS = ['mc-001', 'mc-002'] as const

export type StudentAssignmentFeedCategory =
  | 'all'
  | 'todo'
  | 'pending_review'
  | 'done'
  | 'late'

export type StudentAssignmentFeedRow = {
  assignment: IMentorCourseAssignment
  courseTitle: string
  deadlineUrgency: ReturnType<typeof getDeadlineUrgency>
  latestSubmission: IMentorAssignmentSubmission | null
  /** Untuk filter & badge */
  rowKind: 'not_submitted' | 'pending_review' | 'graded' | 'returned'
}

function submissionsForAssignment(studentUid: string, assignmentUid: string): IMentorAssignmentSubmission[] {
  return getSubmissionsForStudent(studentUid)
    .filter((s) => s.assignmentUid === assignmentUid)
    .sort((a, b) => b.attemptNumber - a.attemptNumber)
}

function rowKind(latest: IMentorAssignmentSubmission | null): StudentAssignmentFeedRow['rowKind'] {
  if (!latest) return 'not_submitted'
  switch (latest.reviewStatus) {
    case 'pending_review':
      return 'pending_review'
    case 'graded':
      return 'graded'
    case 'returned':
      return 'returned'
    default:
      return 'not_submitted'
  }
}

export function listStudentAssignmentFeed(studentUid: string, now: Date = new Date()): StudentAssignmentFeedRow[] {
  const out: StudentAssignmentFeedRow[] = []
  for (const courseId of STUDENT_ENROLLED_COURSE_IDS) {
    const course = getMentorCourseByUid(courseId)
    if (!course) continue
    const assignments = getAssignmentsForCourse(courseId)
    for (const a of assignments) {
      if (a.status === 'draft') continue
      const latest = submissionsForAssignment(studentUid, a.uid)[0] ?? null
      const urg = getDeadlineUrgency(a, now)
      out.push({
        assignment: a,
        courseTitle: course.title,
        deadlineUrgency: urg,
        latestSubmission: latest,
        rowKind: rowKind(latest),
      })
    }
  }
  return out.sort((x, y) => new Date(x.assignment.deadlineAt).getTime() - new Date(y.assignment.deadlineAt).getTime())
}

export function getStudentAssignmentFeedRow(
  studentUid: string,
  assignmentUid: string,
  now: Date = new Date()
): StudentAssignmentFeedRow | null {
  return listStudentAssignmentFeed(studentUid, now).find((r) => r.assignment.uid === assignmentUid) ?? null
}

/**
 * Countdown teks untuk tenggat, selaras dengan `getDeadlineUrgency` (termasuk status ditutup).
 * Sebelum tenggat: "N jam lagi" / menit / hari; setelah: "Terlambat N jam"; jika ditutup: "Ditutup".
 */
export function formatAssignmentDeadlineRelative(deadlineAt: string, now: Date, urgency: DeadlineUrgency): string {
  const end = new Date(deadlineAt).getTime()
  const t = now.getTime()
  const diff = end - t

  if (urgency === 'closed') {
    return 'Ditutup'
  }

  if (diff > 0) {
    const h = diff / 3_600_000
    if (h < 1) {
      const m = Math.max(1, Math.ceil(diff / 60_000))
      return `${m} menit lagi`
    }
    if (h < 48) {
      return `${Math.floor(h)} jam lagi`
    }
    const days = Math.floor(diff / 86_400_000)
    const remH = Math.floor((diff % 86_400_000) / 3_600_000)
    return remH > 0 ? `${days} hari ${remH} jam lagi` : `${days} hari lagi`
  }

  const past = t - end
  const oh = past / 3_600_000
  if (oh < 1) {
    const m = Math.max(1, Math.floor(past / 60_000))
    return `Terlambat ${m} menit`
  }
  if (oh < 48) {
    return `Terlambat ${Math.floor(oh)} jam`
  }
  const days = Math.floor(past / 86_400_000)
  const remH = Math.floor((past % 86_400_000) / 3_600_000)
  return remH > 0 ? `Terlambat ${days} hari ${remH} jam` : `Terlambat ${days} hari`
}

/**
 * Siswa boleh membuka halaman detail pengumpulan bila tugas masih dapat dikerjakan/ditinjau ulang,
 * atau sudah dinilai (lihat hasil). Diblokir saat menunggu review, telat tanpa kiriman, atau ditutup tanpa akses baca.
 */
export function canStudentOpenAssignmentDetail(row: StudentAssignmentFeedRow, now: Date = new Date()): boolean {
  if (row.rowKind === 'pending_review') return false

  const eff = getEffectiveAssignmentStatus(row.assignment, now)
  const pastDeadline = new Date(row.assignment.deadlineAt).getTime() < now.getTime()
  if (pastDeadline && row.rowKind === 'not_submitted') return false

  if (eff === 'closed') {
    if (row.rowKind === 'graded') return true
    if (row.rowKind === 'returned' && row.assignment.allowResubmit) return true
    return false
  }

  return true
}

export function getStudentAssignmentDetailAccessDeniedReason(
  row: StudentAssignmentFeedRow | null,
  now: Date = new Date()
): string | null {
  if (!row) return 'Tugas tidak ditemukan atau Anda tidak terdaftar di kursus ini.'
  if (canStudentOpenAssignmentDetail(row, now)) return null

  if (row.rowKind === 'pending_review') {
    return 'Kiriman Anda sedang ditinjau mentor. Halaman pengumpulan tidak dapat dibuka untuk sementara.'
  }

  const eff = getEffectiveAssignmentStatus(row.assignment, now)
  const pastDeadline = new Date(row.assignment.deadlineAt).getTime() < now.getTime()
  if (pastDeadline && row.rowKind === 'not_submitted') {
    return 'Tenggat sudah lewat dan Anda belum mengumpulkan. Akses halaman tugas dinonaktifkan.'
  }
  if (eff === 'closed') return 'Tugas sudah ditutup.'
  return 'Halaman tugas tidak tersedia untuk status ini.'
}

export function filterStudentFeed(
  rows: StudentAssignmentFeedRow[],
  category: StudentAssignmentFeedCategory,
  now: Date = new Date()
): StudentAssignmentFeedRow[] {
  if (category === 'all') return rows
  return rows.filter((r) => {
    const a = r.assignment
    const urg = getDeadlineUrgency(a, now)
    switch (category) {
      case 'todo':
        return r.rowKind === 'not_submitted' || r.rowKind === 'returned'
      case 'pending_review':
        return r.rowKind === 'pending_review'
      case 'done':
        return r.rowKind === 'graded'
      case 'late':
        return urg === 'overdue' && r.rowKind !== 'graded'
      default:
        return true
    }
  })
}

export type SubmitStudentAssignmentResult =
  | { ok: true; submission: IMentorAssignmentSubmission }
  | { ok: false; message: string }

export type AssignmentSubmitState = { allowed: true } | { allowed: false; message: string }

/** Untuk men-disable tombol kirim di UI */
export function getAssignmentSubmitState(studentUid: string, assignmentUid: string, now: Date = new Date()): AssignmentSubmitState {
  const a = findAssignmentByUid(assignmentUid)
  if (!a) return { allowed: false, message: 'Tugas tidak ditemukan.' }
  if (a.status === 'draft') return { allowed: false, message: 'Tugas belum terbit.' }
  if (!(STUDENT_ENROLLED_COURSE_IDS as readonly string[]).includes(a.courseId)) {
    return { allowed: false, message: 'Anda tidak terdaftar di kursus ini.' }
  }
  const subs = submissionsForAssignment(studentUid, a.uid)
  const latest = subs[0]
  if (latest?.reviewStatus === 'pending_review') {
    return { allowed: false, message: 'Menunggu review kiriman sebelumnya.' }
  }
  const eff = getEffectiveAssignmentStatus(a, now)
  if (eff === 'closed') {
    const allowResubmitClosed = latest?.reviewStatus === 'returned' && a.allowResubmit
    if (!allowResubmitClosed) {
      return { allowed: false, message: 'Tugas sudah ditutup.' }
    }
  }
  if (!a.allowResubmit && subs.length >= 1) {
    return { allowed: false, message: 'Tugas ini tidak mengizinkan pengiriman ulang.' }
  }
  if (a.allowResubmit && a.maxAttempts != null && subs.length >= a.maxAttempts) {
    return { allowed: false, message: `Sudah mencapai maksimum ${a.maxAttempts} percobaan.` }
  }
  return { allowed: true }
}

export function submitStudentAssignment(input: {
  assignmentUid: string
  studentUid: string
  studentName: string
  studentAvatar: string
  contentBlocks: SubmissionContentBlock[]
}): SubmitStudentAssignmentResult {
  const gate = getAssignmentSubmitState(input.studentUid, input.assignmentUid)
  if (!gate.allowed) return { ok: false, message: gate.message }

  const a = findAssignmentByUid(input.assignmentUid)
  if (!a) return { ok: false, message: 'Tugas tidak ditemukan.' }
  const now = new Date()
  const subs = submissionsForAssignment(input.studentUid, a.uid)
  const nextAttempt = subs.length ? Math.max(...subs.map((s) => s.attemptNumber)) + 1 : 1

  const uid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`

  const row: IMentorAssignmentSubmission = {
    uid,
    assignmentUid: a.uid,
    courseId: a.courseId,
    studentUid: input.studentUid,
    studentName: input.studentName,
    studentAvatar: input.studentAvatar,
    submittedAt: now.toISOString(),
    attemptNumber: nextAttempt,
    contentBlocks: input.contentBlocks,
    reviewStatus: 'pending_review',
    rating: null,
    mentorComment: null,
    reviewedAt: null,
  }

  pushExtraSubmission(row)
  return { ok: true, submission: row }
}
