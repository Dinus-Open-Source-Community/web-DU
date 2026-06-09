import type { ICourseAssignmentRosterRow, ICourseStaffSubmission } from '@/lib/types/features/course-detail-assignments'
import type { ILessonDetailAssignment } from '@/lib/types/lesson'

import type { StaffSubmissionGradeDraft } from './staff-submission-grade-presenter'
import type { StaffSubmissionViewer } from './staff-submission-grader-presenter'

export type CourseAssignmentSubmissionDetailPageViewModel = {
  courseUid: string
  courseTitle: string
  lessonUid: string
  lessonTitle: string
  moduleTitle: string
  assignment: ILessonDetailAssignment | null
  submission: ICourseStaffSubmission | null
  staffViewer: StaffSubmissionViewer | null
  activeSubmissionUid: string | null
  sidebarRows: ICourseAssignmentRosterRow[]
  sidebarSearchQuery: string
  onSidebarSearchQueryChange: (query: string) => void
  buildSubmissionDetailHref: (submissionUid: string) => string
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  backHref: string
  onSubmitScore: (draft: StaffSubmissionGradeDraft) => Promise<void>
  onSubmitFeedback: (feedback: string) => Promise<void>
  isSavingScore: boolean
  isSavingFeedback: boolean
}
