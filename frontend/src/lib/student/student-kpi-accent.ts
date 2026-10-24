export type StudentEnrollmentKpiKey =
  | 'total'
  | 'active'
  | 'completed'

export const studentKpiAccentClassName: Record<StudentEnrollmentKpiKey, string> = {
  total: 'border-l-brand-blue',
  active: 'border-l-[#A8EFCF]',
  completed: 'border-l-[#D7CBFF]',
}

export const STUDENT_ENROLLMENT_KPI_ORDER: StudentEnrollmentKpiKey[] = [
  'total',
  'active',
  'completed',
]

export const STUDENT_ENROLLMENT_KPI_LABELS: Record<StudentEnrollmentKpiKey, string> = {
  total: 'Total pendaftaran',
  active: 'Aktif',
  completed: 'Selesai',
}
