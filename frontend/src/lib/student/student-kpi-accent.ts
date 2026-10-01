export type StudentEnrollmentKpiKey =
  | 'total'
  | 'pending'
  | 'active'
  | 'completed'
  | 'cancelled'

export const studentKpiAccentClassName: Record<StudentEnrollmentKpiKey, string> = {
  total: 'border-l-brand-blue',
  active: 'border-l-[#A8EFCF]',
  pending: 'border-l-note-yellow',
  completed: 'border-l-[#D7CBFF]',
  cancelled: 'border-l-[#FFC4A6]',
}

export const STUDENT_ENROLLMENT_KPI_ORDER: StudentEnrollmentKpiKey[] = [
  'total',
  'active',
  'pending',
  'completed',
  'cancelled',
]

export const STUDENT_ENROLLMENT_KPI_LABELS: Record<StudentEnrollmentKpiKey, string> = {
  total: 'Total pendaftaran',
  pending: 'Menunggu',
  active: 'Aktif',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}
