import type { CourseAssignmentBulkItem } from '@/lib/course-detail/assignment-overview-types'
import type { LessonAssignmentTaskType } from '@/lib/types/common/domain'
import type { ILessonDetailAssignment } from '@/lib/types/lesson'

type RawCourseAssignment = {
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

function normalizeTaskType(value: unknown): LessonAssignmentTaskType {
  return value === 'quiz' ? 'quiz' : 'text'
}

export function mapCourseAssignmentBulkItem(raw: unknown): CourseAssignmentBulkItem | null {
  if (!raw || typeof raw !== 'object') return null

  const data = raw as RawCourseAssignment
  const lessonUid = String(data.lesson_uid ?? '')
  const uid = String(data.uid ?? '')

  if (!lessonUid || !uid) return null

  return {
    uid,
    lessonUid,
    lessonTitle: String(data.lesson_title ?? 'Lesson'),
    lessonOrderIndex: typeof data.lesson_order_index === 'number' ? data.lesson_order_index : 0,
    moduleTitle: String(data.module_title ?? 'Modul'),
    moduleOrderIndex: typeof data.module_order_index === 'number' ? data.module_order_index : 0,
    title: String(data.title ?? 'Tugas'),
    taskType: normalizeTaskType(data.task_type),
    submissionCount: typeof data.submission_count === 'number' ? data.submission_count : 0,
  }
}

export function mapCourseAssignmentBulkList(raw: unknown): CourseAssignmentBulkItem[] {
  if (!raw || typeof raw !== 'object') return []

  const data = raw as { assignments?: unknown[] }
  if (!Array.isArray(data.assignments)) return []

  return data.assignments
    .map((item) => mapCourseAssignmentBulkItem(item))
    .filter((item): item is CourseAssignmentBulkItem => item !== null)
    .sort(
      (left, right) =>
        left.moduleOrderIndex - right.moduleOrderIndex ||
        left.lessonOrderIndex - right.lessonOrderIndex,
    )
}

export function toMinimalLessonAssignment(item: CourseAssignmentBulkItem): ILessonDetailAssignment {
  return {
    uid: item.uid,
    lesson_uid: item.lessonUid,
    title: item.title,
    task_type: item.taskType,
    task_description: null,
    quiz_payload: null,
    allow_file_submission: false,
    allow_plain_text_submission: true,
    allow_rich_text_submission: false,
    require_file_description: false,
    instruction_attachments: [],
    deadline_at: '',
    status: 'TERBIT',
    auto_close_after_deadline: false,
    allow_resubmit: false,
    max_resubmit_count: null,
    created_at: '',
    updated_at: '',
  }
}
