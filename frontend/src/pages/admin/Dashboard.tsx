import { lazy, Suspense } from "react";
import { AppSidebarProvider } from "../../components/shared/Sidebar";
import { PageHeader } from "../../components/shared/Header";
import { KpiGrid } from "../../components/Admin/Dashboard/Kpi";
import { RecentTransactions } from "../../components/Admin/Dashboard/RecentTransactions";
import { PeriodSelector } from "../../components/Admin/Dashboard/PeriodSelector";
import { DashboardError } from "../../components/Admin/Dashboard/DashboardError";
import { AdminDashboardTransactionsEmpty } from "../../components/Admin/Dashboard/AdminDashboardTransactionsEmpty";
import { NothingTransactionLottieIllustration } from "../../components/playful/NothingTransactionLottieIllustration";
import { ChartCard } from "../../components/shared/ChartCard";
import {
  appPageContentClassName,
  dashboardPageStackClassName,
  gridDashboardChartsClassName,
} from '@/lib/layout/page-layout'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { useAdminDashboard } from '@/hooks/use-admin-dashboard'
import { CurrencyCompact } from '@/lib/func/func'
import {
  appShellGridOverlayClassName,
  appShellPageBgClassName,
} from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

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
            className="flex-1 rounded-t bg-muted"
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
      <div className="h-40 w-40 rounded-full border-[20px] border-line-light bg-paper-white" />
    </div>
  );
}

export default function Dashboard() {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar();
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

  const transactionTotal =
    transactionSummary.data == null
      ? null
      : transactionSummary.data.paidCount +
        transactionSummary.data.pendingCount +
        transactionSummary.data.failedCount;

  const chartsDataReady =
    !financialCharts.isLoading &&
    !transactionSummary.isLoading &&
    !recentTransactions.isLoading;

  const chartsDataOk =
    !financialCharts.isError &&
    !transactionSummary.isError &&
    !recentTransactions.isError;

  const monthlyRevenue = financialCharts.data?.monthlyRevenue ?? [];
  const revenueByCategory = financialCharts.data?.revenueByCategory ?? [];
  const hasRevenueData =
    monthlyRevenue.some((point) => point.value > 0) ||
    revenueByCategory.some((point) => point.value > 0);

  const hasTransactionActivity =
    (recentTransactions.data?.length ?? 0) > 0 || (transactionTotal ?? 0) > 0;

  const isDashboardTransactionsEmpty =
    chartsDataReady && chartsDataOk && !hasRevenueData && !hasTransactionActivity;

  const showTransactionRatioEmpty =
    chartsDataReady &&
    !transactionSummary.isError &&
    transactionTotal === 0;

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
      contentClassName={cn(appPageContentClassName, appShellPageBgClassName, 'relative')}
    >
      <div aria-hidden className={appShellGridOverlayClassName} />
      <div className={dashboardPageStackClassName}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            className="mb-0 space-y-1.5"
            title="Dasbor"
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
        {isDashboardTransactionsEmpty ? (
          <AdminDashboardTransactionsEmpty />
        ) : (
          <>
            <section className={gridDashboardChartsClassName}>
              <ChartCard
                title="Tren Pendapatan Bulanan"
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
                      data={monthlyRevenue}
                      orientation="vertical"
                      height={280}
                      valueFormatter={CurrencyCompact}
                    />
                  </Suspense>
                )}
              </ChartCard>

              <ChartCard
                title="Status Transaksi"
                subtitle="Rasio lunas, menunggu, dan gagal"
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
                ) : showTransactionRatioEmpty ? (
                  <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                    <NothingTransactionLottieIllustration height="180px" className="mb-1" />
                    <p className="text-sm font-medium text-ink-500">Belum ada transaksi untuk diagram ini</p>
                  </div>
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
              title="Pendapatan per Kategori"
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
                    data={revenueByCategory}
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
          </>
        )}
      </div>
    </AppSidebarProvider>
  );
}
