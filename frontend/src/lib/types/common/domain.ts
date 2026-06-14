/** Tipe tugas assignment/homework — dipakai di lesson editor, mentor, dan student. */
export type AssignmentTaskType = 'text' | 'quiz'

/** Cara lesson disampaikan — field API `content_type`. */
export type LessonDeliveryType = 'text' | 'video'

/** Level kursus dari backend (uppercase). */
export type CourseApiLevel = 'PEMULA' | 'MENENGAH' | 'LANJUTAN'

/** Level kursus untuk tampilan form UI (title case). */
export type CourseUiLevel = 'Pemula' | 'Menengah' | 'Lanjutan'

/** Status kursus di katalog/admin. */
export type CourseCatalogStatus = 'published' | 'draft' | 'pending' | 'rejected'

/** Status publish kursus di konteks enrollment user. */
export type CoursePublishStatus = 'DRAFT' | 'PUBLISHED'

export type BadgeVariant = 'free' | 'premium' | 'event' | 'draft'
export type CourseClassType = 'Free' | 'Premium' | 'Event'
export type ClassType = 'online' | 'offline'

export type AdminStatus = 'active' | 'inactive' | 'pending'
export type UserRole = 'student' | 'mentor' | 'admin'
export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled'

export type LessonAssignmentStatus = 'DRAFT' | 'TERBIT' | 'DITUTUP'
export type MentorAssignmentLifecycleStatus = 'draft' | 'published' | 'closed'
export type MentorSubmissionReviewStatus = 'pending_review' | 'graded' | 'returned'
export type MentorCourseStudentStatus = 'Aktif' | 'Selesai' | 'Terlambat' | 'Belum mulai'

export type PaymentStatus = 'pending' | 'success' | 'failed'
export type DeadlineUrgency = 'overdue' | 'due_soon' | 'ok' | 'closed'
export type SortDirection = 'asc' | 'desc'

/** Alias backward-compat — gunakan `AssignmentTaskType`. */
export type HomeworkTaskType = AssignmentTaskType
/** Alias backward-compat — gunakan `AssignmentTaskType`. */
export type LessonAssignmentTaskType = AssignmentTaskType
/** Alias backward-compat — gunakan `AssignmentTaskType`. */
export type MentorAssignmentTaskType = AssignmentTaskType
/** Alias backward-compat — gunakan `CourseUiLevel`. */
export type CourseLevel = CourseUiLevel
/** Alias backward-compat — gunakan `CourseCatalogStatus`. */
export type CourseStatus = CourseCatalogStatus
