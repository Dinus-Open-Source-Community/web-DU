import { getEffectiveAssignmentStatus, type StudentAssignmentRow } from './assignment-row-model'

export function canOpenStudentAssignment(row: StudentAssignmentRow, now: Date): boolean {
  if (row.rowKind === 'pending_review') return false

  const isPastDeadline = (() => {
    const deadline = new Date(row.assignment.deadlineAt).getTime()
    return Number.isFinite(deadline) && deadline < now.getTime()
  })()
  if (isPastDeadline && row.rowKind === 'not_submitted') return false

  const effective = getEffectiveAssignmentStatus(row.assignment, now)
  if (effective === 'closed') {
    if (row.rowKind === 'graded') return true
    if (row.rowKind === 'returned' && row.assignment.allowResubmit) return true
    return false
  }

  return true
}

export function getStudentAssignmentAccessDeniedReason(row: StudentAssignmentRow, now: Date): string {
  if (row.rowKind === 'pending_review') {
    return 'Kiriman Anda sedang ditinjau mentor. Halaman pengumpulan tidak dapat dibuka untuk sementara.'
  }

  const isPastDeadline = (() => {
    const deadline = new Date(row.assignment.deadlineAt).getTime()
    return Number.isFinite(deadline) && deadline < now.getTime()
  })()
  if (isPastDeadline && row.rowKind === 'not_submitted') {
    return 'Tenggat sudah lewat dan Anda belum mengumpulkan. Akses halaman tugas dinonaktifkan.'
  }

  if (getEffectiveAssignmentStatus(row.assignment, now) === 'closed') {
    return 'Tugas sudah ditutup.'
  }

  return 'Halaman tugas tidak tersedia untuk status ini.'
}
