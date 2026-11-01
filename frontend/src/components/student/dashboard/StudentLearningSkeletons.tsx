import { PageHeader } from '@/components/shared/Header'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { appCourseCardClassName } from '@/lib/design/app-shell-tokens'
import { gridCardsClassName } from '@/lib/layout/page-layout'
import { studentDashboardLayout } from '@/lib/layout/student-dashboard-layout'
import { cn } from '@/lib/utils'

const LEARNING_FILTER_LABELS = ['Semua', 'Sedang Berjalan', 'Baru', 'Selesai'] as const
const LEARNING_SKELETON_CARDS = 8

/**
 * Satu kartu kursus bentuk `JoinedCourseCard size="sm"`:
 * cover 160px · level · judul 2 baris · deskripsi 2 baris · kotak progres · mentor + tombol.
 */
function LearningCourseCardSkeleton() {
  return (
    <div
      aria-hidden
      className={cn(appCourseCardClassName, 'flex h-full w-full flex-col overflow-hidden')}
    >
      <Skeleton className="h-36 w-full shrink-0 rounded-t-xl rounded-b-none sm:h-40" />
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* level */}
        <div className="mb-2.5 flex items-center gap-2">
          <Skeleton className="h-4 w-14 rounded-sm" />
        </div>
        {/* judul (2 baris) + deskripsi (2 baris) */}
        <div className="mb-4 flex flex-col gap-1.5">
          <div className="space-y-1">
            <Skeleton className="h-5 w-40 max-w-full rounded-sm" />
            <Skeleton className="h-5 w-24 rounded-sm" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-2/3 rounded-sm" />
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
        {/* mentor + tombol aksi */}
        <div className="mt-auto border-t border-line-light pt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Skeleton className="size-6 shrink-0 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-sm" />
            </div>
            <Skeleton className="h-8 w-16 shrink-0 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Tab filter "Semua / Sedang Berjalan / Baru / Selesai" (bentuk `UnderlineTabList` pill). */
function LearningFilterTabsSkeleton() {
  return (
    <div
      aria-hidden
      className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg border-2 border-ink-900/10 bg-paper-paper p-1"
    >
      {LEARNING_FILTER_LABELS.map((label, index) => (
        <span
          key={label}
          className={cn(
            'inline-flex h-9 items-center justify-center rounded-md px-4 text-sm',
            index === 0 ? 'bg-brand-blue font-bold text-white' : 'font-semibold text-ink-500',
          )}
        >
          {label}
        </span>
      ))}
    </div>
  )
}

/**
 * Kerangka halaman "Kursus Saya": judul asli + tab filter + grid kartu kursus
 * (8 kartu = satu halaman penuh) — ukurannya sama dengan `LearningSection`.
 */
export function StudentLearningSkeleton() {
  return (
    <section role="status" aria-busy className="flex w-full flex-col gap-8">
      <span className="sr-only">Memuat daftar kursus...</span>

      <div className="flex flex-col gap-5">
        <PageHeader
          className={studentDashboardLayout.pageHeader}
          title="Kursus Saya"
          subtitle="Lanjutkan pembelajaran Anda untuk mencapai tujuan karir dan raih sertifikat."
        />
      </div>

      <LearningFilterTabsSkeleton />

      <div className={gridCardsClassName}>
        {Array.from({ length: LEARNING_SKELETON_CARDS }).map((_, index) => (
          <LearningCourseCardSkeleton key={index} />
        ))}
      </div>
    </section>
  )
}

/**
 * Fallback Suspense route `/dashboard/learning`: chrome sidebar/navbar siswa +
 * skeleton "Kursus Saya" (bukan skeleton generik tanpa sidebar).
 */
export function StudentLearningRouteFallback() {
  const sidebarUser = useSidebarUser('student')

  return (
    <AppSidebarProvider role="student" user={sidebarUser}>
      <div className={studentDashboardLayout.pageStack}>
        <StudentLearningSkeleton />
      </div>
    </AppSidebarProvider>
  )
}
