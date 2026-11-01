import { Skeleton } from '@/components/ui/skeleton'

/**
 * Placeholder untuk `TablePaginationFooter` — dipakai semua skeleton tabel
 * supaya tinggi footer dan posisi kontrol tidak bergeser saat data masuk.
 */
export function TablePaginationFooterSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-4 border-t border-line-light bg-paper-paper/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="size-1 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-16 rounded-md" />
          <Skeleton className="h-9 w-[152px] rounded-lg" />
          <Skeleton className="h-3.5 w-9 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-[38px] rounded-lg" />
          <Skeleton className="h-9 w-[60px] rounded-lg" />
          <Skeleton className="size-[38px] rounded-lg" />
        </div>
      </div>
    </div>
  )
}
