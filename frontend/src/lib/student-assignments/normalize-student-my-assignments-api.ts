import type {
  IStudentMyAssignmentLatestSubmission,
  IStudentMyAssignmentListItem,
  IStudentMyAssignmentsResponse,
} from '@/lib/types/student-assignments'
import type {
  StudentMyAssignmentApiRaw,
  StudentMyAssignmentListItemApiRaw,
  StudentMyAssignmentsListApiRaw,
} from '@/lib/student-assignments/api-types'
import type { IPaginationMeta } from '@/lib/types/common/pagination'

function coerceRecordId(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return String(value).trim()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mapPaginationMeta(raw: Partial<IPaginationMeta> | undefined): IStudentMyAssignmentsResponse['meta'] {
  return {
    total: raw?.total ?? 0,
    per_page: raw?.per_page ?? 20,
    current_page: raw?.current_page ?? 1,
    total_pages: raw?.total_pages ?? 0,
  }
}

function normalizeLatestSubmission(
  value: unknown,
): IStudentMyAssignmentLatestSubmission | null {
  if (!isRecord(value)) return null

  const uid = coerceRecordId(value.uid)
  if (!uid) return null

  return {
    uid,
    attempt_count: typeof value.attempt_count === 'number' ? value.attempt_count : 0,
    score_percent:
      typeof value.score_percent === 'number' ? value.score_percent : null,
    passed: typeof value.passed === 'boolean' ? value.passed : null,
    is_auto_graded: Boolean(value.is_auto_graded),
    submitted_at: String(value.submitted_at ?? ''),
    graded_at: value.graded_at ? String(value.graded_at) : null,
  }
}

function normalizeAssignmentRaw(
  raw: Record<string, unknown>,
  fallbackCourseUid: string,
): StudentMyAssignmentApiRaw {
  return {
    uid: coerceRecordId(raw.uid ?? raw.assignment_uid),
    course_uid: coerceRecordId(raw.course_uid ?? fallbackCourseUid),
    lesson_uid: coerceRecordId(raw.lesson_uid),
    lesson_title: raw.lesson_title != null ? String(raw.lesson_title) : undefined,
    lesson_order_index:
      typeof raw.lesson_order_index === 'number' ? raw.lesson_order_index : undefined,
    module_title: raw.module_title != null ? String(raw.module_title) : undefined,
    module_order_index:
      typeof raw.module_order_index === 'number' ? raw.module_order_index : undefined,
    meeting_number:
      typeof raw.meeting_number === 'number' ? raw.meeting_number : undefined,
    title: raw.title != null ? String(raw.title) : undefined,
    task_type: raw.task_type != null ? String(raw.task_type) : undefined,
    deadline_at: raw.deadline_at != null ? String(raw.deadline_at) : undefined,
    status: raw.status != null ? String(raw.status) : undefined,
    auto_close_after_deadline:
      typeof raw.auto_close_after_deadline === 'boolean'
        ? raw.auto_close_after_deadline
        : undefined,
    allow_resubmit:
      typeof raw.allow_resubmit === 'boolean' ? raw.allow_resubmit : undefined,
    max_resubmit_count:
      typeof raw.max_resubmit_count === 'number' ? raw.max_resubmit_count : null,
    allow_file_submission:
      typeof raw.allow_file_submission === 'boolean'
        ? raw.allow_file_submission
        : undefined,
    allow_plain_text_submission:
      typeof raw.allow_plain_text_submission === 'boolean'
        ? raw.allow_plain_text_submission
        : undefined,
    allow_rich_text_submission:
      typeof raw.allow_rich_text_submission === 'boolean'
        ? raw.allow_rich_text_submission
        : undefined,
    require_file_description:
      typeof raw.require_file_description === 'boolean'
        ? raw.require_file_description
        : undefined,
  }
}

function normalizeListItem(raw: unknown): IStudentMyAssignmentListItem | null {
  if (!isRecord(raw)) return null

  const course_uid = coerceRecordId(raw.course_uid)
  const course_title = String(raw.course_title ?? '')
  const latest_submission = normalizeLatestSubmission(raw.latest_submission)

  const nestedAssignment = raw.assignment
  if (isRecord(nestedAssignment)) {
    const assignment = normalizeAssignmentRaw(nestedAssignment, course_uid)
    if (!assignment.uid) return null

    return {
      course_uid,
      course_title,
      assignment,
      latest_submission,
    }
  }

  const assignmentUid = coerceRecordId(raw.uid ?? raw.assignment_uid)
  if (!assignmentUid) return null

  const assignment = normalizeAssignmentRaw(raw, course_uid)
  assignment.uid = assignmentUid

  return {
    course_uid,
    course_title,
    assignment,
    latest_submission,
  }
}

function extractAssignmentListItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload

  if (!isRecord(payload)) return []

  if (Array.isArray(payload.assignments)) return payload.assignments

  if (isRecord(payload.data)) {
    if (Array.isArray(payload.data.assignments)) return payload.data.assignments
    if (Array.isArray(payload.data)) return payload.data
  }

  return []
}

export function normalizeStudentMyAssignmentsApiPayload(
  payload: unknown,
): IStudentMyAssignmentsResponse {
  const record = isRecord(payload) ? payload : {}
  const metaSource = isRecord(record.meta)
    ? record.meta
    : isRecord(record.data) && isRecord(record.data.meta)
      ? record.data.meta
      : undefined

  const assignments = extractAssignmentListItems(payload)
    .map((item) => normalizeListItem(item))
    .filter((item): item is IStudentMyAssignmentListItem => item !== null)

  return {
    assignments,
    meta: mapPaginationMeta(metaSource as Partial<IPaginationMeta> | undefined),
  }
}

export function normalizeStudentMyAssignmentsListApiRaw(
  raw: StudentMyAssignmentsListApiRaw | unknown,
): IStudentMyAssignmentsResponse {
  return normalizeStudentMyAssignmentsApiPayload(raw)
}

export type { StudentMyAssignmentListItemApiRaw }
