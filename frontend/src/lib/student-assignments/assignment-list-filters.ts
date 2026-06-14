import type { StudentAssignmentFeedCategory } from '@/lib/types/student-assignments'

import type { StudentAssignmentRow } from './assignment-row-model'

export type StudentAssignmentListStats = {
  total: number
  todo: number
  review: number
  urgent: number
}

export function scopeStudentAssignmentRowsByCourse(
  rows: StudentAssignmentRow[],
  courseUidFilter?: string | null,
): StudentAssignmentRow[] {
  if (!courseUidFilter) return rows
  return rows.filter((row) => row.assignment.courseId === courseUidFilter)
}

export function filterStudentAssignmentRowsByCategory(
  rows: StudentAssignmentRow[],
  category: StudentAssignmentFeedCategory,
): StudentAssignmentRow[] {
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

export function filterStudentAssignmentRowsBySearch(
  rows: StudentAssignmentRow[],
  searchQuery: string,
): StudentAssignmentRow[] {
  const query = searchQuery.trim().toLowerCase()
  if (!query) return rows

  return rows.filter(
    (row) =>
      row.assignment.title.toLowerCase().includes(query) ||
      row.courseTitle.toLowerCase().includes(query),
  )
}

export function computeStudentAssignmentListStats(rows: StudentAssignmentRow[]): StudentAssignmentListStats {
  return {
    total: rows.length,
    todo: rows.filter((row) => row.rowKind === 'not_submitted' || row.rowKind === 'returned').length,
    review: rows.filter((row) => row.rowKind === 'pending_review').length,
    urgent: rows.filter(
      (row) => row.deadlineUrgency === 'overdue' || row.deadlineUrgency === 'due_soon',
    ).length,
  }
}

export function paginateStudentAssignmentRows<T>(
  rows: T[],
  currentPage: number,
  itemsPerPage: number,
): { paginated: T[]; totalPages: number; safePage: number } {
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = rows.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage)

  return { paginated, totalPages, safePage }
}
