import { buildAssignmentSubmissionsHref, type StaffAssignmentRole } from '@/lib/course-detail/course-assignment-navigation'
import type {
  ICourseLessonAssignmentBundle,
  IAssignmentParticipantAvatar,
} from '@/lib/types/features/course-detail-assignments'
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

export function toAssignmentOverviewItems(
  bundles: ICourseLessonAssignmentBundle[],
  role: StaffAssignmentRole,
  courseUid: string,
  students: IMentorCourseStudent[],
): CourseAssignmentOverviewItem[] {
  return bundles
    .filter((bundle) => bundle.assignment !== null)
    .map((bundle) => {
      const submissions = bundle.submissions
      const submittedStudentUids = new Set(
        submissions.map((item) => item.student.uid).filter(Boolean),
      )
      const participants = buildAssignmentParticipants(students, submittedStudentUids)

      return {
        lessonUid: bundle.lessonUid,
        lessonTitle: bundle.lessonTitle,
        moduleTitle: bundle.moduleTitle,
        assignmentTitle: bundle.assignment?.title ?? 'Tugas',
        taskType: bundle.assignment?.task_type ?? 'text',
        submissionCount: submissions.length,
        totalStudents: students.length,
        pendingGradingCount: submissions.filter(
          (item) => item.taskType === 'text' && item.gradingStatus === 'pending',
        ).length,
        participants,
        submissionsHref: buildAssignmentSubmissionsHref(role, courseUid, bundle.lessonUid),
      }
    })
    .sort((a, b) => a.moduleTitle.localeCompare(b.moduleTitle) || a.lessonTitle.localeCompare(b.lessonTitle))
}
