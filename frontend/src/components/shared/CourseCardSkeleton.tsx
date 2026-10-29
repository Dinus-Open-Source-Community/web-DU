import { Skeleton } from '@/components/ui/skeleton'
import { appCourseCardClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

/**
 * Placeholder berbentuk kartu kursus. Dipakai saat daftar kursus masih dimuat
 * agar tidak jatuh ke empty state ("Tidak ada kursus") sebelum data tiba.
 */
export function CourseCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(appCourseCardClassName, 'pointer-events-none', className)}
    >
      {/* 1. Area cover */}
      <Skeleton className="h-36 w-full shrink-0 rounded-t-xl rounded-b-none border-b border-line-light sm:h-40" />

      {/* 2. Body */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="mb-2.5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-4 w-14 rounded-md" />
          </div>
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="mt-1 h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-2/3 rounded-md" />
        </div>

        {/* 3. Statistik + aksi */}
        <div className="mt-auto space-y-2.5 border-t border-line-light pt-2.5">
          <Skeleton className="h-3.5 w-40 rounded-md" />
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

type CourseCardSkeletonGridProps = {
  count?: number
  className?: string
}

/** Grid skeleton kartu kursus, mengikuti kolom yang sama dengan daftar asli. */
export function CourseCardSkeletonGrid({ count = 8, className }: CourseCardSkeletonGridProps) {
  return (
    <div
      role="status"
      aria-busy
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      <span className="sr-only">Memuat daftar kursus...</span>
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  )
}
