import type { StudentAssignmentSectionItem } from '@/lib/types/student-assignments'
import type {
  IMentorAssignmentSubmission,
  IMentorCourseAssignment,
  MentorAssignmentLifecycleStatus,
  MentorAssignmentTaskType,
  MentorSubmissionReviewStatus,
} from '@/lib/types/course'
import type { JoinedCourseAssignmentEntry } from '@/lib/types/user-assignments'
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

function resolveReviewStatus(entry: JoinedCourseAssignmentEntry): MentorSubmissionReviewStatus {
  if (!entry.graded_at) return 'pending_review'
  return 'graded'
}

function mapSubmission(
  entry: JoinedCourseAssignmentEntry,
  courseUid: string,
  student: Pick<IUserData, 'uid' | 'name' | 'avatar_url'>,
): IMentorAssignmentSubmission {
  return {
    uid: entry.submission_uid,
    assignmentUid: entry.assignment.uid,
    courseId: courseUid,
    studentUid: student.uid,
    studentName: student.name,
    studentAvatar: student.avatar_url,
    submittedAt: entry.submitted_at,
    attemptNumber: entry.attempt_count,
    contentBlocks: [],
    reviewStatus: resolveReviewStatus(entry),
    rating: typeof entry.score_percent === 'number' ? Math.round(entry.score_percent) : null,
    mentorComment: null,
    reviewedAt: entry.graded_at,
  }
}

function mapAssignment(entry: JoinedCourseAssignmentEntry, courseUid: string): IMentorCourseAssignment {
  const { assignment, lesson, module } = entry

  return {
    uid: assignment.uid,
    courseId: courseUid,
    meetingNumber: lesson.order_index + 1,
    title: assignment.title,
    taskType: normalizeTaskType(assignment.task_type),
    description: `Tugas pada pelajaran "${lesson.title}" di modul "${module.title}".`,
    deadlineAt: assignment.deadline_at,
    status: normalizeAssignmentStatus(assignment.status),
    autoCloseAfterDeadline: true,
    allowResubmit: false,
    submissionConfig: {
      allowFile: true,
      allowPlainText: true,
      allowRichText: true,
      requireFileDescription: false,
    },
  }
}

function mapCourseAssignmentEntry(
  entry: JoinedCourseAssignmentEntry,
  courseTitle: string,
  courseUid: string,
  student: Pick<IUserData, 'uid' | 'name' | 'avatar_url'>,
): StudentAssignmentSectionItem {
  return {
    courseTitle,
    lessonUid: entry.lesson.uid,
    lessonTitle: entry.lesson.title,
    moduleTitle: entry.module.title,
    assignment: mapAssignment(entry, courseUid),
    latestSubmission: mapSubmission(entry, courseUid, student),
  }
}

export function mapJoinedCourseAssignments(profile: IUserData | null | undefined): StudentAssignmentSectionItem[] {
  if (!profile) return []

  const student = {
    uid: profile.uid,
    name: profile.name,
    avatar_url: profile.avatar_url,
  }

  return (profile.joined_courses ?? []).flatMap((course) => {
    const assignments = (course.assignments ?? []) as JoinedCourseAssignmentEntry[]

    return assignments.map((entry) => mapCourseAssignmentEntry(entry, course.title, course.uid, student))
  })
}
