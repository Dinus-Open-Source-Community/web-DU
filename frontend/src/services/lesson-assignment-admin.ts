import type { LessonAssignmentApiRaw } from '@/lib/lesson-assignment/api-types'
import type { LessonDetailAssignment } from '@/lib/types/lesson'
import type { LessonAssignmentUpsertPayload } from '@/lib/course-edit/homework-rules'
import { mapLessonDetailAssignment } from '@/lib/lesson-assignment/assignment-mapper'
import {
  parseLessonAssignmentUpsertRequest,
  parseLessonUidParam,
} from '@/lib/validator/lesson-assignment'
import { API_ROUTES } from './api-path'
import { api } from './axios'
import { isNotFoundApiError, unwrapApiResponse, withApiErrorHandling } from './api-error'
import type { IResponse } from '@/lib/types/api'

function mapAssignmentResponse(raw: LessonAssignmentApiRaw): LessonDetailAssignment {
  const mapped = mapLessonDetailAssignment(raw)
  if (!mapped) {
    throw new Error('Respons assignment tidak valid')
  }
  return mapped
}

export async function fetchLessonAssignment(
  lessonUid: string,
): Promise<LessonDetailAssignment | null> {
  return withApiErrorHandling(async () => {
    const validatedLessonUid = parseLessonUidParam(lessonUid)
    try {
      const response = await api.get<IResponse<LessonAssignmentApiRaw>>(
        API_ROUTES.lessons.assignment.getByLessonUid(validatedLessonUid),
      )
      const data = unwrapApiResponse(response.data, 'Gagal mengambil konfigurasi tugas')
      return mapAssignmentResponse(data)
    } catch (error) {
      if (error instanceof Error && isNotFoundApiError(error)) return null
      throw error
    }
  }, 'Gagal mengambil konfigurasi tugas')
}

export async function createLessonAssignment(
  lessonUid: string,
  payload: LessonAssignmentUpsertPayload,
): Promise<LessonDetailAssignment> {
  return withApiErrorHandling(async () => {
    const validatedLessonUid = parseLessonUidParam(lessonUid)
    const validatedPayload = parseLessonAssignmentUpsertRequest(payload)
    const response = await api.post<IResponse<LessonAssignmentApiRaw>>(
      API_ROUTES.lessons.assignment.createByLessonUid(validatedLessonUid),
      validatedPayload,
    )
    const data = unwrapApiResponse(response.data, 'Gagal membuat tugas')
    return mapAssignmentResponse(data)
  }, 'Gagal membuat tugas')
}

export async function updateLessonAssignment(
  lessonUid: string,
  payload: LessonAssignmentUpsertPayload,
): Promise<LessonDetailAssignment> {
  return withApiErrorHandling(async () => {
    const validatedLessonUid = parseLessonUidParam(lessonUid)
    const validatedPayload = parseLessonAssignmentUpsertRequest(payload)
    const response = await api.put<IResponse<LessonAssignmentApiRaw>>(
      API_ROUTES.lessons.assignment.updateByLessonUid(validatedLessonUid),
      validatedPayload,
    )
    const data = unwrapApiResponse(response.data, 'Gagal memperbarui tugas')
    return mapAssignmentResponse(data)
  }, 'Gagal memperbarui tugas')
}

export async function deleteLessonAssignment(lessonUid: string): Promise<void> {
  return withApiErrorHandling(async () => {
    const validatedLessonUid = parseLessonUidParam(lessonUid)
    await api.delete<IResponse<null>>(
      API_ROUTES.lessons.assignment.deleteByLessonUid(validatedLessonUid),
    )
  }, 'Gagal menghapus tugas')
}
