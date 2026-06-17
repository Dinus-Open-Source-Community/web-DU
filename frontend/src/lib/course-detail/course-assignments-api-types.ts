import type { IPaginationMeta } from '@/lib/types/common/pagination'

export type CourseAssignmentBulkApiRaw = {
  uid?: string
  lesson_uid?: string
  lesson_title?: string
  lesson_order_index?: number
  module_title?: string
  module_order_index?: number
  title?: string
  task_type?: string
  submission_count?: number
}

export type CourseAssignmentsListApiRaw = {
  assignments?: CourseAssignmentBulkApiRaw[]
  meta?: Partial<IPaginationMeta>
}
