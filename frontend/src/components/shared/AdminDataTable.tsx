import type { AdminDataTableProps } from '../../lib/types/api'
import {
  appCardClassName,
  appCardHeaderClassName,
} from '@/lib/design/app-shell-tokens'
import { cn } from '../../lib/utils'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table'
import { TablePaginationFooter } from './TablePaginationFooter'

export function AdminDataTable<T>({
  columns,
  data,
  keyField,
  page,
  totalPages,
  onPageChange,
  total,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  emptyState,
  tableClassName,
  wrapperClassName,
  compact,
  onRowClick,
}: AdminDataTableProps<T>) {
  return (
    <section
      className={cn('flex flex-col overflow-hidden', appCardClassName, wrapperClassName)}
    >
      <div className="overflow-x-auto">
        <Table className={cn(compact ? 'text-[13px]' : 'text-sm', tableClassName)}>
          <TableHeader className={cn('bg-paper-paper', appCardHeaderClassName)}>
            <TableRow className="border-ink-900/10 hover:bg-paper-paper">
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(
                    'px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10">
                  {emptyState ?? (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <p className="text-base font-medium text-ink-500">
                        Data Tidak Ditemukan
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyField(row)}
                  className={cn(
                    'border-b border-line-light transition-colors last:border-b-0 [content-visibility:auto] [contain-intrinsic-size:0_56px] hover:bg-paper-paper/80',
                    onRowClick && 'cursor-pointer hover:bg-paper-paper',
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        'px-5 py-3.5 align-middle text-ink-700',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                        col.className,
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {page !== undefined && totalPages !== undefined && onPageChange ? (
        <TablePaginationFooter
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      ) : null}
    </section>
  )
}
