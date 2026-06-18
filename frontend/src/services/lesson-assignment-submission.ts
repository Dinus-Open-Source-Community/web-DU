import type { RawStaffSubmission, StaffSubmissionsListApiRaw } from '@/lib/course-detail/staff-submission-mapper'
import type {
  ICourseStaffSubmission,
  IGradeStaffSubmissionPayload,
} from '@/lib/types/features/course-detail-assignments'
import type { ILessonDetailAssignment } from '@/lib/types/lesson'
import type { LessonAssignmentApiRaw } from '@/lib/lesson-assignment/api-types'
import { mapLessonDetailAssignment } from '@/lib/lesson-assignment/assignment-mapper'
import {
  parseGradeStaffSubmissionPayload,
  parseLessonUidParam,
  parseSubmissionUidParam,
} from '@/lib/validator/lesson-assignment'
import {
  mapStaffSubmission,
  mapStaffSubmissionsList,
} from '@/lib/course-detail/staff-submission-mapper'
import { API_ROUTES } from './api-path'
import { api } from './axios'
import { isNotFoundApiError, unwrapApiResponse, withApiErrorHandling } from './api-error'
import type { IResponse } from '@/lib/types/api'

export async function fetchLessonAssignmentSubmissions(
  lessonUid: string,
  context: {
    lessonTitle: string
    moduleTitle: string
    assignment: ILessonDetailAssignment
  },
): Promise<ICourseStaffSubmission[]> {
  return withApiErrorHandling(async () => {
    const validatedLessonUid = parseLessonUidParam(lessonUid)
    try {
      const response = await api.get<IResponse<StaffSubmissionsListApiRaw>>(
        API_ROUTES.lessons.assignment.submissions.getAllByLessonUid(validatedLessonUid),
      )
      const data = unwrapApiResponse(response.data, 'Gagal mengambil kiriman tugas')
      return mapStaffSubmissionsList(data, {
        lessonUid: validatedLessonUid,
        lessonTitle: context.lessonTitle,
        moduleTitle: context.moduleTitle,
        assignment: context.assignment,
      })
    } catch (error) {
      if (error instanceof Error && isNotFoundApiError(error)) return []
      throw error
    }
  }, 'Gagal mengambil kiriman tugas')
}

export async function gradeLessonAssignmentSubmission(
  lessonUid: string,
  submissionUid: string,
  payload: IGradeStaffSubmissionPayload,
  context: {
    lessonTitle: string
    moduleTitle: string
    assignment: ILessonDetailAssignment
  },
): Promise<ICourseStaffSubmission> {
  return withApiErrorHandling(async () => {
    const validatedLessonUid = parseLessonUidParam(lessonUid)
    const validatedSubmissionUid = parseSubmissionUidParam(submissionUid)
    const validatedPayload = parseGradeStaffSubmissionPayload(payload)
    const response = await api.put<IResponse<RawStaffSubmission>>(
      API_ROUTES.lessons.assignment.submissions.gradeByUid(
        validatedLessonUid,
        validatedSubmissionUid,
      ),
      validatedPayload,
    )
    const data = unwrapApiResponse(response.data, 'Gagal menyimpan penilaian')
    const mapped = mapStaffSubmission(data, {
      lessonUid: validatedLessonUid,
      lessonTitle: context.lessonTitle,
      moduleTitle: context.moduleTitle,
      assignment: context.assignment,
    })
    if (!mapped) {
      throw new Error('Respons penilaian tidak valid')
    }
    return mapped
  }, 'Gagal menyimpan penilaian')
}

export function mapAssignmentFromResponse(raw: LessonAssignmentApiRaw): ILessonDetailAssignment | null {
  return mapLessonDetailAssignment(raw)
}
