import type { AdminKpi } from '@/lib/types/admin/dashboard'

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

export function localizeAdminKpi(kpi: AdminKpi): AdminKpi {
  const label =
    KPI_LABEL_BY_ID[kpi.id] ?? KPI_LABEL_BY_LEGACY_ENGLISH[kpi.label] ?? kpi.label
  const trendLabel = TREND_LABEL_MAP[kpi.trendLabel] ?? kpi.trendLabel

  if (label === kpi.label && trendLabel === kpi.trendLabel) {
    return kpi
  }

  return { ...kpi, label, trendLabel }
}

export function localizeAdminKpis(kpis?: AdminKpi[]): AdminKpi[] | undefined {
  return kpis?.map(localizeAdminKpi)
}
