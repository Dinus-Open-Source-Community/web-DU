import type { IUpdateAttendancePayload } from '@/lib/types/features/course-detail-assignments'
import { beResolvableUidSchema } from '../common'
import { parseWithValidationMessage } from '../errors'
import {
  createAttendancePayloadSchema,
  updateAttendancePayloadSchema,
  type CreateAttendancePayloadValidated,
  type UpdateAttendancePayloadValidated,
} from './attendance.schema'

export * from './attendance.schema'

export function parseUpdateAttendancePayload(
  payload: IUpdateAttendancePayload,
  fallback = 'Payload kehadiran tidak valid',
): UpdateAttendancePayloadValidated {
  return parseWithValidationMessage(updateAttendancePayloadSchema, payload, fallback)
}

export function parseCreateAttendancePayload(
  payload: unknown,
  fallback = 'Payload kehadiran tidak valid',
): CreateAttendancePayloadValidated {
  return parseWithValidationMessage(createAttendancePayloadSchema, payload, fallback)
}

export function parseAttendanceUidParam(uid: string, fallback = 'UID kehadiran tidak valid'): string {
  return parseWithValidationMessage(beResolvableUidSchema, uid, fallback)
}
