import type { LessonReadingRecord, LessonReadingStatus } from './types'

type LessonReadingStatusApi = {
  is_read?: boolean
  reading?: {
    read_at?: string
    created_at?: string
  } | null
}

type LessonReadingRecordApi = {
  uid?: string
  lesson_uid?: string
  enrollment_uid?: string
  read_at?: string
  created_at?: string
}

export function mapLessonReadingStatus(raw: unknown): LessonReadingStatus {
  const data = (raw ?? {}) as LessonReadingStatusApi
  const reading = data.reading

  return {
    isRead: Boolean(data.is_read),
    readAt: reading?.read_at ?? reading?.created_at ?? null,
  }
}

export function mapLessonReadingHistory(raw: unknown): LessonReadingRecord[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      const record = item as LessonReadingRecordApi
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
