import type { AdminKpi } from '@/lib/types/admin/dashboard'
import { getAdminKpiAccent } from '@/lib/admin/kpi-accent'
import { localizeAdminKpis } from '@/lib/admin/localize-admin-kpi'
import { cn } from '@/lib/utils'

import { StatCard } from '../../shared/StatCard'

function KpiSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col items-start gap-2.5 rounded-xl border border-line-light bg-paper-white p-4.5">
      <div className="flex w-full flex-col gap-2">
        <div className="h-3 w-20 rounded bg-line-light" />
        <div className="h-7 w-28 rounded bg-line-light" />
      </div>
      <div className="h-3 w-40 max-w-full rounded bg-line-light" />
    </div>
  )
}

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
    return (
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </section>
    )
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
