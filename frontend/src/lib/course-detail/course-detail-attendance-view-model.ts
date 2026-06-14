import type { IMentorCourseStudent } from '@/lib/types/course'
import type {
  ICourseDetailLessonRef,
  ILessonAttendanceRecord,
} from '@/lib/types/features/course-detail-assignments'

export type CourseDetailAttendanceViewModel = {
  lessons: ICourseDetailLessonRef[]
  students: IMentorCourseStudent[]
  selectedLessonUid: string
  onLessonChange: (lessonUid: string) => void
  attendances: ILessonAttendanceRecord[]
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  onUpdateAttendance: (
    attendanceUid: string,
    status: ILessonAttendanceRecord['status'],
    note?: string,
  ) => Promise<void>
  onDeleteAttendance: (attendanceUid: string) => Promise<void>
  isMutating: boolean
}
