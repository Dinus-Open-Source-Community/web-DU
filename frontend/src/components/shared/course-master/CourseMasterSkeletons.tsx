import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TablePaginationFooterSkeleton } from '@/components/shared/TablePaginationFooterSkeleton'
import { PageHeader } from '@/components/shared/Header'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { COURSE_MASTER_LABELS, type CourseMasterKind } from '@/lib/course-master/types'
import {
  COURSE_MASTER_COLUMN_SPECS,
  type CourseMasterColumnId,
} from '@/lib/course-master/table-columns'
import { appCardClassName, appCardHeaderClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

type CourseMasterTableSkeletonProps = {
  rows?: number
  message?: string
}

/** Isi sel placeholder per kolom, mengikuti bentuk sel aslinya. */
const CELL_SKELETONS: Record<CourseMasterColumnId, () => React.ReactElement> = {
  // Nama (semibold) + deskripsi opsional
  name: () => (
    <div className="min-w-[180px]">
      <Skeleton className="h-5 w-40 rounded-md" />
      <Skeleton className="mt-0.5 h-4 w-64 max-w-full rounded-md" />
    </div>
  ),
  // Titik status + teks (Aktif/Nonaktif)
  status: () => (
    <span className="inline-flex items-center gap-2">
      <Skeleton className="size-1.5 shrink-0 rounded-full" />
      <Skeleton className="h-3 w-12 rounded-sm" />
    </span>
  ),
  // Angka jumlah kursus
  courses: () => <Skeleton className="mx-auto h-3.5 w-4 rounded-sm" />,
  // Tanggal diperbarui
  updated: () => <Skeleton className="h-3.5 w-24 rounded-md" />,
  // Tombol Edit · Hapus
  actions: () => (
    <div className="flex justify-end gap-2">
      <Skeleton className="h-8 w-[68px] rounded-sm" />
      <Skeleton className="h-8 w-[76px] rounded-sm" />
    </div>
  ),
}

/**
 * Placeholder berbentuk tabel kategori/tipe kursus: header kolom asli + baris
 * placeholder + footer paginasi, memakai kelas layout yang sama dengan
 * `AdminDataTable` sehingga tidak ada pergeseran layout saat data datang.
 */
export function CourseMasterTableSkeleton({
  rows = 10,
  message = 'Memuat data...',
}: CourseMasterTableSkeletonProps) {
  const rowIndexes = Array.from({ length: Math.max(rows, 1) }, (_, index) => index)

  return (
    <section
      role="status"
      aria-busy
      className={cn('flex flex-col overflow-hidden', appCardClassName)}
    >
      <span className="sr-only">{message}</span>

      <Table className="text-sm">
        <TableHeader className={cn('bg-paper-paper', appCardHeaderClassName)}>
          <TableRow className="border-ink-900/10 hover:bg-paper-paper">
            {COURSE_MASTER_COLUMN_SPECS.map((col) => (
              <TableHead
                key={col.id}
                className={cn(
                  'px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rowIndexes.map((index) => (
            <tr key={index} aria-hidden className="border-b border-line-light last:border-b-0">
              {COURSE_MASTER_COLUMN_SPECS.map((col) => {
                const CellSkeleton = CELL_SKELETONS[col.id]
                return (
                  <td
                    key={col.id}
                    className={cn(
                      'px-5 py-3.5 align-middle',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    <CellSkeleton />
                  </td>
                )
              })}
            </tr>
          ))}
        </TableBody>
      </Table>

      <TablePaginationFooterSkeleton />
    </section>
  )
}

/**
 * Kerangka utuh halaman kategori/tipe kursus: judul asli + subjudul + skeleton
 * tabel. Dipakai sebagai fallback Suspense route lazy sekaligus kondisi loading
 * di dalam `CourseMasterManagementPanel`, jadi saat refresh hanya ada satu
 * skeleton dan tidak ada pergeseran layout.
 */
export function CourseMasterPageSkeleton({
  kind,
  rows,
}: {
  kind: CourseMasterKind
  rows?: number
}) {
  const labels = COURSE_MASTER_LABELS[kind]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <PageHeader
          title={labels.pageTitle}
          subtitle={labels.pageSubtitle}
          className="mb-0 min-w-0 flex-1 space-y-2"
        />
        <Skeleton aria-hidden className="h-11 w-[187px] shrink-0 self-start rounded-sm" />
      </div>

      <CourseMasterTableSkeleton rows={rows} />
    </div>
  )
}

/** Fallback Suspense route kategori/tipe kursus: chrome (sidebar + navbar) + skeleton. */
export function CourseMasterRouteFallback({ kind }: { kind: CourseMasterKind }) {
  const { role, user } = useAdminAppSidebar()

  return (
    <AppSidebarProvider role={role} user={user}>
      <AdminPageShell>
        <CourseMasterPageSkeleton kind={kind} />
      </AdminPageShell>
    </AppSidebarProvider>
  )
}
