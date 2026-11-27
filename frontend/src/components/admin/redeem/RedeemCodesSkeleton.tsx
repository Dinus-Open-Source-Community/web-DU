import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TablePaginationFooterSkeleton } from '@/components/shared/TablePaginationFooterSkeleton'
import {
  appCardClassName,
  appCardHeaderClassName,
} from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

export type RedeemCodesSkeletonVariant = 'admin' | 'mentor'

type ColumnSpec = {
  id: string
  header: string
  align?: 'right' | 'center'
}

/** Label & urutan kolom mengikuti `columns` di halaman aslinya. */
const COLUMN_SPECS: Record<RedeemCodesSkeletonVariant, ColumnSpec[]> = {
  mentor: [
    { id: 'code', header: 'Kode Redeem' },
    { id: 'course', header: 'Kursus' },
    { id: 'target', header: 'Target Siswa' },
    { id: 'usage', header: 'Penggunaan', align: 'right' },
    { id: 'status', header: 'Status' },
    { id: 'expires', header: 'Masa Berlaku' },
    { id: 'actions', header: 'Aksi', align: 'right' },
  ],
  admin: [
    { id: 'code', header: 'Kode Voucher' },
    { id: 'course', header: 'Kursus' },
    { id: 'target', header: 'Target Siswa' },
    { id: 'usage', header: 'Penggunaan', align: 'right' },
    { id: 'status', header: 'Status' },
    { id: 'expires_at', header: 'Masa Berlaku', align: 'right' },
    { id: 'created_at', header: 'Dibuat', align: 'right' },
    { id: 'actions', header: 'Aksi', align: 'right' },
  ],
}

/**
 * Placeholder judul halaman + dua tombol aksi (Segarkan, Buat Kode Redeem).
 * Tinggi tombol mengikuti varian: admin `size="sm"`+default, mentor `min-h-11`.
 */
export function RedeemCodesHeaderSkeleton({
  variant,
}: {
  variant: RedeemCodesSkeletonVariant
}) {
  const isMentor = variant === 'mentor'
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-5 w-80 max-w-full rounded-md" />
      </div>
      <div className={cn('flex shrink-0', isMentor ? 'gap-2' : 'items-center gap-2.5')}>
        <Skeleton
          className={cn(
            'rounded-xl border-2 border-ink-900/10',
            isMentor ? 'h-11 w-24' : 'h-9 w-20',
          )}
        />
        <Skeleton
          className={cn(
            'rounded-xl',
            isMentor ? 'h-11 w-44' : 'h-10 w-40',
          )}
        />
      </div>
    </div>
  )
}

/**
 * Placeholder card filter: admin = search + 2 select sebaris;
 * mentor = grid 3 field berlabel (search, kursus, status).
 */
export function RedeemCodesFilterSkeleton({
  variant,
}: {
  variant: RedeemCodesSkeletonVariant
}) {
  if (variant === 'admin') {
    return (
      <div
        aria-hidden
        className={cn(
          'p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3',
          appCardClassName,
        )}
      >
        <Skeleton className="h-10 w-full rounded-xl sm:flex-1" />
        <Skeleton className="h-10 w-full rounded-xl sm:w-36" />
        <Skeleton className="h-10 w-full rounded-xl sm:w-32" />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className={cn(
        appCardClassName,
        'grid min-w-0 gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)]',
      )}
    >
      {[28, 40, 24].map((labelWidth) => (
        <div key={labelWidth} className="min-w-0 space-y-1.5">
          <Skeleton className="h-3.5 rounded-md" style={{ width: labelWidth }} />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}

/** Placeholder sel mengikuti bentuk sel asli per kolom. */
function cellSkeleton(id: string, variant: RedeemCodesSkeletonVariant) {
  const isMentor = variant === 'mentor'
  switch (id) {
    case 'code':
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton
            className={cn('shrink-0', isMentor ? 'size-11 rounded-lg' : 'size-7 rounded-sm')}
          />
        </div>
      )
    case 'course':
      return <Skeleton className="h-4 w-36 max-w-full rounded-md" />
    case 'target':
      return isMentor ? (
        <div className="max-w-64">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="mt-1.5 h-3.5 w-40 max-w-[80%] rounded-md" />
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-2.5">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="mt-1 h-3.5 w-36 max-w-[70%] rounded-md" />
          </div>
        </div>
      )
    case 'usage':
      return <Skeleton className="ml-auto h-4 w-14 rounded-md" />
    case 'status':
      return (
        <span className="inline-flex items-center gap-2">
          {!isMentor && <Skeleton className="size-1.5 shrink-0 rounded-full" />}
          <Skeleton className="h-3.5 w-16 rounded-md" />
        </span>
      )
    case 'expires':
    case 'expires_at':
    case 'created_at':
      return <Skeleton className="ml-auto h-3.5 w-24 rounded-md" />
    case 'actions':
      return (
        <div className="flex justify-end">
          <Skeleton
            className={cn('shrink-0', isMentor ? 'size-11 rounded-lg' : 'size-7 rounded-sm')}
          />
        </div>
      )
    default:
      return <Skeleton className="h-4 w-24 rounded-md" />
  }
}

/**
 * Placeholder tabel kode redeem: header kolom asli (`AdminDataTable`
 * variant admin) + baris placeholder + footer paginasi — tinggi baris dan
 * kelas sel sama dengan tabel aktual supaya tidak ada pergeseran layout.
 */
export function RedeemCodesTableSkeleton({
  variant,
  rows = 10,
  message,
}: {
  variant: RedeemCodesSkeletonVariant
  /** Samakan dengan `pageSize` awal (10) agar tinggi tabel tidak melompat. */
  rows?: number
  message?: string
}) {
  const columns = COLUMN_SPECS[variant]
  const rowIndexes = Array.from({ length: Math.max(rows, 1) }, (_, index) => index)

  return (
    <section
      role="status"
      aria-busy
      className={cn('flex flex-col overflow-hidden', appCardClassName)}
    >
      <span className="sr-only">{message ?? 'Memuat kode redeem...'}</span>
      <Table className="text-sm">
        <TableHeader className={cn('bg-transparent', appCardHeaderClassName)}>
          <TableRow
            className={cn(
              'border-ink-900/10 hover:bg-paper-paper',
              'h-10 border-line-light hover:bg-transparent',
            )}
          >
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className={cn(
                  'h-10 px-4 py-2 text-xs font-semibold normal-case tracking-normal text-ink-500',
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
              className="border-b border-line-light last:border-b-0 hover:bg-paper-paper/50"
            >
              {columns.map((col) => (
                <td
                  key={col.id}
                  className={cn(
                    'px-4 py-3 align-middle text-ink-700',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  {cellSkeleton(col.id, variant)}
                </td>
              ))}
            </tr>
          ))}
        </TableBody>
      </Table>
      <TablePaginationFooterSkeleton />
    </section>
  )
}

/**
 * Kerangka utuh halaman Kode Redeem (judul + tombol + filter + tabel).
 * Dipakai saat load awal supaya transisi ke konten nyata tanpa pergeseran.
 */
export function RedeemCodesPageSkeleton({
  variant,
  rows,
}: {
  variant: RedeemCodesSkeletonVariant
  rows?: number
}) {
  return (
    <>
      <RedeemCodesHeaderSkeleton variant={variant} />
      <RedeemCodesFilterSkeleton variant={variant} />
      <RedeemCodesTableSkeleton variant={variant} rows={rows} />
    </>
  )
}
