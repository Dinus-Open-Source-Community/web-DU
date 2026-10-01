/** Aksen kiri KPI mentor — palet selaras admin dashboard (sticky-note / brand). */
export type MentorKpiMetric =
  | 'pendingGrading'
  | 'unansweredQA'
  | 'activeStudents'
  | 'totalCourses'

export const mentorKpiAccentClassName: Record<MentorKpiMetric, string> = {
  pendingGrading: 'border-l-brand-blue',
  unansweredQA: 'border-l-[#D7CBFF]',
  activeStudents: 'border-l-[#A8EFCF]',
  totalCourses: 'border-l-[#FFC4A6]',
}
