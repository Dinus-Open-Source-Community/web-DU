import type { LessonAssignmentTaskType } from '../common/domain'
import type { SubmissionContentBlock, IMentorCourseStudent } from '../data/course'
import type { ILessonDetailAssignment } from '../data/lesson'

export type CourseAssignmentTaskFilter = 'quiz' | 'text'

export type AssignmentRosterStatusFilter = 'all' | 'submitted' | 'not_submitted'

export interface IAssignmentParticipantAvatar {
  uid: string
  name: string
  avatar_url: string
  hasSubmitted: boolean
}

export type AssignmentSubmissionStatus = 'submitted' | 'not_submitted'

export interface ICourseAssignmentRosterRow {
  student: IMentorCourseStudent
  submission: ICourseStaffSubmission | null
  status: AssignmentSubmissionStatus
}

export type CourseStaffGradingStatus = 'pending' | 'graded'

export type AttendanceStatusValue = 'present' | 'late' | 'absent' | 'excused'

export interface ICourseStaffSubmissionStudent {
  uid: string
  name: string
  avatar_url: string
}

export interface ICourseStaffSubmission {
  uid: string
  lessonUid: string
  lessonTitle: string
  moduleTitle: string
  assignmentUid: string
  assignmentTitle: string
  taskType: LessonAssignmentTaskType
  student: ICourseStaffSubmissionStudent
  submittedAt: string
  attemptCount: number
  scorePercent: number | null
  passed: boolean | null
  feedback: string | null
  gradedAt: string | null
  gradedByUid: string | null
  isAutoGraded: boolean
  quizCorrectCount: number | null
  quizQuestionCount: number | null
  contentBlocks: SubmissionContentBlock[]
  gradingStatus: CourseStaffGradingStatus
}

export interface ICourseLessonAssignmentBundle {
  lessonUid: string
  lessonTitle: string
  moduleTitle: string
  moduleUid: string
  orderIndex: number
  assignment: ILessonDetailAssignment | null
  submissions: ICourseStaffSubmission[]
}

export interface IGradeStaffSubmissionPayload {
  score_percent: number
  feedback?: string
  passed?: boolean
}

export interface ILessonAttendanceRecord {
  uid: string
  lesson_uid: string
  enrollment_uid: string
  checked_in_at: string
  status: AttendanceStatusValue
  note: string
  created_at: string
  updated_at: string
}

export interface IUpdateAttendancePayload {
  status: AttendanceStatusValue
  note?: string
}

export interface ICourseDetailLessonRef {
  uid: string
  title: string
  moduleUid: string
  moduleTitle: string
  orderIndex: number
}
