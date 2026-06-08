import type { DateRange } from 'react-day-picker'

import type { SubmissionFilterStatus } from '@/lib/func/fungsi'
import type {
  ICourseDetailItem,
  IMentorAssignmentStats,
  IMentorAssignmentSubmission,
  IMentorCourseAssignment,
} from '@/lib/types/course'

export type MentorCourseAssignmentsViewModel = {
  now: Date
  meetingMax: number
  courseData: ICourseDetailItem
  assignmentData: IMentorCourseAssignment[]
  stats: IMentorAssignmentStats
  filteredSubmissions: IMentorAssignmentSubmission[]
  assignmentTitleMap: Map<string, string>
  assignmentUid: string | 'all'
  onAssignmentUidChange: (assignmentUid: string | 'all') => void
  submissionStatus: SubmissionFilterStatus
  onSubmissionStatusChange: (status: SubmissionFilterStatus) => void
  submissionDateRange: DateRange | undefined
  onSubmissionDateRangeChange: (range: DateRange | undefined) => void
  reviewOpen: boolean
  onReviewOpenChange: (open: boolean) => void
  activeSubmission: IMentorAssignmentSubmission | null
  onOpenReview: (submission: IMentorAssignmentSubmission) => void
  assignmentFormOpen: boolean
  onAssignmentFormOpenChange: (open: boolean) => void
  assignmentFormMode: 'create' | 'edit'
  editingAssignment: IMentorCourseAssignment | null
  onOpenCreateForm: () => void
  onOpenEditForm: (assignment: IMentorCourseAssignment) => void
  onDeleteAssignment: (assignment: IMentorCourseAssignment) => void
  onReviewSaved: () => void
  onAssignmentSaved: () => void
}