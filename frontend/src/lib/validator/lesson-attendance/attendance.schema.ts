import { z } from 'zod'

import { beResolvableUidSchema } from '../common'

const MAX_ATTENDANCE_NOTE_LENGTH = 5_000

/** Selaras `dto.LessonAttendanceUpdateRequest` — binding `oneof=present late absent excused`. */
export const attendanceStatusSchema = z.enum(['present', 'late', 'absent', 'excused'], {
  message: 'status harus present, late, absent, atau excused',
})

export const attendanceNoteSchema = z
  .string()
  .max(MAX_ATTENDANCE_NOTE_LENGTH, `Catatan kehadiran maksimal ${MAX_ATTENDANCE_NOTE_LENGTH} karakter`)

/** Payload PUT `/lessons/attendances/:id`. */
export const updateAttendancePayloadSchema = z
  .object({
    status: attendanceStatusSchema,
    note: attendanceNoteSchema.optional(),
  })
  .strict()
  .transform((data) => ({
    status: data.status,
    ...(data.note !== undefined ? { note: data.note } : {}),
  }))

/** Payload POST `/lessons/attendances` — selaras `dto.LessonAttendanceCreateRequest`. */
export const createAttendancePayloadSchema = z
  .object({
    lesson_uid: beResolvableUidSchema,
    enrollment_uid: beResolvableUidSchema,
    status: attendanceStatusSchema,
    note: attendanceNoteSchema.optional(),
  })
  .strict()

export type UpdateAttendancePayloadValidated = z.infer<typeof updateAttendancePayloadSchema>
export type CreateAttendancePayloadValidated = z.infer<typeof createAttendancePayloadSchema>
