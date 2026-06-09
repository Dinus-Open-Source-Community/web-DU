import type {
  ILessonAttendanceRecord,
  IUpdateAttendancePayload,
} from '@/lib/types/features/course-detail-assignments'
import {
  parseAttendanceUidParam,
  parseLessonUidParam,
  parseUpdateAttendancePayload,
} from '@/lib/validator/lesson-attendance'
import { API_ROUTES } from './api-path'
import { api } from './axios'
import { unwrapApiResponse, withApiErrorHandling } from './api-error'
import type { IResponse } from '@/lib/types/api'

function mapAttendanceRecord(raw: unknown): ILessonAttendanceRecord | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  if (!data.uid || !data.lesson_uid || !data.enrollment_uid) return null

  const status = String(data.status ?? 'present')
  const normalizedStatus =
    status === 'present' || status === 'late' || status === 'absent' || status === 'excused'
      ? status
      : 'present'

  return {
    uid: String(data.uid),
    lesson_uid: String(data.lesson_uid),
    enrollment_uid: String(data.enrollment_uid),
    checked_in_at: String(data.checked_in_at ?? ''),
    status: normalizedStatus,
    note: String(data.note ?? ''),
    created_at: String(data.created_at ?? ''),
    updated_at: String(data.updated_at ?? ''),
  }
}

export async function fetchLessonAttendances(lessonUid: string): Promise<ILessonAttendanceRecord[]> {
  return withApiErrorHandling(async () => {
    const validatedLessonUid = parseLessonUidParam(lessonUid)
    const response = await api.get<IResponse<unknown>>(
      API_ROUTES.lessons.attendances.getByLessonUid(validatedLessonUid),
    )
    const data = unwrapApiResponse(response.data, 'Gagal mengambil data kehadiran')
    if (!Array.isArray(data)) return []
    return data
      .map((item) => mapAttendanceRecord(item))
      .filter((item): item is ILessonAttendanceRecord => item !== null)
  }, 'Gagal mengambil data kehadiran')
}

export async function updateLessonAttendance(
  attendanceUid: string,
  payload: IUpdateAttendancePayload,
): Promise<ILessonAttendanceRecord> {
  return withApiErrorHandling(async () => {
    const validatedAttendanceUid = parseAttendanceUidParam(attendanceUid)
    const validatedPayload = parseUpdateAttendancePayload(payload)
    const response = await api.put<IResponse<unknown>>(
      API_ROUTES.lessons.attendances.updateByUid(validatedAttendanceUid),
      validatedPayload,
    )
    const data = unwrapApiResponse(response.data, 'Gagal memperbarui kehadiran')
    const mapped = mapAttendanceRecord(data)
    if (!mapped) {
      throw new Error('Respons kehadiran tidak valid')
    }
    return mapped
  }, 'Gagal memperbarui kehadiran')
}

export async function deleteLessonAttendance(attendanceUid: string): Promise<void> {
  return withApiErrorHandling(async () => {
    const validatedAttendanceUid = parseAttendanceUidParam(attendanceUid)
    await api.delete<IResponse<unknown>>(
      API_ROUTES.lessons.attendances.deleteByUid(validatedAttendanceUid),
    )
  }, 'Gagal menghapus kehadiran')
}
