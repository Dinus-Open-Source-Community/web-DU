import type { LucideIcon } from 'lucide-react'

export interface NavChildItem {
  name: string
  path: string
}

export interface NavItem {
  name: string
  path?: string
  icon?: LucideIcon
  children?: NavChildItem[]
}

export interface FlyoutState {
  name: string
  items: NavChildItem[]
  top: number
}
