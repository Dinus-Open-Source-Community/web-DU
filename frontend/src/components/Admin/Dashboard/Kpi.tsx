import type { AdminKpi } from '@/lib/types/admin/dashboard'
import { getAdminKpiAccent } from '@/lib/admin/kpi-accent'
import { localizeAdminKpis } from '@/lib/admin/localize-admin-kpi'
import { cn } from '@/lib/utils'

import { StatCard } from '../../shared/StatCard'
import { AdminKpiCardsSkeleton } from './DashboardSkeletons'

export function KpiGrid({ 
  adminKpis, 
  isLoading
}: { 
  adminKpis?: AdminKpi[]; 
  isLoading?: boolean;
}) {
  const localizedKpis = localizeAdminKpis(adminKpis)
  
  // Admin boleh lihat semua KPI overview (tidak ada tombol aksi ke user management)
  const filteredKpis = localizedKpis

  if (isLoading) {
    return <AdminKpiCardsSkeleton />
  }

  return (
    <section className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4')}>
      {filteredKpis?.map((k) => (
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
