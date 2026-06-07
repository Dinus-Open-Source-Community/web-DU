import type { LessonDetailAssignment } from '@/lib/types/lesson'
import type { LessonAssignmentUpsertPayload } from '@/lib/course-edit/homework-rules'
import { mapLessonDetailAssignment } from '@/lib/lesson-assignment/assignment-mapper'
import { API_ROUTES } from './api-path'
import { api } from './axios'
import { unwrapApiResponse, withApiErrorHandling } from './api-error'
import type { IResponse } from '@/lib/types/api'
import type { AxiosError } from 'axios'

function mapAssignmentResponse(raw: unknown): LessonDetailAssignment {
  const mapped = mapLessonDetailAssignment(raw)
  if (!mapped) {
    throw new Error('Respons assignment tidak valid')
  }
  return mapped
}

function isNotFoundError(error: unknown) {
  const axiosError = error as AxiosError
  return axiosError.response?.status === 404
}

export async function fetchLessonAssignment(
  lessonUid: string,
): Promise<LessonDetailAssignment | null> {
  return withApiErrorHandling(async () => {
    try {
      const response = await api.get<IResponse<unknown>>(
        API_ROUTES.lessons.assignment.getByLessonUid(lessonUid),
      )
      const data = unwrapApiResponse(response.data, 'Gagal mengambil konfigurasi tugas')
      return mapAssignmentResponse(data)
    } catch (error) {
      if (isNotFoundError(error)) return null
      throw error
    }
  }, 'Gagal mengambil konfigurasi tugas')
}

export async function createLessonAssignment(
  lessonUid: string,
  payload: LessonAssignmentUpsertPayload,
): Promise<LessonDetailAssignment> {
  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<unknown>>(
      API_ROUTES.lessons.assignment.createByLessonUid(lessonUid),
      payload,
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
    const response = await api.put<IResponse<unknown>>(
      API_ROUTES.lessons.assignment.updateByLessonUid(lessonUid),
      payload,
    )
    const data = unwrapApiResponse(response.data, 'Gagal memperbarui tugas')
    return mapAssignmentResponse(data)
  }, 'Gagal memperbarui tugas')
}

export async function deleteLessonAssignment(lessonUid: string): Promise<void> {
  return withApiErrorHandling(async () => {
    await api.delete<IResponse<unknown>>(
      API_ROUTES.lessons.assignment.deleteByLessonUid(lessonUid),
    )
  }, 'Gagal menghapus tugas')
}
