import CalendarView from '@/components/shared/Calendar/View'
import { TimelineAreaChart } from '@/components/shared/AreaChart'
import { ChartCard } from '@/components/shared/ChartCard'
import { PageHeader } from '@/components/shared/Header'
import { MentorAppPageShell } from '@/components/mentor/MentorAppPageShell'
import { DashboardError } from '@/components/Admin/Dashboard/DashboardError'
import { MentorKpiGrid } from '@/components/mentor/dashboard/MentorKpiGrid'
import { useMentorDashboard } from '@/hooks/use-mentor-dashboard'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { mentorDashboardLayout } from '@/lib/layout/mentor-dashboard-layout'
import type { TimelineSeries } from '@/lib/types/utils'

const SCHEDULE_CHART_SERIES: TimelineSeries[] = [
  { dataKey: 'sessions', label: 'Sesi', color: '#0A84DC' },
  { dataKey: 'students', label: 'Peserta', color: '#10B981' },
]

const SKELETON_BAR_HEIGHTS = [55, 72, 40, 85, 63, 48, 78, 36]

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="flex h-full items-end gap-2 px-2 pb-4">
        {SKELETON_BAR_HEIGHTS.map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-muted" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

function CalendarSkeleton() {
  return <div className={mentorDashboardLayout.calendarSkeleton} />
}

export default function MentorDashboardPage() {
  const sidebarUser = useSidebarUser('mentor')
  const { kpis, schedules, scheduleTimeline } = useMentorDashboard()

  return (
    <MentorAppPageShell user={sidebarUser}>
      <PageHeader
        className={mentorDashboardLayout.pageHeader}
        title="Dasbor"
        subtitle={`Halo, ${sidebarUser.name}! Ringkasan aktivitas mentoring, jadwal, dan tugas yang perlu ditindaklanjuti.`}
      />

      {kpis.isError ? (
        <DashboardError
          message={kpis.error?.message ?? 'Terjadi kesalahan saat memuat statistik'}
          onRetry={() => kpis.refetch()}
        />
      ) : (
        <MentorKpiGrid stats={kpis.data} isLoading={kpis.isLoading} />
      )}

      <ChartCard title="Beban Jadwal Mentor" subtitle="Jumlah sesi dan peserta terjadwal per hari">
        {schedules.isError ? (
          <DashboardError
            message={schedules.error?.message ?? 'Terjadi kesalahan saat memuat chart jadwal'}
            onRetry={() => schedules.refetch()}
          />
        ) : schedules.isLoading ? (
          <ChartSkeleton />
        ) : (
          <TimelineAreaChart data={scheduleTimeline} series={SCHEDULE_CHART_SERIES} height={280} />
        )}
      </ChartCard>

      <ChartCard
        title="Kalender Mengajar"
        subtitle="Jadwal sesi dan timeline sesi mendatang"
        className="overflow-visible"
        contentClassName="px-5 py-4"
      >
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
      </ChartCard>
    </MentorAppPageShell>
  )
}
