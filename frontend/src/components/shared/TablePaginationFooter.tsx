import { appKpiLabelClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'
import { Pagination } from './Pagination'

export interface TablePaginationFooterProps {
  page: number
  totalPages: number
  total?: number
  totalLabel?: string
  pageSize?: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  className?: string
}

export function TablePaginationFooter({
  page,
  totalPages,
  total,
  totalLabel = 'data',
  pageSize,
  pageSizeOptions = [5, 10, 25, 50],
  onPageChange,
  onPageSizeChange,
  className,
}: TablePaginationFooterProps) {
  const safeTotalPages = Math.max(totalPages, 1)

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-t border-line-light bg-paper-paper/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <p className={cn('text-sm', appKpiLabelClassName)}>
          Halaman <span className="font-semibold tabular-nums text-ink-900">{page}</span> dari{' '}
          <span className="font-semibold tabular-nums text-ink-900">{safeTotalPages}</span>
        </p>
        {total !== undefined ? (
          <>
            <span className="text-ink-300" aria-hidden>
              •
            </span>
            <p className={cn('text-sm', appKpiLabelClassName)}>
              Total <span className="font-semibold tabular-nums text-ink-900">{total}</span>{' '}
              {totalLabel}
            </p>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-4">
        {pageSize !== undefined && onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-500">Tampilkan:</span>
            <div
              role="group"
              aria-label="Pilihan jumlah data per halaman"
              className="inline-flex items-center gap-1 rounded-lg border-2 border-ink-900/10 bg-paper-paper p-1"
            >
              {pageSizeOptions.map((size) => {
                const isActive = pageSize === size
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onPageSizeChange(size)}
                    aria-pressed={isActive}
                    className={cn(
                      'flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs transition-colors',
                      isActive
                        ? 'bg-brand-blue font-bold text-white shadow-none'
                        : 'font-semibold text-ink-500 hover:bg-paper-white hover:text-ink-800',
                    )}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            <span className="text-xs font-medium text-ink-500">/ hal</span>
          </div>
        ) : null}

        <Pagination
          currentPage={page}
          totalPages={safeTotalPages}
          onPageChange={onPageChange}
          alwaysShow
          size="sm"
          className="mt-0"
        />
      </div>
    </div>
  )
}
