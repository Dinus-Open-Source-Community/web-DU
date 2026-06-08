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

/** Alias backward-compat. */
export type AdminDataTableColumn<T> = IAdminDataTableColumn<T>
export type AdminDataTableProps<T> = IAdminDataTableProps<T>
