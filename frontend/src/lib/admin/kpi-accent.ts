import type { AdminKpiIconName } from '@/lib/types/admin/dashboard'

/** Aksen kiri KPI — warna sticky-note / brand DOSCOM, tanpa ikon dekoratif generik. */
export const adminKpiAccentClassName: Record<AdminKpiIconName, string> = {
  revenue: 'border-l-brand-blue',
  users: 'border-l-[#A8EFCF]',
  transactions: 'border-l-[#D7CBFF]',
  conversion: 'border-l-[#FFC4A6]',
  ticket: 'border-l-note-yellow',
  paid: 'border-l-emerald-500',
  pending: 'border-l-amber-500',
  failed: 'border-l-destructive',
}

export type TransactionSparkMetric = 'revenue' | 'paid' | 'pending' | 'failed'

export const transactionSparkAccentClassName: Record<TransactionSparkMetric, string> = {
  revenue: adminKpiAccentClassName.revenue,
  paid: adminKpiAccentClassName.paid,
  pending: adminKpiAccentClassName.pending,
  failed: adminKpiAccentClassName.failed,
}
