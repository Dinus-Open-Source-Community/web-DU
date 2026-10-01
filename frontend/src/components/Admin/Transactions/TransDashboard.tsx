import { Loader2 } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { IAdminTransaction, PaymentStatus } from '../../../lib/types/transaction'
import type { AdminDataTableColumn } from '../../../lib/types/api'
import { PaymentBadge } from '../../ui/badge'
import { ChartCard } from '../../shared/ChartCard'
import { TransactionRatioChart } from '../../shared/RatioChart'
import { AdminDataTable } from '../../shared/AdminDataTable'
import { SearchForm } from '../../shared/SearchForm'
import { FilterSelect } from '../../shared/FilterSelect'
import type { IChartRatioPoint } from '../../../lib/types/components/charts'
import { FormatDateTime, FormatRupiah } from '@/lib/func/func'
import type { TransactionSummary } from '@/lib/types/admin/dashboard'
import type { DailyTransactionStat } from '@/hooks/use-admin-transactions'
import {
  appCardClassName,
  appKpiLabelClassName,
  appKpiValueClassName,
} from '@/lib/design/app-shell-tokens'
import {
  transactionSparkAccentClassName,
  type TransactionSparkMetric,
} from '@/lib/admin/kpi-accent'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | PaymentStatus
type MethodFilter = 'all' | IAdminTransaction['paymentMethod']

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'success', label: 'Lunas' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'failed', label: 'Gagal' },
]

const methodOptions: { value: MethodFilter; label: string }[] = [
  { value: 'all', label: 'Semua Metode' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Virtual Account', label: 'Virtual Account' },
  { value: 'E-Wallet', label: 'E-Wallet' },
  { value: 'QRIS', label: 'QRIS' },
]

function KpiSparkCard({
  metric,
  label,
  value,
  sparkData,
  color,
  gradientId,
  subLabel,
  tooltipPrefix,
}: {
  metric: TransactionSparkMetric
  label: string
  value: string
  sparkData: { date: string; value: number }[]
  color: string
  gradientId: string
  subLabel?: string
  tooltipPrefix?: string
}) {
  const hasData = sparkData.length >= 2

  return (
    <div
      className={cn(
        appCardClassName,
        'flex flex-col border-l-4 p-4 shadow-none',
        transactionSparkAccentClassName[metric],
      )}
    >
      <div className="flex flex-col gap-1">
        <span className={appKpiLabelClassName}>{label}</span>
        <span className={appKpiValueClassName}>{value}</span>
      </div>

      <div className="-mx-1 mt-3 h-14">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: '#FFFFFF',
                  borderRadius: 10,
                  border: '2px solid rgba(5, 9, 20, 0.1)',
                  boxShadow: '0 12px 26px rgba(5, 9, 20, 0.10)',
                  fontSize: 11,
                  padding: '6px 10px',
                  lineHeight: '1.4',
                }}
                formatter={(v) => [
                  tooltipPrefix
                    ? `${tooltipPrefix}${Number(v).toLocaleString('id-ID')}`
                    : Number(v).toLocaleString('id-ID'),
                  label,
                ]}
                labelFormatter={(l) => {
                  const d = new Date(l as string)
                  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={`url(#${gradientId})`}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[10px] font-medium text-ink-400">Belum cukup data untuk chart</span>
          </div>
        )}
      </div>

      {subLabel ? (
        <span className="mt-1 text-[11px] font-medium text-ink-500">{subLabel}</span>
      ) : null}
    </div>
  )
}

export interface TransactionsDashboardProps {
  transactions: IAdminTransaction[]
  summary?: TransactionSummary
  dailyStats: DailyTransactionStat[]
  ratioData: IChartRatioPoint[]

  page: number
  totalPages: number
  onPageChange: (page: number) => void

  search: string
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void

  statusFilter: StatusFilter
  onStatusChange: (value: StatusFilter) => void

  methodFilter: MethodFilter
  onMethodChange: (value: MethodFilter) => void

  isLoading?: boolean
  isFetching?: boolean
}

export function TransactionsDashboard({
  transactions,
  summary,
  dailyStats,
  ratioData,
  page,
  totalPages,
  onPageChange,
  search,
  onSearchChange,
  onSearchSubmit,
  statusFilter,
  onStatusChange,
  methodFilter,
  onMethodChange,
  isLoading,
  isFetching,
}: TransactionsDashboardProps) {
  const grossRevenue = summary?.grossRevenue ?? 0
  const paidCount = summary?.paidCount ?? 0
  const pendingCount = summary?.pendingCount ?? 0
  const failedCount = summary?.failedCount ?? 0
  const totalTx = paidCount + pendingCount + failedCount

  const revenueSparkData = dailyStats.map((d) => ({ date: d.date, value: d.revenue }))
  const paidSparkData = dailyStats.map((d) => ({ date: d.date, value: d.paid }))
  const pendingSparkData = dailyStats.map((d) => ({ date: d.date, value: d.pending }))
  const failedSparkData = dailyStats.map((d) => ({ date: d.date, value: d.failed }))

  const columns: AdminDataTableColumn<IAdminTransaction>[] = [
    {
      id: 'id',
      header: 'Transaksi',
      cell: (t) => (
        <div className="flex flex-col">
          <span className="font-semibold text-ink-900">{t.transactionId}</span>
          <span className="text-xs text-ink-500">{FormatDateTime(t.purchasedAt)}</span>
        </div>
      ),
    },
    {
      id: 'student',
      header: 'Siswa',
      cell: (t) => (
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-paper-paper ring-2 ring-ink-900/10">
            <img src={t.studentAvatar} alt={t.studentName} className="object-cover" sizes="32px" />
          </div>
          <span className="truncate text-ink-700">{t.studentName}</span>
        </div>
      ),
    },
    {
      id: 'course',
      header: 'Kursus',
      cell: (t) => <span className="line-clamp-1 max-w-[240px] text-ink-700">{t.courseName}</span>,
    },
    {
      id: 'method',
      header: 'Metode',
      cell: (t) => <span className="text-ink-600">{t.paymentMethod}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (t) => <PaymentBadge status={t.paymentStatus} presentation="dot" />,
    },
    {
      id: 'price',
      header: 'Total',
      align: 'right',
      cell: (t) => (
        <span className="font-semibold tabular-nums text-ink-900">
          {t.price === 0 ? 'Gratis' : FormatRupiah(t.price)}
        </span>
      ),
    },
  ]

  if (isLoading) {
    return (
      <section className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-ink-400" aria-hidden />
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiSparkCard
          metric="revenue"
          label="Pendapatan kotor"
          value={String(FormatRupiah(grossRevenue))}
          sparkData={revenueSparkData}
          color="#13A8FF"
          gradientId="spark-revenue"
          tooltipPrefix="Rp "
          subLabel={totalTx > 0 ? `${totalTx.toLocaleString('id-ID')} total transaksi` : undefined}
        />
        <KpiSparkCard
          metric="paid"
          label="Lunas"
          value={paidCount.toLocaleString('id-ID')}
          sparkData={paidSparkData}
          color="#10B981"
          gradientId="spark-paid"
          subLabel={totalTx > 0 ? `${((paidCount / totalTx) * 100).toFixed(1)}% dari total` : undefined}
        />
        <KpiSparkCard
          metric="pending"
          label="Menunggu"
          value={pendingCount.toLocaleString('id-ID')}
          sparkData={pendingSparkData}
          color="#F59E0B"
          gradientId="spark-pending"
          subLabel={totalTx > 0 ? `${((pendingCount / totalTx) * 100).toFixed(1)}% dari total` : undefined}
        />
        <KpiSparkCard
          metric="failed"
          label="Gagal"
          value={failedCount.toLocaleString('id-ID')}
          sparkData={failedSparkData}
          color="#E34D59"
          gradientId="spark-failed"
          subLabel={totalTx > 0 ? `${((failedCount / totalTx) * 100).toFixed(1)}% dari total` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Rasio Status" subtitle="Proporsi status transaksi." className="lg:col-span-3">
          <TransactionRatioChart data={ratioData} height={280} />
        </ChartCard>
      </div>

      <div className={cn(appCardClassName, 'flex flex-col gap-1 p-4 shadow-none')}>
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          Daftar Transaksi
          {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-400" aria-hidden /> : null}
        </div>
        <p className="text-xs font-medium text-ink-500">
          Semua transaksi platform. Filter untuk menemukan transaksi spesifik.
        </p>
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-3">
        <SearchForm
          value={search}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          placeholder="Cari transaksi, siswa, atau kursus..."
          submitLabel="Cari"
          className="min-w-[240px] flex-1"
        />
        <FilterSelect<StatusFilter>
          id="tx-status"
          label="Status"
          value={statusFilter}
          onChange={onStatusChange}
          options={statusOptions}
        />
        <FilterSelect<MethodFilter>
          id="tx-method"
          label="Metode"
          value={methodFilter}
          onChange={onMethodChange}
          options={methodOptions}
        />
      </div>

      <AdminDataTable
        data={transactions}
        columns={columns}
        keyField={(t) => t.uid}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </section>
  )
}
