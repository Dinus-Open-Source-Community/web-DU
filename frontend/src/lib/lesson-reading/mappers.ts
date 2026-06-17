import type { LessonReadingRecord, LessonReadingStatus } from './types'
import type {
  LessonReadingRecordApi,
  LessonReadingStatusApi,
} from './api-types'

export function mapLessonReadingStatus(raw: LessonReadingStatusApi): LessonReadingStatus {
  const reading = raw.reading

  return {
    isRead: Boolean(raw.is_read),
    readAt: reading?.read_at ?? reading?.created_at ?? null,
  }
}

export function mapLessonReadingHistory(raw: LessonReadingRecordApi[]): LessonReadingRecord[] {
  return raw
    .map((record) => {
      const lessonUid = record.lesson_uid?.trim()
      if (!lessonUid) return null

      return {
        uid: record.uid ?? lessonUid,
        lessonUid,
        enrollmentUid: record.enrollment_uid ?? '',
        readAt: record.read_at ?? record.created_at ?? '',
      }
    })
    .filter((record): record is LessonReadingRecord => record !== null)
}

export function toReadLessonIdSet(
  records: LessonReadingRecord[],
  courseLessonIds: ReadonlySet<string>,
): ReadonlySet<string> {
  const readLessonIds = new Set<string>()

  for (const record of records) {
    if (courseLessonIds.has(record.lessonUid)) {
      readLessonIds.add(record.lessonUid)
    }
  }

  return readLessonIds
}

export function toReadLessonIdSetFromStatuses(
  lessonIds: string[],
  statusByLessonUid: ReadonlyMap<string, LessonReadingStatus | undefined>,
): ReadonlySet<string> {
  const readLessonIds = new Set<string>()

  for (const lessonUid of lessonIds) {
    if (statusByLessonUid.get(lessonUid)?.isRead) {
      readLessonIds.add(lessonUid)
    }
  }

  return readLessonIds
}
