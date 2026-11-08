import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  /** @deprecated Semua variant memakai token app shell (ink/paper). */
  variant?: 'default' | 'admin'
  /** Jika true, pagination tetap ditampilkan meskipun totalPages <= 1 */
  alwaysShow?: boolean
  size?: 'sm' | 'default'
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  alwaysShow = false,
  size = 'default',
}: PaginationProps) => {
  const safeTotalPages = Math.max(1, totalPages)
  if (totalPages <= 1 && !alwaysShow) return null

  const isSm = size === 'sm'

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className={cn(
          'rounded-lg border-2 border-ink-900/10 bg-paper-white text-ink-600 transition-all hover:border-ink-900/20 hover:bg-paper-paper disabled:cursor-not-allowed disabled:opacity-50',
          isSm ? 'flex size-[38px] items-center justify-center' : 'p-2',
        )}
        aria-label="Halaman sebelumnya">
        <ChevronLeft className={isSm ? 'size-4' : 'h-5 w-5'} />
      </button>

      <div
        className={cn(
          'flex w-max max-w-full items-center gap-1 overflow-x-auto rounded-lg border-2 border-ink-900/10 bg-paper-paper [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          isSm ? 'p-1' : 'p-1.5',
        )}>
        {Array.from({ length: safeTotalPages }).map((_, i) => {
          const isActive = currentPage === i + 1
          return (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              aria-label={`Halaman ${i + 1}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'shrink-0 items-center justify-center transition-colors',
                isSm
                  ? 'flex h-7 min-w-7 rounded-md px-2 text-xs'
                  : 'flex h-9 min-w-9 rounded-lg px-2 text-sm',
                isActive
                  ? 'bg-brand-blue font-bold text-white'
                  : 'font-semibold text-ink-500 hover:bg-paper-white hover:text-ink-800',
              )}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
        disabled={currentPage >= safeTotalPages}
        className={cn(
          'rounded-lg border-2 border-ink-900/10 bg-paper-white text-ink-600 transition-all hover:border-ink-900/20 hover:bg-paper-paper disabled:cursor-not-allowed disabled:opacity-50',
          isSm ? 'flex size-[38px] items-center justify-center' : 'p-2',
        )}
        aria-label="Halaman berikutnya">
        <ChevronRight className={isSm ? 'size-4' : 'h-5 w-5'} />
      </button>
    </div>
  )
}
