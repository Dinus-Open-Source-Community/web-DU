import type { AdminKpi, AdminKpiIconName } from '@/lib/types/admin/dashboard'
import { cn } from '@/lib/utils'

import { StatCard } from '../../shared/StatCard'
import { AdminKpiCardsSkeleton } from './DashboardSkeletons'

/** Label KPI dari API (fallback jika backend belum terbarui). */
const KPI_LABEL_BY_ID: Record<string, string> = {
  'active-users': 'Pengguna aktif',
  'support-tickets': 'Tiket support',
}

const KPI_LABEL_BY_LEGACY_ENGLISH: Record<string, string> = {
  'Active Users': 'Pengguna aktif',
  'Support Tickets': 'Tiket support',
}

const TREND_LABEL_MAP: Record<string, string> = {
  'all time': 'sepanjang waktu',
  'vs periode sebelumnya': 'dibanding periode sebelumnya',
}

function localizeAdminKpis(kpis?: AdminKpi[]): AdminKpi[] | undefined {
  return kpis?.map((kpi) => {
    const label = KPI_LABEL_BY_ID[kpi.id] ?? KPI_LABEL_BY_LEGACY_ENGLISH[kpi.label] ?? kpi.label
    const trendLabel = TREND_LABEL_MAP[kpi.trendLabel] ?? kpi.trendLabel
    if (label === kpi.label && trendLabel === kpi.trendLabel) return kpi
    return { ...kpi, label, trendLabel }
  })
}

const adminKpiAccentClassName: Record<string, string> = {
  users: 'border-l-note-mint',
  courses: 'border-l-note-sky',
  completion: 'border-l-note-lavender',
}

function getAdminKpiAccent(iconName?: AdminKpiIconName, id?: string): string {
  if (id === 'active-users') return 'border-l-note-mint'
  if (id === 'total-students') return 'border-l-note-sky'
  if (id === 'active-courses') return 'border-l-note-yellow'
  if (id === 'course-completion') return 'border-l-note-lavender'
  if (iconName && adminKpiAccentClassName[iconName]) {
    return adminKpiAccentClassName[iconName]
  }
  return 'border-l-note-mint'
}

export function KpiGrid({ 
  adminKpis, 
  isLoading,
}: { 
  adminKpis?: AdminKpi[]
  isLoading?: boolean
}) {
  const localizedKpis = localizeAdminKpis(adminKpis)

  if (isLoading) {
    return <AdminKpiCardsSkeleton />
  }

  return (
    <section className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4')}>
      {localizedKpis?.map((k) => (
        <StatCard
          key={k.id}
          variant="kpi"
          label={k.label}
          value={k.value}
          trendValue={k.trendValue}
          trendDirection={k.trendDirection}
          trendLabel={k.trendLabel}
          accentClassName={getAdminKpiAccent(k.iconName, k.id)}
        />
      ))}
    </section>
  )
}
