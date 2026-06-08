import type { InputHTMLAttributes } from 'react'
import type { ReactNode } from 'react'

export type FilterSelectOption<T extends string = string> = { value: T; label: string }
export type SegmentedItem<T extends string = string> = { value: T; label: string }
export type SegmentedFilterVariant = 'scroll' | 'wrap'

export interface IPersonSelectionItem {
  uid: string
  name: string
  email: string
  avatar: string
  detail?: string
  meta?: ReactNode
}

export interface ISearchProps extends InputHTMLAttributes<HTMLInputElement> {
  showIcon?: boolean
  containerClassName?: string
}

/** Alias backward-compat. */
export type PersonSelectionItem = IPersonSelectionItem
