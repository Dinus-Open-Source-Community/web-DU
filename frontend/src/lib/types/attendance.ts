/** Absensi siswa & metadata kursus terkait. */

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Alpha'

export interface IAttendanceSummary {
  totalMeetings: number
  hadir: number
  izin: number
  alpha: number
  progressPercentage: number
}

export interface IAttendanceRecord {
  uid: string
  meetingNumber: number
  date: string
  topic: string
  status: AttendanceStatus
  notes?: string
}

export interface ICourseAttendance {
  courseId: string
  courseName: string
  author: {
    name: string
    avatar?: string
  }
  image?: string
  summary: IAttendanceSummary
  records: IAttendanceRecord[]
}
