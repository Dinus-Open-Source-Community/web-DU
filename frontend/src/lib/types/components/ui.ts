import type { InputHTMLAttributes, ReactNode } from 'react'

/** Props [`GlobalInput`](/components/ui/GlobalInput). */
export interface GlobalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  subLabel?: string
  rightIcon?: ReactNode
}

export interface SelectOption {
  label: string
  value: string
}

export interface GlobalSelectProps {
  label?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface ISearchProps extends InputHTMLAttributes<HTMLInputElement> {
  showIcon?: boolean
  containerClassName?: string
}

export type FilterSelectOption<T extends string = string> = { value: T; label: string }

export type SegmentedItem<T extends string = string> = { value: T; label: string }

export type SegmentedFilterVariant = 'scroll' | 'wrap'
