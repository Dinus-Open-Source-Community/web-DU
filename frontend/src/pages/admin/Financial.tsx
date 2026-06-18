import { PageHeader } from '../../components/shared/Header'
import { KpiGrid } from '../../components/Admin/Dashboard/Kpi'
import { DashboardError } from '../../components/Admin/Dashboard/DashboardError'
import { ChartCard } from '../../components/shared/ChartCard'
import { CategoryBarChart } from '../../components/shared/BarChart'
import { TransactionRatioChart } from '../../components/shared/RatioChart'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { useAdminFinancial } from '@/hooks/use-admin-financial'
import { CurrencyCompact } from '../../lib/func/func'
import { gridDashboardChartsClassName } from '@/lib/layout/page-layout'

const SKELETON_BAR_HEIGHTS = [55, 72, 40, 85, 63, 48, 78, 36, 60, 45, 70, 50]

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="flex h-full items-end gap-2 px-2 pb-4">
        {SKELETON_BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-slate-200"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function DonutSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="flex animate-pulse items-center justify-center" style={{ height }}>
      <div className="h-40 w-40 rounded-full border-[20px] border-slate-200 bg-white" />
    </div>
  )
}

export default function AdminFinancialAnalyticsPage() {
  const sidebarUser = useSidebarUser('admin')
  const { data, isLoading, isError, error, refetch } = useAdminFinancial()

  return (
    <AppSidebarProvider role="admin" user={sidebarUser}>
      <div className="flex flex-col gap-6">
        <PageHeader title="Financial Reports" subtitle="Ringkasan pendapatan, distribusi kategori, dan sumber penjualan." />

        {isError ? (
          <DashboardError
            message={error?.message ?? 'Gagal memuat data KPI keuangan'}
            onRetry={() => refetch()}
          />
        ) : (
          <KpiGrid adminKpis={data?.kpis} isLoading={isLoading} />
        )}

        <ChartCard title="Monthly Revenue (12 bulan)" subtitle="Tren pendapatan kotor dari seluruh transaksi.">
          {isError ? (
            <DashboardError
              message={error?.message ?? 'Gagal memuat data revenue bulanan'}
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            <ChartSkeleton height={300} />
          ) : (
            <CategoryBarChart
              data={data?.monthlyRevenue ?? []}
              orientation="vertical"
              height={300}
              valueFormatter={CurrencyCompact}
            />
          )}
        </ChartCard>

        <section className={gridDashboardChartsClassName}>
          <ChartCard title="Revenue by Category" subtitle="Kontribusi kategori terhadap total pendapatan." className="lg:col-span-2">
            {isError ? (
              <DashboardError
                message={error?.message ?? 'Gagal memuat data kategori'}
                onRetry={() => refetch()}
              />
            ) : isLoading ? (
              <ChartSkeleton height={300} />
            ) : (
              <CategoryBarChart
                data={data?.revenueByCategory ?? []}
                orientation="horizontal"
                height={300}
                valueFormatter={CurrencyCompact}
              />
            )}
          </ChartCard>

          <ChartCard title="Revenue Source" subtitle="Rasio pendapatan berdasarkan sumbernya.">
            {isError ? (
              <DashboardError
                message={error?.message ?? 'Gagal memuat data sumber revenue'}
                onRetry={() => refetch()}
              />
            ) : isLoading ? (
              <DonutSkeleton height={300} />
            ) : (
              <TransactionRatioChart
                data={data?.revenueSource ?? []}
                height={300}
              />
            )}
          </ChartCard>
        </section>
      </div>
    </AppSidebarProvider>
  )
}
