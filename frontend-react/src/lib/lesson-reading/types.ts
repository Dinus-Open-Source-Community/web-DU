export type LessonReadingStatus = {
  isRead: boolean
  readAt: string | null
}

export type LessonReadingRecord = {
  uid: string
  lessonUid: string
  enrollmentUid: string
  readAt: string
}
