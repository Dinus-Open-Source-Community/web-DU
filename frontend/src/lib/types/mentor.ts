import type { CourseCategory, CourseClassType, CourseLevel, IQuiz } from './course'

/** Dashboard & jadwal mentor. */
export type SubmissionStatus = 'Submitted' | 'Late' | 'Pending'

export type ClassType = 'online' | 'offline'

export interface IMentorStats {
  pendingGrading: number
  unansweredQA: number
  activeStudents: number
  totalCourses: number
}

export interface IScheduleItem {
  uid: string
  courseId: string
  courseName: string
  scheduleDate: string
  scheduleTime: string
  endTime: string
  location: string
  classType: ClassType
  studentCount: number
}

export interface ISubmissionItem {
  uid: string
  studentName: string
  studentAvatar: string
  courseName: string
  assignmentTitle: string
  submissionDate: string
  status: SubmissionStatus
  daysLate?: number
}

/** Kursus milik mentor — metadata tampilan editor & daftar (sinkronkan dengan API kursus). */
export interface IMentorCourse {
  uid: string
  title: string
  /** Teks header / subtitle singkat di kartu & editor */
  header: string
  description: string
  image?: string
  published: boolean
  moduleCount: number
  /** Jumlah pertemuan (untuk dropdown tugas per pertemuan); default dihitung jika tidak ada */
  meetingCount?: number
  studentCount: number
  rating: number
  totalReviews: number
  updatedAt?: string
  category?: CourseCategory
  level?: CourseLevel
  classType?: CourseClassType
  price?: number
  strikePrice?: number
  whatYouLearn?: string[]
}

/** Status peserta pada tabel mentor. */
export type MentorCourseStudentStatus = 'Aktif' | 'Selesai' | 'Terlambat' | 'Belum mulai'

/** Baris peserta per kursus — progress & absensi untuk tabel mentor */
export interface IMentorCourseStudent {
  uid: string
  name: string
  email?: string
  avatar?: string
  progressPercent: number
  attendancePresent: number
  attendanceTotal: number
  status: MentorCourseStudentStatus
  lastActiveLabel: string
}

/** Jadwal pertemuan berulang: cocok jika weekday sama dengan hari ini */
export interface IMentorClassScheduleEntry {
  id: string
  courseUid: string
  /** 0 = Minggu … 6 = Sabtu */
  weekday: number
  /** Label tampilan, mis. "09:00" */
  timeLabel: string
}

export type MentorAttendanceApprovalMode = 'review' | 'auto'

/** Status absensi efektif untuk satu siswa pada satu sesi */
export type MentorSessionAttendanceStatus = 'belum' | 'hadir' | 'izin' | 'alpha'

/** Satu baris absensi per siswa dalam sesi (tanggal tertentu) */
export interface IMentorSessionStudentAttendance {
  effective: MentorSessionAttendanceStatus
  /** Permintaan dari siswa yang menunggu persetujuan mentor (mode review) */
  pendingKind: 'hadir' | 'izin' | null
}

export interface IMentorAttendanceSessionState {
  meetingNumber: number
  approvalMode: MentorAttendanceApprovalMode
  byStudent: Record<string, IMentorSessionStudentAttendance>
}

/** Kartu di hub: kursus + slot jadwal untuk hari ini */
export interface IMentorTodayClassCard {
  scheduleId: string
  courseUid: string
  timeLabel: string
  title: string
  header: string
  image?: string
}

/** Tugas per kursus (mentor). */
export type MentorAssignmentLifecycleStatus = 'draft' | 'published' | 'closed'
export type MentorAssignmentTaskType = 'text' | 'quiz'

export interface MentorAssignmentSubmissionConfig {
  allowFile: boolean
  allowPlainText: boolean
  allowRichText: boolean
  requireFileDescription: boolean
}

export interface IMentorCourseAssignment {
  uid: string
  courseId: string
  /** Pertemuan ke-1 … ke-N (N = meetingCount kursus) */
  meetingNumber: number
  title: string
  taskType?: MentorAssignmentTaskType
  /** HTML dari editor (atau teks polos lama) */
  description: string
  quiz?: IQuiz
  deadlineAt: string
  status: MentorAssignmentLifecycleStatus
  autoCloseAfterDeadline: boolean
  allowResubmit: boolean
  maxAttempts?: number
  submissionConfig?: MentorAssignmentSubmissionConfig
  /** Lampiran instruksi mentor (URL aman / signed URL dari API). */
  instructionAttachments?: { fileName: string; url: string; mime?: string }[]
}

export type SubmissionContentBlock =
  | { type: 'text'; text: string }
  | { type: 'html'; html: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'file'; fileName: string; url: string; mime?: string; description?: string }
  | { type: 'videoEmbed'; provider: 'youtube' | 'vimeo' | 'other'; embedUrl: string; title?: string }
  | {
      type: 'quiz'
      passingScore?: number
      answers: {
        questionId: string
        prompt: string
        selectedOptionId: string
        selectedLabel: string
      }[]
    }
  | { type: 'link'; url: string; label?: string }

export type MentorSubmissionReviewStatus = 'pending_review' | 'graded' | 'returned'

export interface IMentorAssignmentSubmission {
  uid: string
  assignmentUid: string
  courseId: string
  studentUid: string
  studentName: string
  studentAvatar: string
  submittedAt: string
  attemptNumber: number
  contentBlocks: SubmissionContentBlock[]
  reviewStatus: MentorSubmissionReviewStatus
  rating: number | null
  mentorComment: string | null
  reviewedAt: string | null
}

/** Statistik khusus halaman tugas (tidak harus sama dengan dashboard mentor) */
export interface IMentorAssignmentStats {
  activeAssignments: number
  awaitingReview: number
  dueSoonCount: number
  resubmitAwaitingReview: number
}

export type DeadlineUrgency = 'overdue' | 'due_soon' | 'ok' | 'closed'
