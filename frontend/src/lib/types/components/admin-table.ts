import type { ReactNode } from 'react'

export interface IAdminDataTableColumn<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
  headerClassName?: string
}

export interface IAdminDataTableProps<T> {
  columns: IAdminDataTableColumn<T>[]
  data: T[]
  keyField: (row: T) => string
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  total?: number
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  emptyState?: ReactNode
  tableClassName?: string
  wrapperClassName?: string
  compact?: boolean
  onRowClick?: (row: T) => void
  variant?: 'default' | 'admin'
}

/** Alias backward-compat. */
export type AdminDataTableColumn<T> = IAdminDataTableColumn<T>
export type AdminDataTableProps<T> = IAdminDataTableProps<T>
