import CalendarView from "@/components/shared/Calendar/View";
import { TimelineAreaChart } from "@/components/shared/AreaChart";
import { ChartCard } from "@/components/shared/ChartCard";
import { PageHeader } from "@/components/shared/Header";
import QuickStats from "@/components/shared/QuickStats";
import { AppSidebarProvider } from "@/components/shared/Sidebar";
import { DashboardError } from "@/components/Admin/Dashboard/DashboardError";
import { useMentorDashboard } from "@/hooks/use-mentor-dashboard";
import { useSidebarUser } from "@/hooks/use-sidebar-user";
import type { TimelineSeries } from "@/lib/types/utils";

const SCHEDULE_CHART_SERIES: TimelineSeries[] = [
  { dataKey: "sessions", label: "Sesi", color: "#0A84DC" },
  { dataKey: "students", label: "Peserta", color: "#10B981" },
];

function QuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-[104px] animate-pulse rounded-2xl border border-slate-100 bg-white shadow-2xs"
        />
      ))}
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="h-[700px] animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm" />
  );
}

function ChartSkeleton() {
  return <div className="h-[280px] animate-pulse rounded-xl bg-slate-100" />;
}

export default function MentorDashboardPage() {
  const sidebarUser = useSidebarUser("mentor");
  const { kpis, schedules, scheduleTimeline } = useMentorDashboard();

  return (
    <AppSidebarProvider role="mentor" user={sidebarUser}>
      <section>
        <PageHeader
          title={`Halo Mentor ${sidebarUser.name}!`}
          subtitle="Selamat datang di dashboard Anda."
        />

        <div className="mb-10">
          {kpis.isError ? (
            <DashboardError
              message={
                kpis.error?.message ?? "Terjadi kesalahan saat memuat statistik"
              }
              onRetry={() => kpis.refetch()}
            />
          ) : kpis.isLoading ? (
            <QuickStatsSkeleton />
          ) : (
            <QuickStats
              stats={
                kpis.data ?? {
                  pendingGrading: 0,
                  unansweredQA: 0,
                  activeStudents: 0,
                  totalCourses: 0,
                }
              }
            />
          )}
        </div>

        <ChartCard
          title="Beban Jadwal Mentor"
          subtitle="Jumlah sesi dan peserta terjadwal per hari"
          className="mb-10"
        >
          {schedules.isError ? (
            <DashboardError
              message={
                schedules.error?.message ??
                "Terjadi kesalahan saat memuat chart jadwal"
              }
              onRetry={() => schedules.refetch()}
            />
          ) : schedules.isLoading ? (
            <ChartSkeleton />
          ) : (
            <TimelineAreaChart
              data={scheduleTimeline}
              series={SCHEDULE_CHART_SERIES}
              height={280}
            />
          )}
        </ChartCard>

        {schedules.isError ? (
          <DashboardError
            message={
              schedules.error?.message ?? "Terjadi kesalahan saat memuat jadwal"
            }
            onRetry={() => schedules.refetch()}
          />
        ) : schedules.isLoading ? (
          <CalendarSkeleton />
        ) : (
          <CalendarView schedules={schedules.data ?? []} />
        )}
      </section>
    </AppSidebarProvider>
  );
}
