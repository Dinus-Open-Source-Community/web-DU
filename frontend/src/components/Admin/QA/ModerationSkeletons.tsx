import { useSearchParams } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/Header'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { TablePaginationFooterSkeleton } from '@/components/shared/TablePaginationFooterSkeleton'
import { useAdminAppSidebar, useSidebarUser } from '@/hooks/use-sidebar-user'
import { useAuth } from '@/providers/auth-provider'
import { appCardClassName, appCardHeaderClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

export type ModerationSection = 'reviews' | 'qa'

const REVIEW_COLUMNS = ['Siswa', 'Kursus', 'Rating', 'Ulasan', 'Tanggal', 'Balasan']

/**
 * Skeleton tabel ulasan: kolom sama dengan `ReviewsPanel`
 * (Siswa · Kursus · Rating · Ulasan · Tanggal · Balasan) + footer paginasi.
 */
export function ReviewsTableSkeleton({
  rows = 10,
  message = 'Memuat ulasan...',
}: {
  rows?: number
  message?: string
}) {
  const rowIndexes = Array.from({ length: Math.max(rows, 1) }, (_, index) => index)

  return (
    <section role="status" aria-busy className={cn(appCardClassName, 'w-full overflow-hidden')}>
      <span className="sr-only">{message}</span>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full text-left">
          <thead className={cn('bg-paper-paper', appCardHeaderClassName)}>
            <tr className="border-b border-line-light text-xs font-medium text-ink-500">
              {REVIEW_COLUMNS.map((label) => (
                <th key={label} scope="col" className="px-4 py-3">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowIndexes.map((index) => (
              <tr
                key={index}
                aria-hidden
                className="border-b border-line-light align-top text-sm last:border-b-0"
              >
                {/* Siswa */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </div>
                </td>
                {/* Kursus */}
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-32 max-w-full rounded-md" />
                </td>
                {/* Rating */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Skeleton key={starIndex} className="size-3.5 rounded-sm" />
                      ))}
                    </div>
                    <Skeleton className="h-3 w-6 rounded-sm" />
                  </div>
                </td>
                {/* Ulasan */}
                <td className="px-4 py-4">
                  <div className="min-w-56 space-y-1.5">
                    <Skeleton className="h-3 w-full rounded-sm" />
                    <Skeleton className="h-3 w-[92%] rounded-sm" />
                    <Skeleton className="h-3 w-[70%] rounded-sm" />
                  </div>
                </td>
                {/* Tanggal */}
                <td className="px-4 py-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-16 rounded-sm" />
                    <Skeleton className="h-3 w-10 rounded-sm" />
                  </div>
                </td>
                {/* Balasan: kotak balasan (mayoritas baris sudah dibalas) */}
                <td className="px-4 py-4">
                  <div className="space-y-1.5 rounded-lg border border-line-light bg-paper-paper/70 p-3">
                    <Skeleton className="h-3 w-28 rounded-sm" />
                    <Skeleton className="h-2.5 w-full rounded-sm" />
                    <Skeleton className="h-2.5 w-[92%] rounded-sm" />
                    <Skeleton className="h-2.5 w-[86%] rounded-sm" />
                    <Skeleton className="h-2.5 w-[60%] rounded-sm" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePaginationFooterSkeleton />
    </section>
  )
}

/**
 * Skeleton forum tanya jawab (bukan tabel): daftar baris berisi avatar, judul,
 * status, cuplikan pertanyaan, dan baris meta — sama seperti `QaForum`.
 */
export function QaForumSkeleton({
  rows = 10,
  message = 'Memuat tanya jawab...',
}: {
  rows?: number
  message?: string
}) {
  const rowIndexes = Array.from({ length: Math.max(rows, 1) }, (_, index) => index)

  return (
    <section
      role="status"
      aria-busy
      className={cn(appCardClassName, 'flex w-full flex-col overflow-hidden')}
    >
      <span className="sr-only">{message}</span>

      <div className="flex flex-col divide-y divide-line-light">
        {rowIndexes.map((index) => (
          <div key={index} aria-hidden className="flex w-full items-start gap-4 p-5">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <Skeleton className="h-6 w-72 max-w-full rounded-md" />
                <span className="inline-flex items-center gap-2">
                  <Skeleton className="size-1.5 shrink-0 rounded-full" />
                  <Skeleton className="h-3 w-16 rounded-sm" />
                </span>
              </div>
              <Skeleton className="h-4 w-[85%] rounded-md" />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Skeleton className="h-4 w-20 rounded-sm" />
                <Skeleton className="size-1 rounded-full" />
                <Skeleton className="h-4 w-28 rounded-sm" />
                <Skeleton className="size-1 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-sm" />
                <Skeleton className="size-1 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <TablePaginationFooterSkeleton />
    </section>
  )
}

function ModerationTabsSkeleton({ active }: { active: ModerationSection }) {
  const items: Array<{ value: ModerationSection; label: string }> = [
    { value: 'reviews', label: 'Ulasan' },
    { value: 'qa', label: 'Tanya Jawab' },
  ]

  return (
    <div
      aria-hidden
      className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg border-2 border-ink-900/10 bg-paper-paper p-1"
    >
      {items.map((item) => (
        <span
          key={item.value}
          className={cn(
            'inline-flex h-9 items-center justify-center rounded-md px-4 text-sm',
            item.value === active
              ? 'bg-brand-blue font-bold text-white'
              : 'font-semibold text-ink-500',
          )}
        >
          {item.label}
        </span>
      ))}
    </div>
  )
}

/**
 * Kerangka halaman Ulasan & Tanya Jawab: judul asli + tab + skeleton sesuai
 * section aktif (`reviews` = tabel, `qa` = daftar forum).
 */
export function ReviewsQaPageSkeleton({ section }: { section: ModerationSection }) {
  const { role } = useAuth()
  const isMentor = role === 'mentor'

  return (
    <div className="relative z-[1] flex w-full flex-col gap-6">
      <PageHeader
        className="mb-0 space-y-1.5"
        title="Ulasan & Tanya Jawab"
        subtitle={
          isMentor
            ? 'Balas ulasan dan tanya jawab pada kursus yang Anda bimbing.'
            : 'Pantau ulasan peserta, berikan balasan, dan tindak lanjuti diskusi tanya jawab secara terpusat.'
        }
      />
      <div className="flex flex-col gap-4">
        <ModerationTabsSkeleton active={section} />
        {section === 'qa' ? <QaForumSkeleton /> : <ReviewsTableSkeleton />}
      </div>
    </div>
  )
}

/** Fallback Suspense route Ulasan & Tanya Jawab: chrome (sidebar + navbar) + skeleton. */
export function ReviewsQaRouteFallback() {
  const { role: authRole } = useAuth()
  const isMentor = authRole === 'mentor'
  const adminSidebar = useAdminAppSidebar()
  const mentorUser = useSidebarUser('mentor')
  const shellRole = isMentor ? 'mentor' : adminSidebar.role
  const sidebarUser = isMentor ? mentorUser : adminSidebar.user

  const [searchParams] = useSearchParams()
  const section: ModerationSection = searchParams.get('section') === 'qa' ? 'qa' : 'reviews'

  return (
    <AppSidebarProvider role={shellRole} user={sidebarUser}>
      <ReviewsQaPageSkeleton section={section} />
    </AppSidebarProvider>
  )
}
