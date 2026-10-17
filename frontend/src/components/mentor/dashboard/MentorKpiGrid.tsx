import type { IMentorStats } from '@/lib/types/utils'
import { mentorKpiAccentClassName, type MentorKpiMetric } from '@/lib/mentor/mentor-kpi-accent'
import { cn } from '@/lib/utils'

import { StatCard } from '@/components/shared/StatCard'

const MENTOR_KPI_ITEMS: { key: MentorKpiMetric; label: string }[] = [
  { key: 'pendingGrading', label: 'Menunggu dinilai' },
  { key: 'unansweredQA', label: 'Pertanyaan belum dijawab' },
  { key: 'activeStudents', label: 'Siswa aktif' },
  { key: 'totalCourses', label: 'Total kursus' },
]

function KpiSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col items-start gap-3 rounded-xl border-2 border-l-4 border-ink-900/10 border-l-line-medium bg-paper-white p-4">
      <div className="flex w-full flex-col gap-2">
        <div className="h-3 w-20 rounded bg-line-light" />
        <div className="h-7 w-28 rounded bg-line-light" />
      </div>
      <div className="h-3 w-40 max-w-full rounded bg-line-light" />
    </div>
  )
}

type MentorKpiGridProps = {
  stats?: IMentorStats
  isLoading?: boolean
}

export function MentorKpiGrid({ stats, isLoading }: MentorKpiGridProps) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </section>
    )
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
