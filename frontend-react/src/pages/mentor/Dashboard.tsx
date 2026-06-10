import CalendarView from '@/components/shared/Calendar/View'
import { PageHeader } from '@/components/shared/Header'
import QuickStats from '@/components/shared/QuickStats'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { DashboardError } from '@/components/Admin/Dashboard/DashboardError'
import { useMentorDashboard } from '@/hooks/use-mentor-dashboard'
import { useSidebarUser } from '@/hooks/use-sidebar-user'

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
  )
}

function CalendarSkeleton() {
  return (
    <div className="h-[700px] animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm" />
  )
}

export default function MentorDashboardPage() {
  const sidebarUser = useSidebarUser('mentor')
  const { kpis, schedules } = useMentorDashboard()

  return (
    <AppSidebarProvider role="mentor" user={sidebarUser}>
      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader
          title={`Halo Mentor ${sidebarUser.name}!`}
          subtitle="Selamat datang di dashboard Anda."
        />

        <div className="mb-10">
          {kpis.isError ? (
            <DashboardError
              message={kpis.error?.message ?? 'Terjadi kesalahan saat memuat statistik'}
              onRetry={() => kpis.refetch()}
            />
          ) : kpis.isLoading ? (
            <QuickStatsSkeleton />
          ) : (
            <QuickStats stats={kpis.data ?? {
              pendingGrading: 0,
              unansweredQA: 0,
              activeStudents: 0,
              totalCourses: 0,
            }} />
          )}
        </div>

        {schedules.isError ? (
          <DashboardError
            message={schedules.error?.message ?? 'Terjadi kesalahan saat memuat jadwal'}
            onRetry={() => schedules.refetch()}
          />
        ) : schedules.isLoading ? (
          <CalendarSkeleton />
        ) : (
          <CalendarView schedules={schedules.data ?? []} />
        )}
      </section>
    </AppSidebarProvider>
  )
}
