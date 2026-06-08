import type { LucideIcon } from 'lucide-react'

export interface INavChildItem {
  name: string
  path: string
}

export interface INavItem {
  name: string
  path?: string
  icon?: LucideIcon
  children?: INavChildItem[]
}

/** Alias backward-compat. */
export type NavChildItem = INavChildItem
export type NavItem = INavItem
