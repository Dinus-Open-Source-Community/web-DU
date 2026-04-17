'use client'

import type { ReactNode } from 'react'

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination } from '@/components/ui/DataTablePagination'
import { cn } from '@/lib/utils'

export interface AdminDataTableColumn<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
  headerClassName?: string
}

interface AdminDataTableProps<T> {
  columns: AdminDataTableColumn<T>[]
  data: T[]
  keyField: (row: T) => string
  toolbar?: ReactNode
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  emptyState?: ReactNode
  tableClassName?: string
  wrapperClassName?: string
  compact?: boolean
  onRowClick?: (row: T) => void
}

export function AdminDataTable<T>({
  columns,
  data,
  keyField,
  toolbar,
  page,
  totalPages,
  onPageChange,
  emptyState,
  tableClassName,
  wrapperClassName,
  compact,
  onRowClick,
}: AdminDataTableProps<T>) {
  return (
    <section
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        wrapperClassName
      )}>
      {toolbar && (
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">
        <Table className={cn(compact ? 'text-[13px]' : 'text-sm', tableClassName)}>
          <TableHeader className="bg-slate-50/70">
            <TableRow className="border-slate-100 hover:bg-slate-50/70">
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(
                    'px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.headerClassName
                  )}>
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
                      <p className="text-sm font-medium text-slate-500">Belum ada data</p>
                      <p className="text-xs text-slate-400">Data akan tampil di sini ketika tersedia.</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyField(row)}
                  className={cn(
                    'border-b border-slate-100 transition-colors last:border-b-0',
                    onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/50'
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}>
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        'px-5 py-3.5 align-middle text-slate-700',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                        col.className
                      )}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {page !== undefined && totalPages !== undefined && onPageChange && totalPages > 0 && (
        <DataTablePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </section>
  )
}
