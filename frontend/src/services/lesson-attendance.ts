import type { LessonAttendanceApiRaw } from '@/lib/course-detail/attendance-api-types'
import type {
  ILessonAttendanceRecord,
  IUpdateAttendancePayload,
} from "@/lib/types/features/course-detail-assignments";
import {
  parseAttendanceUidParam,
  parseUpdateAttendancePayload,
} from "@/lib/validator/lesson-attendance";
import { API_ROUTES } from "./api-path";
import { api } from "./axios";
import { unwrapApiResponse, withApiErrorHandling } from "./api-error";
import type { IResponse } from "@/lib/types/api";
import { parseLessonUidParam } from "@/lib/validator";

function mapAttendanceRecord(raw: LessonAttendanceApiRaw): ILessonAttendanceRecord | null {
  if (!raw.uid || !raw.lesson_uid || !raw.enrollment_uid) return null;

  const status = String(raw.status ?? "present");
  const normalizedStatus =
    status === "present" ||
    status === "late" ||
    status === "absent" ||
    status === "excused"
      ? status
      : "present";

  return {
    uid: String(raw.uid),
    lesson_uid: String(raw.lesson_uid),
    enrollment_uid: String(raw.enrollment_uid),
    checked_in_at: String(raw.checked_in_at ?? ""),
    status: normalizedStatus,
    note: String(raw.note ?? ""),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  };
}

export async function fetchLessonAttendances(
  lessonUid: string,
): Promise<ILessonAttendanceRecord[]> {
  return withApiErrorHandling(async () => {
    const validatedLessonUid = parseLessonUidParam(lessonUid);
    const response = await api.get<IResponse<LessonAttendanceApiRaw[]>>(
      API_ROUTES.lessons.attendances.getByLessonUid(validatedLessonUid),
    );
    const data = unwrapApiResponse(
      response.data,
      "Gagal mengambil data kehadiran",
    );
    if (!Array.isArray(data)) return [];
    return data
      .map((item) => mapAttendanceRecord(item))
      .filter((item): item is ILessonAttendanceRecord => item !== null);
  }, "Gagal mengambil data kehadiran");
}

export async function updateLessonAttendance(
  attendanceUid: string,
  payload: IUpdateAttendancePayload,
): Promise<ILessonAttendanceRecord> {
  return withApiErrorHandling(async () => {
    const validatedAttendanceUid = parseAttendanceUidParam(attendanceUid);
    const validatedPayload = parseUpdateAttendancePayload(payload);
    const response = await api.put<IResponse<LessonAttendanceApiRaw>>(
      API_ROUTES.lessons.attendances.updateByUid(validatedAttendanceUid),
      validatedPayload,
    );
    const data = unwrapApiResponse(
      response.data,
      "Gagal memperbarui kehadiran",
    );
    const mapped = mapAttendanceRecord(data);
    if (!mapped) {
      throw new Error("Respons kehadiran tidak valid");
    }
    return mapped;
  }, "Gagal memperbarui kehadiran");
}

export async function deleteLessonAttendance(
  attendanceUid: string,
): Promise<void> {
  return withApiErrorHandling(async () => {
    const validatedAttendanceUid = parseAttendanceUidParam(attendanceUid);
    await api.delete<IResponse<null>>(
      API_ROUTES.lessons.attendances.deleteByUid(validatedAttendanceUid),
    );
  }, "Gagal menghapus kehadiran");
}
