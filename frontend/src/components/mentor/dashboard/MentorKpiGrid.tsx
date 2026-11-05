import type { IMentorStats } from '@/lib/types/utils'
import { cn } from '@/lib/utils'

import { MentorKpiCardsSkeleton } from '@/components/mentor/dashboard/MentorDashboardSkeletons'
import { StatCard } from '@/components/shared/StatCard'

type MentorKpiMetric =
  | 'pendingGrading'
  | 'unansweredQA'
  | 'activeStudents'
  | 'totalCourses'

const mentorKpiAccentClassName: Record<MentorKpiMetric, string> = {
  pendingGrading: 'border-l-brand-blue',
  unansweredQA: 'border-l-[#D7CBFF]',
  activeStudents: 'border-l-[#A8EFCF]',
  totalCourses: 'border-l-[#FFC4A6]',
}

const MENTOR_KPI_ITEMS: { key: MentorKpiMetric; label: string }[] = [
  { key: 'pendingGrading', label: 'Menunggu dinilai' },
  { key: 'unansweredQA', label: 'Pertanyaan belum dijawab' },
  { key: 'activeStudents', label: 'Siswa aktif' },
  { key: 'totalCourses', label: 'Total kursus' },
]

type MentorKpiGridProps = {
  stats?: IMentorStats
  isLoading?: boolean
}

export function MentorKpiGrid({ stats, isLoading }: MentorKpiGridProps) {
  if (isLoading) {
    return <MentorKpiCardsSkeleton />
  }

  const values = stats ?? {
    pendingGrading: 0,
    unansweredQA: 0,
    activeStudents: 0,
    totalCourses: 0,
  }

  return (
    <section className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4')}>
      {MENTOR_KPI_ITEMS.map((item) => (
        <StatCard
          key={item.key}
          variant="kpi"
          label={item.label}
          value={values[item.key]}
          accentClassName={mentorKpiAccentClassName[item.key]}
        />
      ))}
    </section>
  )
}
