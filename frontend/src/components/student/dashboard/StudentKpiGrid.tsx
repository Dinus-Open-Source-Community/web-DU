import type { IUserData } from '@/lib/types/user'
import { gridStatsClassName } from '@/lib/layout/page-layout'
import { studentDashboardLayout } from '@/lib/layout/student-dashboard-layout'
import { cn } from '@/lib/utils'

import { StatCard } from '@/components/shared/StatCard'

type StudentEnrollmentKpiKey = 'total' | 'active' | 'completed'

const studentKpiAccentClassName: Record<StudentEnrollmentKpiKey, string> = {
  total: 'border-l-brand-blue',
  active: 'border-l-[#A8EFCF]',
  completed: 'border-l-[#D7CBFF]',
}

const STUDENT_ENROLLMENT_KPI_ORDER: StudentEnrollmentKpiKey[] = [
  'total',
  'active',
  'completed',
]

const STUDENT_ENROLLMENT_KPI_LABELS: Record<StudentEnrollmentKpiKey, string> = {
  total: 'Total pendaftaran',
  active: 'Aktif',
  completed: 'Selesai',
}

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
    <section className={cn(gridStatsClassName, 'lg:grid-cols-3')}>
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
