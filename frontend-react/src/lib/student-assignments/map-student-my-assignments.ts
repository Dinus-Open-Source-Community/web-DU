import type {
  IMentorAssignmentSubmission,
  IMentorCourseAssignment,
  MentorAssignmentLifecycleStatus,
  MentorAssignmentTaskType,
  MentorSubmissionReviewStatus,
} from '@/lib/types/course'
import type {
  IStudentMyAssignmentLatestSubmission,
  IStudentMyAssignmentListItem,
  IStudentMyAssignmentsResponse,
  StudentAssignmentSectionItem,
} from '@/lib/types/student-assignments'
import type { IUserData } from '@/lib/types/user'

function normalizeAssignmentStatus(status: string): MentorAssignmentLifecycleStatus {
  const value = status.trim().toUpperCase()

  if (value === 'DRAFT') return 'draft'
  if (value === 'TERBIT' || value === 'PUBLISHED') return 'published'
  if (value === 'DITUTUP' || value === 'CLOSED') return 'closed'

  return 'draft'
}

function normalizeTaskType(taskType: string): MentorAssignmentTaskType {
  return taskType === 'quiz' ? 'quiz' : 'text'
}

function resolveMaxAttempts(assignment: Record<string, unknown>): number | undefined {
  const allowResubmit = Boolean(assignment.allow_resubmit)
  if (!allowResubmit) return 1

  const maxResubmitCount =
    typeof assignment.max_resubmit_count === 'number' ? assignment.max_resubmit_count : null

  if (maxResubmitCount == null || maxResubmitCount < 1) return 1
  return 1 + maxResubmitCount
}

function mapAssignment(
  raw: Record<string, unknown>,
  courseUid: string,
): IMentorCourseAssignment {
  const lessonTitle = String(raw.lesson_title ?? 'Pelajaran')
  const moduleTitle = String(raw.module_title ?? 'Modul')
  const lessonOrderIndex =
    typeof raw.lesson_order_index === 'number' ? raw.lesson_order_index : 0

  return {
    uid: String(raw.uid ?? ''),
    courseId: String(raw.course_uid ?? courseUid),
    meetingNumber:
      typeof raw.meeting_number === 'number' ? raw.meeting_number : lessonOrderIndex + 1,
    title: String(raw.title ?? 'Tugas'),
    taskType: normalizeTaskType(String(raw.task_type ?? 'text')),
    description: `Tugas pada pelajaran "${lessonTitle}" di modul "${moduleTitle}".`,
    deadlineAt: String(raw.deadline_at ?? ''),
    status: normalizeAssignmentStatus(String(raw.status ?? 'TERBIT')),
    autoCloseAfterDeadline: Boolean(raw.auto_close_after_deadline),
    allowResubmit: Boolean(raw.allow_resubmit),
    maxAttempts: resolveMaxAttempts(raw),
    submissionConfig: {
      allowFile: Boolean(raw.allow_file_submission),
      allowPlainText: Boolean(raw.allow_plain_text_submission),
      allowRichText: Boolean(raw.allow_rich_text_submission),
      requireFileDescription: Boolean(raw.require_file_description),
    },
  }
}

function resolveReviewStatus(
  submission: IStudentMyAssignmentLatestSubmission,
): MentorSubmissionReviewStatus {
  if (!submission.graded_at) return 'pending_review'
  return 'graded'
}

function mapLatestSubmission(
  submission: IStudentMyAssignmentLatestSubmission,
  assignmentUid: string,
  courseUid: string,
  student: Pick<IUserData, 'uid' | 'name' | 'avatar_url'>,
): IMentorAssignmentSubmission {
  return {
    uid: submission.uid,
    assignmentUid,
    courseId: courseUid,
    studentUid: student.uid,
    studentName: student.name,
    studentAvatar: student.avatar_url,
    submittedAt: submission.submitted_at,
    attemptNumber: submission.attempt_count,
    contentBlocks: [],
    reviewStatus: resolveReviewStatus(submission),
    rating:
      typeof submission.score_percent === 'number' ? Math.round(submission.score_percent) : null,
    mentorComment: null,
    reviewedAt: submission.graded_at,
  }
}

function mapListItem(
  item: IStudentMyAssignmentListItem,
  student: Pick<IUserData, 'uid' | 'name' | 'avatar_url'>,
): StudentAssignmentSectionItem | null {
  const assignmentRaw = item.assignment
  if (!assignmentRaw || typeof assignmentRaw !== 'object') return null

  const assignment = mapAssignment(assignmentRaw as Record<string, unknown>, item.course_uid)
  if (!assignment.uid) return null

  const lessonUid = String((assignmentRaw as Record<string, unknown>).lesson_uid ?? '')

  return {
    courseTitle: item.course_title,
    lessonUid,
    lessonTitle: String((assignmentRaw as Record<string, unknown>).lesson_title ?? ''),
    moduleTitle: String((assignmentRaw as Record<string, unknown>).module_title ?? ''),
    assignment,
    latestSubmission: item.latest_submission
      ? mapLatestSubmission(item.latest_submission, assignment.uid, item.course_uid, student)
      : null,
  }
}

export function mapStudentMyAssignmentsResponse(
  raw: unknown,
  student: Pick<IUserData, 'uid' | 'name' | 'avatar_url'>,
): StudentAssignmentSectionItem[] {
  if (!raw || typeof raw !== 'object') return []

  const data = raw as IStudentMyAssignmentsResponse
  if (!Array.isArray(data.assignments)) return []

  return data.assignments
    .map((item) => mapListItem(item, student))
    .filter((item): item is StudentAssignmentSectionItem => item !== null)
}
