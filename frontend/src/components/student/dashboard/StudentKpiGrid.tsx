import type { IUserData } from '@/lib/types/user'
import {
  STUDENT_ENROLLMENT_KPI_LABELS,
  STUDENT_ENROLLMENT_KPI_ORDER,
  studentKpiAccentClassName,
  type StudentEnrollmentKpiKey,
} from '@/lib/student/student-kpi-accent'
import { gridStatsClassName } from '@/lib/layout/page-layout'
import { studentDashboardLayout } from '@/lib/layout/student-dashboard-layout'
import { cn } from '@/lib/utils'

import { StatCard } from '@/components/shared/StatCard'

type StudentKpiGridProps = {
  summary?: IUserData['enrollment_summary']
}

export function StudentKpiGrid({ summary }: StudentKpiGridProps) {
  if (!summary) {
    return (
      <div className={studentDashboardLayout.emptyBlock}>
        Belum ada ringkasan data dashboard.
      </div>
    )
  }

  return (
    <section className={cn(gridStatsClassName, 'lg:grid-cols-5')}>
      {STUDENT_ENROLLMENT_KPI_ORDER.map((key) => {
        const value = summary[key as StudentEnrollmentKpiKey]
        if (value === undefined) return null

        return (
          <StatCard
            key={key}
            variant="kpi"
            label={STUDENT_ENROLLMENT_KPI_LABELS[key]}
            value={value}
            accentClassName={studentKpiAccentClassName[key]}
          />
        )
      })}
    </section>
  )
}
