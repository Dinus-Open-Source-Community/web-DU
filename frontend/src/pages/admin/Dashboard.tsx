import { lazy, Suspense } from "react";
import { AppSidebarProvider } from "../../components/shared/Sidebar";
import { PageHeader } from "../../components/shared/Header";
import { KpiGrid } from "../../components/Admin/Dashboard/Kpi";
import { RecentTransactions } from "../../components/Admin/Dashboard/RecentTransactions";
import { PeriodSelector } from "../../components/Admin/Dashboard/PeriodSelector";
import { DashboardError } from "../../components/Admin/Dashboard/DashboardError";
import { ChartCard } from "../../components/shared/ChartCard";
import { useSidebarUser } from "@/hooks/use-sidebar-user";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { CurrencyCompact } from "@/lib/func/func";
import { gridDashboardChartsClassName } from "@/lib/layout/page-layout";

const CategoryBarChart = lazy(() =>
  import("../../components/shared/BarChart").then((module) => ({
    default: module.CategoryBarChart,
  })),
);
const TransactionRatioChart = lazy(() =>
  import("../../components/shared/RatioChart").then((module) => ({
    default: module.TransactionRatioChart,
  })),
);

const SKELETON_BAR_HEIGHTS = [55, 72, 40, 85, 63, 48, 78, 36];

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
  );
}

function DonutSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      className="flex animate-pulse items-center justify-center"
      style={{ height }}
    >
      <div className="h-40 w-40 rounded-full border-[20px] border-slate-200 bg-white" />
    </div>
  );
}

export default function Dashboard() {
  const sidebarUser = useSidebarUser("admin");
  const {
    period,
    setPeriod,
    periodOptions,
    kpis,
    recentTransactions,
    transactionSummary,
    transactionStatusRatio,
    financialCharts,
  } = useAdminDashboard();

  return (
    <AppSidebarProvider role="admin" user={sidebarUser}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            title="Dashboard"
            subtitle="Ringkasan performa platform"
          />
          <PeriodSelector
            value={period}
            options={periodOptions}
            onChange={setPeriod}
          />
        </div>

        {kpis.isError ? (
          <DashboardError
            message={kpis.error?.message ?? "Terjadi kesalahan saat memuat KPI"}
            onRetry={() => kpis.refetch()}
          />
        ) : (
          <KpiGrid adminKpis={kpis.data} isLoading={kpis.isLoading} />
        )}
        <section className={gridDashboardChartsClassName}>
          <ChartCard
            title="Tren Revenue Bulanan"
            subtitle="Pendapatan kotor 12 bulan terakhir"
            className="lg:col-span-2"
          >
            {financialCharts.isError ? (
              <DashboardError
                message={
                  financialCharts.error?.message ?? "Gagal memuat data revenue"
                }
                onRetry={() => financialCharts.refetch()}
              />
            ) : financialCharts.isLoading ? (
              <ChartSkeleton />
            ) : (
              <Suspense fallback={<ChartSkeleton />}>
                <CategoryBarChart
                  data={financialCharts.data?.monthlyRevenue ?? []}
                  orientation="vertical"
                  height={280}
                  valueFormatter={CurrencyCompact}
                />
              </Suspense>
            )}
          </ChartCard>

          <ChartCard
            title="Status Transaksi"
            subtitle="Rasio paid, pending, dan failed"
          >
            {transactionSummary.isError ? (
              <DashboardError
                message={
                  transactionSummary.error?.message ??
                  "Gagal memuat ringkasan transaksi"
                }
                onRetry={() => transactionSummary.refetch()}
              />
            ) : transactionSummary.isLoading ? (
              <DonutSkeleton />
            ) : (
              <Suspense fallback={<DonutSkeleton />}>
                <TransactionRatioChart
                  data={transactionStatusRatio}
                  height={280}
                />
              </Suspense>
            )}
          </ChartCard>
        </section>

        <ChartCard
          title="Revenue per Kategori"
          subtitle="Kontribusi kategori kursus terhadap total pendapatan"
        >
          {financialCharts.isError ? (
            <DashboardError
              message={
                financialCharts.error?.message ?? "Gagal memuat data kategori"
              }
              onRetry={() => financialCharts.refetch()}
            />
          ) : financialCharts.isLoading ? (
            <ChartSkeleton height={240} />
          ) : (
            <Suspense fallback={<ChartSkeleton height={240} />}>
              <CategoryBarChart
                data={financialCharts.data?.revenueByCategory ?? []}
                orientation="horizontal"
                height={240}
                valueFormatter={CurrencyCompact}
              />
            </Suspense>
          )}
        </ChartCard>

        {recentTransactions.isError ? (
          <DashboardError
            message={
              recentTransactions.error?.message ??
              "Terjadi kesalahan saat memuat transaksi"
            }
            onRetry={() => recentTransactions.refetch()}
          />
        ) : (
          <RecentTransactions
            transactions={recentTransactions.data}
            isLoading={recentTransactions.isLoading}
          />
        )}
      </div>
    </AppSidebarProvider>
  );
}
