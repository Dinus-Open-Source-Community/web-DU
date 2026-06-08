export interface ILessonReadingStatus {
  isRead: boolean
  readAt: string | null
}

export interface ILessonReadingRecord {
  uid: string
  lessonUid: string
  enrollmentUid: string
  readAt: string
}

/** Alias backward-compat. */
export type LessonReadingStatus = ILessonReadingStatus
export type LessonReadingRecord = ILessonReadingRecord
