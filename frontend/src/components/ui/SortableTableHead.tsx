import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { TableHead } from '@/components/ui/table'
import { SortDirection } from '@/lib/types'

interface SortableTableHeadProps {
  label: string
  sortKey: string
  currentSortKey: string
  sortDirection: SortDirection
  onSort: (key: string) => void
}

export function SortableTableHead({ label, sortKey, currentSortKey, sortDirection, onSort }: SortableTableHeadProps) {
  const isActive = currentSortKey === sortKey

  const SortIcon = () => {
    if (!isActive) {
      return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
    }

    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-slate-600" />
    ) : (
      <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-slate-600" />
    )
  }

  return (
    <TableHead className="px-4 py-3 hover:bg-slate-100/70">
      <button
        type="button"
        className="flex w-full items-center text-[11px] font-semibold uppercase tracking-wide text-slate-600"
        onClick={() => onSort(sortKey)}>
        {label} <SortIcon />
      </button>
    </TableHead>
  )
}
