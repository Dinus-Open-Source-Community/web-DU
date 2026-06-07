import {
  buildLessonCreatePayload,
  buildLessonUpdatePayload,
} from '@/lib/rich-text'
import { mapLessonDetailAssignment } from '@/lib/lesson-assignment/assignment-mapper'
import type {
  CourseDetailLesson,
  LessonCreateRequest,
  LessonDetailItem,
  LessonDetailListResponse,
  LessonPayloadInput,
  LessonUpdateRequest,
} from '@/lib/types/lesson'
import {
  parseLessonCreateRequest,
  parseLessonPayloadInput,
  parseLessonUpdateRequest,
} from '@/lib/validator/lessons'
import { API_ROUTES, type IQueryParamsPayload } from './api-path'
import { api } from './axios'
import { getApiErrorMessage, unwrapApiResponse, withApiErrorHandling } from './api-error'
import type { IResponse } from '@/lib/types/api'

export type CreateLessonInput = LessonCreateRequest | LessonPayloadInput
export type UpdateLessonInput = LessonUpdateRequest | LessonPayloadInput

const isLessonPayloadInput = (
  input: CreateLessonInput | UpdateLessonInput,
): input is LessonPayloadInput => 'deliveryType' in input

function prepareCreatePayload(input: CreateLessonInput): LessonCreateRequest {
  if (isLessonPayloadInput(input)) {
    const validatedInput = parseLessonPayloadInput(input)
    return parseLessonCreateRequest(buildLessonCreatePayload(validatedInput))
  }

  return parseLessonCreateRequest(input)
}

function prepareUpdatePayload(input: UpdateLessonInput): LessonUpdateRequest {
  if (isLessonPayloadInput(input)) {
    const validatedInput = parseLessonPayloadInput(input)
    return parseLessonUpdateRequest(buildLessonUpdatePayload(validatedInput))
  }

  return parseLessonUpdateRequest(input)
}

export async function fetchLessonsByModuleUid(
  moduleUid: string,
  params?: IQueryParamsPayload,
): Promise<LessonDetailListResponse> {
  const response = await api.get<IResponse<LessonDetailListResponse>>(
    API_ROUTES.lessons.getAll({
      module_uid: moduleUid,
      per_page: 100,
      ...params,
    }),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil daftar lesson')
}

export async function fetchLessonByUid(uid: string): Promise<LessonDetailItem> {
  const response = await api.get<IResponse<LessonDetailItem>>(
    API_ROUTES.lessons.getByUid(uid),
  )
  const lesson = unwrapApiResponse(response.data, 'Gagal mengambil detail lesson')

  return {
    ...lesson,
    assignment: lesson.assignment
      ? mapLessonDetailAssignment(lesson.assignment)
      : null,
  }
}

export async function createLesson(
  input: CreateLessonInput,
): Promise<CourseDetailLesson> {
  const payload = prepareCreatePayload(input)

  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<CourseDetailLesson>>(
      API_ROUTES.lessons.create,
      payload,
    )
    return unwrapApiResponse(response.data, 'Gagal membuat lesson')
  }, 'Gagal membuat lesson')
}

export async function updateLesson(
  uid: string,
  input: UpdateLessonInput,
): Promise<CourseDetailLesson> {
  const payload = prepareUpdatePayload(input)

  return withApiErrorHandling(async () => {
    const response = await api.put<IResponse<CourseDetailLesson>>(
      API_ROUTES.lessons.updateByUid(uid),
      payload,
    )
    return unwrapApiResponse(response.data, 'Gagal memperbarui lesson')
  }, 'Gagal memperbarui lesson')
}

export async function deleteLesson(uid: string): Promise<void> {
  try {
    await api.delete<IResponse<null>>(API_ROUTES.lessons.deleteByUid(uid))
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Gagal menghapus lesson'), { cause: error })
  }
}

export {
  fetchLessonReadingStatus,
  fetchMyLessonReadingHistory,
  markLessonAsRead,
} from '@/services/lesson-reading'
