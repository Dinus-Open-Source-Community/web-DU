import { PageHeader } from '@/components/shared/Header'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { TablePaginationFooterSkeleton } from '@/components/shared/TablePaginationFooterSkeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { studentDashboardLayout } from '@/lib/layout/student-dashboard-layout'
import { cn } from '@/lib/utils'

const ASSIGNMENT_TAB_LABELS = [
  'Semua',
  'Belum dikumpulkan',
  'Menunggu review',
  'Selesai dinilai',
  'Terlambat',
] as const

/**
 * Satu baris tugas bentuk `AssignmentRowCard`:
 * kiri (kursus · modul/lesson · judul · deskripsi · chip) dan sidebar kanan
 * (kotak tenggat 96px + tombol aksi 44px), grid `1fr 300px`, min-h 220px.
 */
export function AssignmentRowCardSkeleton() {
  return (
    <article aria-hidden className="bg-paper-white">
      <div className="grid min-h-[220px] gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col justify-between gap-6 p-5 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <Skeleton className="h-5 w-44 max-w-full rounded-sm" />
                <Skeleton className="h-4 w-56 max-w-full rounded-sm" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Skeleton className="h-5 w-28 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            </div>

            <div className="min-w-0">
              <Skeleton className="h-7 w-3/4 max-w-full rounded-sm" />
              <Skeleton className="mt-2 h-6 w-full rounded-sm" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-[30px] w-24 rounded-lg" />
            <Skeleton className="h-[30px] w-24 rounded-lg" />
            <Skeleton className="h-[30px] w-28 rounded-lg" />
          </div>
        </div>

        <aside className="flex flex-col justify-between gap-4 border-t border-line-light bg-paper-paper/60 p-5 sm:p-6 lg:border-t-0 lg:border-l">
          {/* kotak tenggat */}
          <div className="rounded-xl border border-line-light bg-paper-white px-4 py-3.5">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 shrink-0 rounded-sm" />
              <Skeleton className="h-3 w-16 rounded-sm" />
            </div>
            <Skeleton className="mt-2 h-[22px] w-32 rounded-sm" />
            <Skeleton className="mt-1 h-4 w-36 rounded-sm" />
          </div>
          {/* tombol aksi */}
          <Skeleton className="h-[90px] w-full rounded-xl" />
        </aside>
      </div>
    </article>
  )
}

/** Daftar tugas: kartu berisi baris-baris + footer paginasi. */
export function StudentAssignmentListSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <section
      role="status"
      aria-busy
      className={cn(appCardClassName, 'flex w-full flex-col overflow-hidden')}
    >
      <span className="sr-only">Memuat daftar tugas...</span>
      <div className="flex flex-col divide-y divide-line-light">
        {Array.from({ length: Math.max(rows, 1) }).map((_, index) => (
          <AssignmentRowCardSkeleton key={index} />
        ))}
      </div>
      <TablePaginationFooterSkeleton />
    </section>
  )
}

/** Tab filter tugas (bentuk `UnderlineTabList` pill). */
function AssignmentTabsSkeleton() {
  return (
    <div
      aria-hidden
      className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg border-2 border-ink-900/10 bg-paper-paper p-1"
    >
      {ASSIGNMENT_TAB_LABELS.map((label, index) => (
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
 * Kerangka halaman "Tugas": judul asli + tab filter + daftar tugas (10 baris
 * = satu halaman penuh) + footer paginasi.
 */
export function StudentAssignmentsPageSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <section className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-5">
        <PageHeader
          className={studentDashboardLayout.pageHeader}
          title="Tugas"
          subtitle="Pantau deadline, status pengumpulan, dan nilai tugas dari seluruh kursus yang Anda ikuti."
        />
      </div>

      <div className="flex flex-col gap-4">
        <AssignmentTabsSkeleton />
      </div>

      <StudentAssignmentListSkeleton rows={rows} />
    </section>
  )
}

/**
 * Fallback Suspense route `/dashboard/assignments`: chrome sidebar/navbar siswa
 * + skeleton daftar tugas (bukan skeleton generik tanpa sidebar).
 */
export function StudentAssignmentsRouteFallback() {
  const sidebarUser = useSidebarUser('student')

  return (
    <AppSidebarProvider role="student" user={sidebarUser}>
      <div className={studentDashboardLayout.pageStack}>
        <StudentAssignmentsPageSkeleton />
      </div>
    </AppSidebarProvider>
  )
}
