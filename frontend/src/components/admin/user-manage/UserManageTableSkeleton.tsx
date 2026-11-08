import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TablePaginationFooterSkeleton } from '@/components/shared/TablePaginationFooterSkeleton'
import { appCardClassName, appCardHeaderClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'
import { getUserManageConfig, type UserManageKind } from '@/lib/user-manage/page-config'
import {
  getUserManageColumnSpecs,
  type UserManageColumnId,
} from '@/lib/user-manage/table-columns'

type UserManageTableSkeletonProps = {
  kind: UserManageKind
  /** Jumlah baris placeholder; samakan dengan `pageSize` agar tinggi tabel tidak melompat. */
  rows?: number
  message?: string
}

/**
 * Isi sel placeholder per kolom, mengikuti bentuk sel aslinya.
 * Baris administrator menampilkan label role (nama · email · role), sedangkan
 * siswa & mentor hanya nama · email — jadi tinggi barisnya dibuat sama.
 */
function buildCellSkeletons(
  hasRoleMeta: boolean,
): Record<UserManageColumnId, () => React.ReactElement> {
  return {
    // Avatar bulat + nama + email (+ label role untuk administrator)
    user: () => (
      <div className="flex min-w-[220px] items-center gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full sm:size-10" />
        <div className="min-w-0">
          <Skeleton className="h-5 w-28 rounded-md" />
          <Skeleton className="mt-1 h-4 w-44 max-w-[70%] rounded-md" />
          {hasRoleMeta ? <Skeleton className="mt-0.5 h-3 w-20 rounded-md" /> : null}
        </div>
      </div>
    ),
    // Status verifikasi: titik status + teks
    verified: () => (
      <span className="inline-flex items-center gap-2">
        <Skeleton className="size-1.5 shrink-0 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-sm" />
      </span>
    ),
    // Angka jumlah kursus
    courses: () => <Skeleton className="mx-auto h-3.5 w-5 rounded-sm" />,
    // Tanggal bergabung
    joined: () => <Skeleton className="h-3.5 w-20 rounded-md" />,
    // Tiga tombol aksi (Detail · Ubah role · Hapus)
    actions: () => (
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-14 rounded-sm" />
        <Skeleton className="h-8 w-24 rounded-sm" />
        <Skeleton className="h-8 w-16 rounded-sm" />
      </div>
    ),
  }
}

/**
 * Placeholder berbentuk tabel manajemen user: header kolom asli + baris
 * placeholder + footer paginasi. Kelas layout sama dengan `AdminDataTable`
 * (termasuk `TableHead`/`TableRow` shadcn), jadi saat data datang tidak ada
 * pergeseran layout dan bentuknya persis tabel yang ditampilkan.
 */
export function UserManageTableSkeleton({
  kind,
  rows = 10,
  message,
}: UserManageTableSkeletonProps) {
  const config = getUserManageConfig(kind)
  const columns = getUserManageColumnSpecs(kind)
  const cellSkeletons = buildCellSkeletons(kind === 'admin')
  const rowIndexes = Array.from({ length: Math.max(rows, 1) }, (_, index) => index)

  return (
    <section
      role="status"
      aria-busy
      className={cn('flex flex-col overflow-hidden', appCardClassName)}
    >
      <span className="sr-only">{message ?? `Memuat ${config.navLabel.toLowerCase()}...`}</span>

      <Table className="text-sm">
        <TableHeader className={cn('bg-paper-paper', appCardHeaderClassName)}>
          <TableRow className="border-ink-900/10 hover:bg-paper-paper">
            {columns.map((col) => (
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
            <tr
              key={index}
              aria-hidden
              className="border-b border-line-light last:border-b-0"
            >
              {columns.map((col) => {
                const CellSkeleton = cellSkeletons[col.id]
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

      {/* Footer paginasi: "Halaman x dari y • Total n data" + pilihan page size + tombol halaman */}
      <TablePaginationFooterSkeleton />
    </section>
  )
}
