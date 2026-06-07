import type { LessonReadingRecord, LessonReadingStatus } from '@/lib/lesson-reading/types'
import {
  mapLessonReadingHistory,
  mapLessonReadingStatus,
} from '@/lib/lesson-reading/mappers'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES, type IQueryParamsPayload } from './api-path'
import { api } from './axios'
import type { IResponse } from '@/lib/types/api'

export async function fetchLessonReadingStatus(lessonUid: string): Promise<LessonReadingStatus> {
  const response = await api.get<IResponse<unknown>>(
    API_ROUTES.lessons.read.getStatusByLessonUid(lessonUid),
  )
  const data = unwrapApiResponse(response.data, 'Gagal mengambil status baca lesson')
  return mapLessonReadingStatus(data)
}

/** Sementara tidak dipakai — tunggu perbaikan route my-history di BE. */
export async function fetchMyLessonReadingHistory(
  params?: IQueryParamsPayload,
): Promise<LessonReadingRecord[]> {
  const response = await api.get<IResponse<unknown>>(
    API_ROUTES.lessons.readings.getMyHistory(params),
  )
  const data = unwrapApiResponse(response.data, 'Gagal mengambil riwayat baca lesson')
  return mapLessonReadingHistory(data)
}

export async function markLessonAsRead(lessonUid: string): Promise<LessonReadingRecord | null> {
  const response = await api.post<IResponse<unknown>>(
    API_ROUTES.lessons.read.markByLessonUid(lessonUid),
  )

  if (response.data.success === false) {
    throw new Error(response.data.message || response.data.error || 'Gagal menandai lesson sebagai sudah dibaca')
  }

  const records = mapLessonReadingHistory(
    response.data.data == null ? [] : [response.data.data],
  )

  return records[0] ?? null
}
