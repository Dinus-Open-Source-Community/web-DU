import { ChartCard } from '@/components/shared/ChartCard'
import { PageHeader } from '@/components/shared/Header'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { appCardClassName, appCourseCardClassName } from '@/lib/design/app-shell-tokens'
import { gridCardsClassName, gridMainSidebarClassName } from '@/lib/layout/page-layout'
import { studentDashboardLayout } from '@/lib/layout/student-dashboard-layout'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  KPI                                                                      */
/* -------------------------------------------------------------------------- */

/** Satu kartu KPI siswa — bentuk `StatCard variant="kpi"` tanpa baris tren. */
function StudentKpiCardSkeleton() {
  return (
    <div className="flex w-full flex-col items-start gap-2.5 rounded-xl border border-l-4 border-line-light border-l-line-medium bg-paper-white p-6">
      <div className="flex w-full flex-col gap-1">
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  )
}

/** Baris 3 kartu KPI siswa (grid `lg:grid-cols-3`). */
export function StudentKpiCardsSkeleton() {
  return (
    <section
      role="status"
      aria-busy
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <span className="sr-only">Memuat ringkasan belajar...</span>
      {Array.from({ length: 3 }).map((_, index) => (
        <StudentKpiCardSkeleton key={index} />
      ))}
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Kartu kursus (Lanjutkan Belajar)                                          */
/* -------------------------------------------------------------------------- */

/** Kartu kursus bentuk `JoinedCourseCard` (cover + level + judul + progres + footer). */
function ResumeCourseCardSkeleton() {
  return (
    <div aria-hidden className={cn(appCourseCardClassName, 'flex h-full w-full flex-col overflow-hidden')}>
      <Skeleton className="h-40 w-full shrink-0 rounded-t-xl rounded-b-none sm:h-44" />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* level */}
        <div className="mb-2.5 flex items-center gap-2">
          <Skeleton className="h-4 w-16 rounded-sm" />
        </div>
        {/* judul (2 baris) + deskripsi (2 baris) */}
        <div className="mb-4 flex flex-col gap-1.5">
          <div className="space-y-1">
            <Skeleton className="h-[22px] w-40 max-w-full rounded-sm" />
            <Skeleton className="h-[22px] w-24 rounded-sm" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-[22px] w-full rounded-sm" />
            <Skeleton className="h-[22px] w-2/3 rounded-sm" />
          </div>
        </div>
        {/* kotak progres */}
        <div className="mt-auto mb-4 w-full rounded-lg border border-line-light bg-paper-paper p-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-24 rounded-sm" />
            <Skeleton className="h-4 w-12 rounded-sm" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        {/* mentor + tombol */}
        <div className="mt-auto border-t border-line-light pt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Skeleton className="size-6 shrink-0 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-sm" />
            </div>
            <Skeleton className="h-8 w-16 shrink-0 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Section "Lanjutkan Belajar": judul + tombol + grid kartu kursus. */
export function ContinueLearningSectionSkeleton() {
  return (
    <section
      role="status"
      aria-busy
      className="flex flex-col gap-4 rounded-xl border-2 border-ink-900/10 bg-paper-white p-5 shadow-paper sm:p-6"
    >
      <span className="sr-only">Memuat kursus yang sedang berjalan...</span>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Skeleton className="h-7 w-40 rounded-md" />
          <Skeleton className="h-5 w-72 max-w-full rounded-sm" />
        </div>
        <Skeleton className="h-11 w-28 shrink-0 self-start rounded-sm" />
      </div>

      <div className={gridCardsClassName}>
        {Array.from({ length: 4 }).map((_, index) => (
          <ResumeCourseCardSkeleton key={index} />
        ))}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Tenggat waktu & umpan balik                                               */
/* -------------------------------------------------------------------------- */

/** Kartu tenggat waktu bentuk `UpcomingDeadlineCard` (min-h 210px). */
export function DeadlineCardSkeleton() {
  return (
    <div
      aria-hidden
      className={cn(
        appCardClassName,
        'flex min-h-[210px] flex-col justify-between gap-3 p-4 shadow-none',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3 w-24 rounded-sm" />
          <Skeleton className="h-4 w-44 max-w-full rounded-sm" />
          <Skeleton className="h-3 w-32 rounded-sm" />
        </div>
        <Skeleton className="h-5 w-16 shrink-0 rounded-md" />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line-light/70 pt-3">
        <Skeleton className="h-3.5 w-28 rounded-sm" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  )
}

/** Kartu umpan balik bentuk `FeedbackCard` (min-h 210px). */
export function FeedbackCardSkeleton() {
  return (
    <div
      aria-hidden
      className={cn(appCardClassName, 'min-h-[210px] max-w-full overflow-hidden p-4 shadow-none')}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-sm" />
      </div>
      <Skeleton className="h-4 w-44 max-w-full rounded-sm" />
      <div className="mt-2 mb-4 space-y-1.5">
        <Skeleton className="h-3.5 w-full rounded-sm" />
        <Skeleton className="h-3.5 w-[92%] rounded-sm" />
        <Skeleton className="h-3.5 w-2/3 rounded-sm" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="size-6 shrink-0 rounded-full" />
        <Skeleton className="h-3 w-24 rounded-sm" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Halaman                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Kerangka dasbor siswa: judul + sapaan asli, 3 kartu KPI, section "Lanjutkan
 * Belajar", lalu dua kartu "Tenggat Waktu" & "Umpan Balik" — bentuk dan ukuran
 * kolomnya sama dengan tampilan setelah data profil selesai dimuat.
 */
export function StudentDashboardSkeleton({ userName }: { userName: string }) {
  return (
    <div className={studentDashboardLayout.pageStack}>
      <PageHeader
        className={studentDashboardLayout.pageHeader}
        title="Dasbor"
        subtitle={`Halo, ${userName}! Siap melanjutkan perjalanan belajarmu hari ini?`}
      />

      <StudentKpiCardsSkeleton />
      <ContinueLearningSectionSkeleton />

      <div className={gridMainSidebarClassName}>
        <ChartCard
          title="Tenggat Waktu"
          subtitle="Deadline tugas dan pengumpulan mendatang"
          action={<Skeleton className="h-10 w-28 rounded-sm" />}
        >
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <DeadlineCardSkeleton key={index} />
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Umpan Balik" subtitle="Ulasan kursus dan catatan terbaru">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <FeedbackCardSkeleton key={index} />
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

/**
 * Fallback Suspense route `/dashboard` untuk siswa: chrome sidebar/navbar siswa
 * + skeleton dasbor (bukan skeleton generik tanpa sidebar).
 */
export function StudentDashboardRouteFallback() {
  const sidebarUser = useSidebarUser('student')

  return (
    <AppSidebarProvider role="student" user={sidebarUser}>
      <StudentDashboardSkeleton userName={sidebarUser.name} />
    </AppSidebarProvider>
  )
}
