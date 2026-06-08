import type { AssignmentTaskType } from '../common/domain'

export interface IJoinedCourseAssignmentRef {
  uid: string
  title: string
  status: string
  task_type: AssignmentTaskType | string
  deadline_at: string
}

export interface IJoinedCourseLessonRef {
  uid: string
  title: string
  order_index: number
}

export interface IJoinedCourseModuleRef {
  uid: string
  title: string
  order_index: number
}

export interface IJoinedCourseAssignmentEntry {
  submission_uid: string
  attempt_count: number
  score_percent: number | null
  passed: boolean | null
  is_auto_graded: boolean
  submitted_at: string
  graded_at: string | null
  assignment: IJoinedCourseAssignmentRef
  lesson: IJoinedCourseLessonRef
  module: IJoinedCourseModuleRef
}

/** Alias backward-compat. */
export type JoinedCourseAssignmentRef = IJoinedCourseAssignmentRef
export type JoinedCourseLessonRef = IJoinedCourseLessonRef
export type JoinedCourseModuleRef = IJoinedCourseModuleRef
export type JoinedCourseAssignmentEntry = IJoinedCourseAssignmentEntry
