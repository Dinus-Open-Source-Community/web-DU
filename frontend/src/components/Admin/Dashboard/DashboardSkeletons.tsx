import type { ReactNode } from 'react'

import { PageHeader } from '@/components/shared/Header'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { useAuth } from '@/providers/auth-provider'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { dashboardPageStackClassName } from '@/lib/layout/page-layout'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  KPI                                                                       */
/* -------------------------------------------------------------------------- */

/** Satu kartu KPI: label · nilai · keterangan tren (bentuk `StatCard variant="kpi"`). */
function KpiCardSkeleton() {
  return (
    <div className="flex w-full flex-col items-start gap-2.5 rounded-xl border border-line-light border-l-4 border-l-ink-900/10 bg-paper-white p-6">
      <div className="flex w-full flex-col gap-1">
        <Skeleton className="h-5 w-24 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <Skeleton className="h-5 w-40 max-w-full rounded-md" />
    </div>
  )
}

/** Baris 4 kartu KPI (grid sama dengan `KpiGrid`). */
export function AdminKpiCardsSkeleton() {
  return (
    <section
      role="status"
      aria-busy
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <span className="sr-only">Memuat ringkasan KPI...</span>
      {Array.from({ length: 4 }).map((_, index) => (
        <KpiCardSkeleton key={index} />
      ))}
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Kartu analitik                                                            */
/* -------------------------------------------------------------------------- */

function AnalyticsCardShell({ children }: { children: ReactNode }) {
  return <div className={cn(appCardClassName, 'p-4 sm:p-6')}>{children}</div>
}

/** Header kartu: ikon + judul + subjudul. */
function AnalyticsCardHeaderSkeleton({ subtitleWidth = 'w-64' }: { subtitleWidth?: string }) {
  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 shrink-0 rounded-sm" />
          <Skeleton className="h-5 w-44 rounded-md" />
        </div>
        <Skeleton className={cn('h-5 max-w-full rounded-md', subtitleWidth)} />
      </div>
    </div>
  )
}

/** Tabel dalam kartu (TopCourses & RecentEnrollments) — header 36px, baris 45px. */
function InnerTableSkeleton({
  columns,
  rows,
}: {
  columns: Array<{ widthClassName: string; align?: 'right'; barClassName: string }>
  rows: number
}) {
  const rowIndexes = Array.from({ length: rows }, (_, index) => index)

  return (
    <div className="hidden overflow-hidden rounded-lg border border-line-light bg-paper-white md:block">
      <div className="relative w-full overflow-x-auto">
        <table className="w-full min-w-[540px] caption-bottom text-left text-sm">
          <thead>
            <tr className="border-b border-line-light text-ink-500">
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className={cn(
                    'h-9 whitespace-nowrap px-4 py-2 text-xs font-medium text-ink-500',
                    col.align === 'right' ? 'text-right' : 'text-left',
                    col.widthClassName,
                  )}
                >
                  <Skeleton className="h-3.5 w-16 rounded-sm" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowIndexes.map((index) => (
              <tr key={index} aria-hidden className="border-b border-line-light last:border-b-0">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 align-middle">
                    <Skeleton
                      className={cn(
                        'h-5 rounded-md',
                        col.align === 'right' && 'ml-auto',
                        col.barClassName,
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Daftar ringkas versi mobile (mengikuti `md:hidden` pada kartu aslinya). */
function MobileListSkeleton({ rows }: { rows: number }) {
  return (
    <ul className="flex flex-col divide-y divide-line-light md:hidden">
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} aria-hidden className="py-3 first:pt-0 last:pb-0">
          <Skeleton className="h-5 w-40 rounded-md" />
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Skeleton className="h-4 w-16 rounded-sm" />
            <Skeleton className="h-4 w-16 rounded-sm" />
            <Skeleton className="ml-auto h-4 w-12 rounded-sm" />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Kartu "Kursus Top Enrollment": judul + tabel 4 kolom (5 baris). */
export function TopCoursesCardSkeleton() {
  return (
    <AnalyticsCardShell>
      <AnalyticsCardHeaderSkeleton subtitleWidth="w-[19rem]" />
      <InnerTableSkeleton
        rows={5}
        columns={[
          { widthClassName: 'w-[46%]', barClassName: 'w-40' },
          { widthClassName: 'w-[18%]', align: 'right', barClassName: 'w-6' },
          { widthClassName: 'w-[18%]', align: 'right', barClassName: 'w-6' },
          { widthClassName: 'w-[18%]', align: 'right', barClassName: 'w-10' },
        ]}
      />
      <MobileListSkeleton rows={5} />
    </AnalyticsCardShell>
  )
}

/** Kartu "Distribusi Progress Siswa": 4 baris status + progress bar. */
export function StudentProgressCardSkeleton() {
  return (
    <AnalyticsCardShell>
      <AnalyticsCardHeaderSkeleton subtitleWidth="w-56" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} aria-hidden className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-1.5 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-sm" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-14 rounded-sm" />
                <Skeleton className="size-1 rounded-full" />
                <Skeleton className="h-4 w-10 rounded-sm" />
              </div>
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </AnalyticsCardShell>
  )
}

/** Kartu "Mentor Paling Aktif": 4 baris nama + jumlah kursus. */
export function MentorActivityCardSkeleton() {
  return (
    <AnalyticsCardShell>
      <AnalyticsCardHeaderSkeleton subtitleWidth="w-72" />
      <div className="divide-y divide-line-light">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            aria-hidden
            className="flex items-center justify-between py-3 first:pt-1 last:pb-1"
          >
            <div className="min-w-0 flex-1 pr-4">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="mt-1 h-4 w-24 rounded-sm" />
            </div>
            <Skeleton className="h-5 w-14 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </AnalyticsCardShell>
  )
}

/** Kartu "Pendaftaran Terbaru": judul + tabel 3 kolom (10 baris). */
export function RecentEnrollmentsCardSkeleton() {
  return (
    <AnalyticsCardShell>
      <AnalyticsCardHeaderSkeleton subtitleWidth="w-[17rem]" />
      <InnerTableSkeleton
        rows={10}
        columns={[
          { widthClassName: 'w-[35%]', barClassName: 'w-32' },
          { widthClassName: 'w-[45%]', barClassName: 'w-40' },
          { widthClassName: 'w-[20%]', align: 'right', barClassName: 'w-14' },
        ]}
      />
      <MobileListSkeleton rows={10} />
    </AnalyticsCardShell>
  )
}

/* -------------------------------------------------------------------------- */
/*  Halaman                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Kerangka dasbor admin: judul asli + 4 kartu KPI + grid 2×2 kartu analitik.
 * Bentuknya sama dengan tampilan setelah data masuk, jadi tidak ada pergeseran
 * layout saat refresh.
 */
export function AdminDashboardSkeleton({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return (
    <div className={dashboardPageStackClassName}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          className="mb-0 space-y-1"
          title={`Dasbor ${isSuperAdmin ? 'Super Admin' : 'Admin'}`}
          subtitle="Ringkasan performa platform, aktivitas kursus, dan progres belajar siswa."
        />
      </div>

      <AdminKpiCardsSkeleton />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopCoursesCardSkeleton />
        <StudentProgressCardSkeleton />
        <MentorActivityCardSkeleton />
        <RecentEnrollmentsCardSkeleton />
      </div>
    </div>
  )
}

/**
 * Fallback Suspense route `/dashboard` untuk admin/super admin: skeleton dasbor
 * lengkap dengan chrome (sidebar + navbar) — bukan skeleton generik tanpa
 * sidebar. Pemilihan per-role ada di `components/dashboard/DashboardRouteFallback`.
 */
export function AdminDashboardRouteFallback() {
  const { role } = useAuth()
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()

  return (
    <AppSidebarProvider role={shellRole} user={sidebarUser}>
      <AdminDashboardSkeleton isSuperAdmin={role === 'super_admin'} />
    </AppSidebarProvider>
  )
}
