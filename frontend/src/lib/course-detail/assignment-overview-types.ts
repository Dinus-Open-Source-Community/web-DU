import type { LessonAssignmentTaskType } from '@/lib/types/common/domain'

export type AssignmentSubmissionSummary = {
  readonly studentUid: string
  readonly gradedAt: string | null
}

export type CourseAssignmentBulkItem = {
  readonly uid: string
  readonly lessonUid: string
  readonly lessonTitle: string
  readonly lessonOrderIndex: number
  readonly moduleTitle: string
  readonly moduleOrderIndex: number
  readonly title: string
  readonly taskType: LessonAssignmentTaskType
  readonly submissionCount: number
}

export type CourseAssignmentOverviewSource = {
  readonly lessonUid: string
  readonly lessonTitle: string
  readonly moduleTitle: string
  readonly moduleOrderIndex: number
  readonly lessonOrderIndex: number
  readonly assignmentUid: string
  readonly assignmentTitle: string
  readonly taskType: LessonAssignmentTaskType
  readonly submissionCount: number
  readonly submissions: readonly AssignmentSubmissionSummary[]
  readonly isSubmissionsLoading: boolean
}
