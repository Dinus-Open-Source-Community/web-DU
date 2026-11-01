import { ChartCard } from '@/components/shared/ChartCard'
import { PageHeader } from '@/components/shared/Header'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { mentorDashboardLayout } from '@/lib/layout/mentor-dashboard-layout'

/* -------------------------------------------------------------------------- */
/*  KPI                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Satu kartu KPI mentor — bentuk `StatCard variant="kpi"` tanpa baris tren
 * (label · nilai). Tinggi aslinya 106px: padding 24 + label 20 + gap 4 + nilai 32.
 */
function MentorKpiCardSkeleton() {
  return (
    <div className="flex w-full flex-col items-start gap-2.5 rounded-xl border border-l-4 border-line-light border-l-line-medium bg-paper-white p-6">
      <div className="flex w-full flex-col gap-1">
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  )
}

/** Baris 4 kartu KPI mentor (grid sama dengan `MentorKpiGrid`). */
export function MentorKpiCardsSkeleton() {
  return (
    <section
      role="status"
      aria-busy
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <span className="sr-only">Memuat statistik mentor...</span>
      {Array.from({ length: 4 }).map((_, index) => (
        <MentorKpiCardSkeleton key={index} />
      ))}
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Grafik beban jadwal                                                      */
/* -------------------------------------------------------------------------- */

const CHART_GRID_LINES = 5
const CHART_X_LABELS = 8
const CHART_BARS = [42, 58, 35, 66, 48, 38, 60, 30]

/** Area grafik 280px: garis grid horizontal + bar + label sumbu + legenda. */
export function ScheduleChartAreaSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height }} role="status" aria-busy>
      <span className="sr-only">Memuat grafik jadwal...</span>
      <div className="flex h-full flex-col">
        <div aria-hidden className="relative flex-1">
          <div className="absolute inset-0 flex flex-col justify-between">
            {Array.from({ length: CHART_GRID_LINES }).map((_, index) => (
              <div key={index} className="h-px w-full bg-line-light/70" />
            ))}
          </div>
          <div className="absolute inset-x-2 bottom-0 flex h-full items-end gap-3 opacity-60">
            {CHART_BARS.map((barHeight, index) => (
              <Skeleton
                key={index}
                className="flex-1 rounded-t-md"
                style={{ height: `${barHeight}%` }}
              />
            ))}
          </div>
        </div>
        <div aria-hidden className="mt-3 flex items-center justify-between">
          {Array.from({ length: CHART_X_LABELS }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-10 rounded-sm" />
          ))}
        </div>
        <div aria-hidden className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Skeleton className="size-2 rounded-full" />
            <Skeleton className="h-3.5 w-12 rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-2 rounded-full" />
            <Skeleton className="h-3.5 w-10 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Kartu "Beban Jadwal Mentor" utuh (header asli + area grafik). */
export function ScheduleChartCardSkeleton() {
  return (
    <ChartCard
      title="Beban Jadwal Mentor"
      subtitle="Jumlah sesi dan peserta terjadwal per hari"
    >
      <ScheduleChartAreaSkeleton />
    </ChartCard>
  )
}

/* -------------------------------------------------------------------------- */
/*  Kalender mengajar                                                        */
/* -------------------------------------------------------------------------- */

const CALENDAR_WEEKDAYS = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB']
const CALENDAR_ROWS = 6
const CALENDAR_EVENT_CELLS = new Set([0, 8, 12, 18, 21, 26, 30, 34])

/**
 * Isi kalender mengajar: toolbar (Tipe Kelas / Tampilan) + navigasi bulan +
 * grid 7 kolom, mengikuti tinggi blok aslinya (toolbar 183px, grid ~1007px).
 */
export function CalendarContentSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-busy>
      <span className="sr-only">Memuat kalender mengajar...</span>

      {/* Toolbar: filter tipe kelas + pilihan tampilan */}
      <div aria-hidden className="rounded-xl border-2 border-ink-900/10 bg-paper-white">
        <div className="grid gap-0 lg:grid-cols-2 lg:divide-x lg:divide-ink-900/10">
          {[0, 1].map((column) => (
            <div key={column} className="flex min-h-[101px] flex-col justify-center px-4 py-4 lg:py-5">
              <Skeleton className="h-3 w-20 rounded-sm" />
              <div className="mt-3 flex flex-wrap items-center gap-x-4 border-b-2 border-ink-900/10 pb-2">
                <Skeleton className="h-4 w-14 rounded-sm" />
                <Skeleton className="h-4 w-16 rounded-sm" />
                <Skeleton className="h-4 w-14 rounded-sm" />
                {column === 1 ? <Skeleton className="h-4 w-16 rounded-sm" /> : null}
              </div>
            </div>
          ))}
        </div>
        <div className="flex min-h-[78px] items-center border-t-2 border-ink-900/10 bg-paper-paper/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid bulanan */}
      <div
        aria-hidden
        className="overflow-hidden rounded-xl border-2 border-ink-900/10 bg-paper-white"
      >
        <div className="grid grid-cols-7 border-b border-line-light bg-paper-paper/40">
          {CALENDAR_WEEKDAYS.map((day) => (
            <div key={day} className="flex min-h-[39px] items-center px-3">
              <Skeleton className="mx-auto h-3 w-8 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: CALENDAR_ROWS * 7 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[160px] border-r border-b border-line-light p-2"
            >
              <Skeleton className="h-3 w-5 rounded-sm" />
              {CALENDAR_EVENT_CELLS.has(index) ? (
                <div className="mt-2 space-y-1.5 rounded-lg border border-line-light bg-paper-paper/50 p-2">
                  <Skeleton className="h-2.5 w-16 rounded-sm" />
                  <Skeleton className="h-3 w-full rounded-sm" />
                  <Skeleton className="h-2.5 w-10 rounded-sm" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Kartu "Kalender Mengajar" utuh (header asli + isi kalender). */
export function TeachingCalendarCardSkeleton() {
  return (
    <ChartCard
      title="Kalender Mengajar"
      subtitle="Jadwal sesi dan timeline sesi mendatang"
      className="overflow-visible"
      contentClassName="px-5 py-4"
    >
      <CalendarContentSkeleton />
    </ChartCard>
  )
}

/* -------------------------------------------------------------------------- */
/*  Halaman                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Kerangka dasbor mentor: judul + sapaan asli, 4 kartu KPI, kartu grafik beban
 * jadwal, dan kartu kalender mengajar — bentuknya sama dengan tampilan setelah
 * data masuk, jadi tidak ada pergeseran layout saat refresh.
 */
export function MentorDashboardSkeleton({ userName }: { userName: string }) {
  return (
    <div className={mentorDashboardLayout.pageStack}>
      <PageHeader
        className={mentorDashboardLayout.pageHeader}
        title="Dasbor"
        subtitle={`Halo, ${userName}! Ringkasan aktivitas mentoring, jadwal, dan tugas yang perlu ditindaklanjuti.`}
      />

      <MentorKpiCardsSkeleton />
      <ScheduleChartCardSkeleton />
      <TeachingCalendarCardSkeleton />
    </div>
  )
}

/**
 * Fallback Suspense route `/dashboard` untuk mentor: chrome sidebar/navbar
 * mentor + skeleton dasbor (bukan skeleton generik tanpa sidebar).
 */
export function MentorDashboardRouteFallback() {
  const sidebarUser = useSidebarUser('mentor')

  return (
    <AppSidebarProvider role="mentor" user={sidebarUser}>
      <MentorDashboardSkeleton userName={sidebarUser.name} />
    </AppSidebarProvider>
  )
}
