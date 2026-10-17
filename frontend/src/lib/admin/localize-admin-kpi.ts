import type { AdminKpi } from '@/lib/types/admin/dashboard'

/** Label KPI dari API (fallback jika backend belum terbarui). */
const KPI_LABEL_BY_ID: Record<string, string> = {
  'gross-revenue': 'Pendapatan kotor',
  'active-users': 'Pengguna aktif',
  transactions: 'Transaksi',
  'conversion-rate': 'Tingkat konversi',
  'gross-revenue-12m': 'Pendapatan kotor (12 bln)',
  'avg-order-value': 'Nilai pesanan rata-rata',
  'paid-transactions': 'Transaksi lunas',
}

const KPI_LABEL_BY_LEGACY_ENGLISH: Record<string, string> = {
  'Gross Revenue': 'Pendapatan kotor',
  'Gross Revenue (12m)': 'Pendapatan kotor (12 bln)',
  'Active Users': 'Pengguna aktif',
  Transactions: 'Transaksi',
  'Conversion Rate': 'Tingkat konversi',
  'Avg Order Value': 'Nilai pesanan rata-rata',
  'Paid Transactions': 'Transaksi lunas',
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
