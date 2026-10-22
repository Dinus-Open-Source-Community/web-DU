import { AppSidebarProvider } from "../../components/shared/Sidebar";
import { PageHeader } from "../../components/shared/Header";
import { KpiGrid } from "../../components/Admin/Dashboard/Kpi";
import { DashboardError } from "../../components/Admin/Dashboard/DashboardError";
import { TopCoursesCard } from "../../components/Admin/Dashboard/TopCoursesCard";
import { StudentProgressCard } from "../../components/Admin/Dashboard/StudentProgressCard";
import { MentorActivityCard } from "../../components/Admin/Dashboard/MentorActivityCard";
import { RecentEnrollmentsCard } from "../../components/Admin/Dashboard/RecentEnrollmentsCard";
import { dashboardPageStackClassName } from '@/lib/layout/page-layout'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { useAdminDashboard } from '@/hooks/use-admin-dashboard'
import { useAuth } from '@/providers/auth-provider'

export default function Dashboard() {
  const { role: userRole } = useAuth();
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar();
  const {
    kpis,
    analytics,
  } = useAdminDashboard();

  const isSuperAdmin = userRole === 'super_admin';

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
    >
      <div className={dashboardPageStackClassName}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            className="mb-0 space-y-1"
            title={`Dasbor ${isSuperAdmin ? 'Super Admin' : 'Admin'}`}
            subtitle="Ringkasan performa platform, aktivitas kursus, dan progres belajar siswa."
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopCoursesCard
            courses={analytics.data?.top_courses}
            isLoading={analytics.isLoading}
          />
          <StudentProgressCard
            data={analytics.data?.student_progress_distribution}
            isLoading={analytics.isLoading}
          />
          <MentorActivityCard
            mentors={analytics.data?.top_mentors}
            isLoading={analytics.isLoading}
          />
          <RecentEnrollmentsCard
            enrollments={analytics.data?.recent_enrollments}
            isLoading={analytics.isLoading}
          />
        </div>
      </div>
    </AppSidebarProvider>
  );
}
