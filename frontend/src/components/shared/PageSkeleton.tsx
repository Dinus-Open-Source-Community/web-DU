import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type PageSkeletonProps = {
  message?: string
  className?: string
}

export function PageSkeleton({ message = 'Memuat...', className }: PageSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy
      className={cn('flex w-full flex-col gap-6 py-6', className)}
    >
      <span className="sr-only">{message}</span>
      <div className="space-y-3">
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40" />
        ))}
      </div>
    </div>
  )
}
