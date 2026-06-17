export type LessonReadingStatusApi = {
  is_read?: boolean
  reading?: {
    read_at?: string
    created_at?: string
  } | null
}

export type LessonReadingRecordApi = {
  uid?: string
  lesson_uid?: string
  enrollment_uid?: string
  read_at?: string
  created_at?: string
}
