import { buildAssignmentSubmissionsHref, type StaffAssignmentRole } from '@/lib/course-detail/course-assignment-navigation'
import type { CourseAssignmentOverviewSource } from '@/lib/course-detail/assignment-overview-types'
import type { IAssignmentParticipantAvatar } from '@/lib/types/features/course-detail-assignments'
import type { LessonAssignmentTaskType } from '@/lib/types/common/domain'
import type { IMentorCourseStudent } from '@/lib/types/course'

export type CourseAssignmentOverviewItem = {
  lessonUid: string
  lessonTitle: string
  moduleTitle: string
  assignmentTitle: string
  taskType: LessonAssignmentTaskType
  submissionCount: number
  totalStudents: number
  pendingGradingCount: number
  participants: IAssignmentParticipantAvatar[]
  isParticipantsLoading: boolean
  submissionsHref: string
}

export function buildAssignmentParticipants(
  students: IMentorCourseStudent[],
  submittedStudentUids: Set<string>,
): IAssignmentParticipantAvatar[] {
  return students
    .map((student) => ({
      uid: student.student_uid,
      name: student.student_name,
      avatar_url: student.student_avatar_url,
      hasSubmitted: submittedStudentUids.has(student.student_uid),
    }))
    .sort((left, right) => left.name.localeCompare(right.name, 'id'))
}

function countPendingGrading(
  source: CourseAssignmentOverviewSource,
): number {
  if (source.taskType !== 'text') return 0

  return source.submissions.filter((submission) => submission.gradedAt === null).length
}

export function toAssignmentOverviewItems(
  sources: readonly CourseAssignmentOverviewSource[],
  role: StaffAssignmentRole,
  courseUid: string,
  students: IMentorCourseStudent[],
): CourseAssignmentOverviewItem[] {
  return sources.map((source) => {
    const submittedStudentUids = new Set(
      source.submissions.map((submission) => submission.studentUid).filter(Boolean),
    )
    const participants = buildAssignmentParticipants(students, submittedStudentUids)
    const submissionCount = source.isSubmissionsLoading
      ? source.submissionCount
      : source.submissionCount > 0
        ? source.submissions.length
        : 0

    return {
      lessonUid: source.lessonUid,
      lessonTitle: source.lessonTitle,
      moduleTitle: source.moduleTitle,
      assignmentTitle: source.assignmentTitle,
      taskType: source.taskType,
      submissionCount,
      totalStudents: students.length,
      pendingGradingCount: countPendingGrading(source),
      participants,
      isParticipantsLoading: source.isSubmissionsLoading,
      submissionsHref: buildAssignmentSubmissionsHref(role, courseUid, source.lessonUid),
    }
  })
}
