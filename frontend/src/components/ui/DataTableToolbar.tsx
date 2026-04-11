interface DataTableToolbarProps {
  showingStart: number
  showingEnd: number
  totalItems: number
  rowsPerPage: number
  onRowsPerPageChange: (value: number) => void
  rowsPerPageOptions?: number[]
  itemLabel?: string
}

export function DataTableToolbar({
  showingStart,
  showingEnd,
  totalItems,
  rowsPerPage,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 15],
  itemLabel = 'transaksi',
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs font-medium text-slate-500">
        Menampilkan {showingStart} - {showingEnd} dari {totalItems} {itemLabel}
      </p>

      <div className="flex items-center gap-2">
        <label htmlFor="rows-per-page" className="text-xs font-medium text-slate-500">
          Data per halaman
        </label>
        <select
          id="rows-per-page"
          value={rowsPerPage}
          onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
          className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary">
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
