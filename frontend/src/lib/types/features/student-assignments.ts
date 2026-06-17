import type { IMentorAssignmentSubmission, IMentorCourseAssignment } from '../data/course'
import type { IPaginationMeta } from '../common/pagination'

import type { StudentMyAssignmentApiRaw } from '@/lib/student-assignments/api-types'

export type StudentAssignmentFeedCategory = 'all' | 'todo' | 'pending_review' | 'done' | 'late'
export type StudentAssignmentRowKind = 'not_submitted' | 'pending_review' | 'graded' | 'returned'

export interface IStudentAssignmentSectionItem {
  assignment: IMentorCourseAssignment
  courseTitle: string
  lessonUid?: string
  lessonTitle?: string
  moduleTitle?: string
  latestSubmission?: IMentorAssignmentSubmission | null
}

export interface IStudentMyAssignmentLatestSubmission {
  uid: string
  attempt_count: number
  score_percent: number | null
  passed: boolean | null
  is_auto_graded: boolean
  submitted_at: string
  graded_at: string | null
}

export interface IStudentMyAssignmentListItem {
  course_uid: string
  course_title: string
  assignment: StudentMyAssignmentApiRaw
  latest_submission: IStudentMyAssignmentLatestSubmission | null
}

export interface IStudentMyAssignmentsResponse {
  assignments: IStudentMyAssignmentListItem[]
  meta: IPaginationMeta
}

/** Alias backward-compat. */
export type StudentAssignmentSectionItem = IStudentAssignmentSectionItem
export type StudentMyAssignmentLatestSubmission = IStudentMyAssignmentLatestSubmission
export type StudentMyAssignmentsResponse = IStudentMyAssignmentsResponse
