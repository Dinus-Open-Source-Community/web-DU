import type { CourseAssignmentBulkItem } from '@/lib/course-detail/assignment-overview-types'
import type { CourseAssignmentBulkApiRaw, CourseAssignmentsListApiRaw } from '@/lib/course-detail/course-assignments-api-types'
import type { LessonAssignmentTaskType } from '@/lib/types/common/domain'
import type { ILessonDetailAssignment } from '@/lib/types/lesson'

function normalizeTaskType(value: string | undefined): LessonAssignmentTaskType {
  return value === 'quiz' ? 'quiz' : 'text'
}

export function mapCourseAssignmentBulkItem(raw: CourseAssignmentBulkApiRaw): CourseAssignmentBulkItem | null {
  const lessonUid = String(raw.lesson_uid ?? '')
  const uid = String(raw.uid ?? '')

  if (!lessonUid || !uid) return null

  return {
    uid,
    lessonUid,
    lessonTitle: String(raw.lesson_title ?? 'Lesson'),
    lessonOrderIndex: typeof raw.lesson_order_index === 'number' ? raw.lesson_order_index : 0,
    moduleTitle: String(raw.module_title ?? 'Modul'),
    moduleOrderIndex: typeof raw.module_order_index === 'number' ? raw.module_order_index : 0,
    title: String(raw.title ?? 'Tugas'),
    taskType: normalizeTaskType(raw.task_type),
    submissionCount: typeof raw.submission_count === 'number' ? raw.submission_count : 0,
  }
}

export function mapCourseAssignmentBulkList(raw: CourseAssignmentsListApiRaw): CourseAssignmentBulkItem[] {
  if (!Array.isArray(raw.assignments)) return []

  return raw.assignments
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
