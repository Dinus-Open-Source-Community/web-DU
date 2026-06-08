import type { IMentorAssignmentSubmission, IMentorCourseAssignment } from '../data/course'

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

/** Alias backward-compat. */
export type StudentAssignmentSectionItem = IStudentAssignmentSectionItem
