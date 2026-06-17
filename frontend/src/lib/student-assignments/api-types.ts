import type { IPaginationMeta } from '@/lib/types/common/pagination'
import type { IStudentMyAssignmentLatestSubmission } from '@/lib/types/student-assignments'

export type StudentMyAssignmentApiRaw = {
  uid?: string
  course_uid?: string
  lesson_uid?: string
  lesson_title?: string
  lesson_order_index?: number
  module_title?: string
  module_order_index?: number
  meeting_number?: number
  title?: string
  task_type?: string
  deadline_at?: string
  status?: string
  auto_close_after_deadline?: boolean
  allow_resubmit?: boolean
  max_resubmit_count?: number | null
  allow_file_submission?: boolean
  allow_plain_text_submission?: boolean
  allow_rich_text_submission?: boolean
  require_file_description?: boolean
}

export type StudentMyAssignmentListItemApiRaw = {
  course_uid: string
  course_title: string
  assignment: StudentMyAssignmentApiRaw
  latest_submission: IStudentMyAssignmentLatestSubmission | null
}

export type StudentMyAssignmentsListApiRaw = {
  assignments?: StudentMyAssignmentListItemApiRaw[]
  meta?: Partial<IPaginationMeta>
}
