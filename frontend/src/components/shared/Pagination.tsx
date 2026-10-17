import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  /** @deprecated Semua variant memakai token app shell (ink/paper). */
  variant?: 'default' | 'admin'
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="rounded-lg border-2 border-ink-900/10 bg-paper-white p-2 text-ink-600 transition-all hover:border-ink-900/20 hover:bg-paper-paper disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Halaman sebelumnya">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex w-max max-w-full items-center gap-1 overflow-x-auto rounded-lg border-2 border-ink-900/10 bg-paper-paper p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Array.from({ length: totalPages }).map((_, i) => {
          const isActive = currentPage === i + 1
          return (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              aria-label={`Halaman ${i + 1}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg px-2 text-sm transition-colors',
                isActive
                  ? 'bg-brand-blue font-bold text-ink-900'
                  : 'font-medium text-ink-500 hover:bg-paper-white hover:text-ink-800',
              )}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="rounded-lg border-2 border-ink-900/10 bg-paper-white p-2 text-ink-600 transition-all hover:border-ink-900/20 hover:bg-paper-paper disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Halaman berikutnya">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
