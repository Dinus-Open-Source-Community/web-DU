import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DataTablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function DataTablePagination({ currentPage, totalPages, onPageChange }: DataTablePaginationProps) {
  if (totalPages <= 1) {
    return (
      <div className="text-xs font-medium text-slate-500">
        Halaman {currentPage} dari {totalPages}
      </div>
    )
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs font-medium text-slate-500">
        Halaman {currentPage} dari {totalPages}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 rounded-md border-slate-300 px-2.5 text-xs text-slate-600 shadow-none hover:bg-slate-100">
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>

        {pageNumbers.map((page) => {
          const isActive = currentPage === page
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`h-8 min-w-8 rounded-md border px-2 text-xs font-medium ${
                isActive ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
              }`}>
              {page}
            </button>
          )
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-8 rounded-md border-slate-300 px-2.5 text-xs text-slate-600 shadow-none hover:bg-slate-100">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
