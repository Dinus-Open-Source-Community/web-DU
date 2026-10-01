import type { CSSProperties } from 'react'

import type { UserRole } from '@/lib/types/user'
import { cn } from '@/lib/utils'

export function isAdminAppShellRole(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin'
}

/**
 * Token permukaan app (dashboard admin, dll.) — selaras landing:
 * ink/paper/brand/line, kartu dengan border tegas & shadow-paper ringan.
 * Tipografi mengandalkan Plus Jakarta Sans (global); logo pakai font-display.
 */

export const brandWordmarkClassName =
  'font-display text-xl font-bold tracking-tight text-ink-900 sm:text-2xl'

export const appShellPageBgClassName = 'bg-paper-offwhite'

export const appShellTopBarClassName =
  'border-b-2 border-ink-900/10 bg-paper-white/95 shadow-nav backdrop-blur supports-[backdrop-filter]:bg-paper-white/90'

export const appShellSidebarClassName =
  'border-r-2 border-ink-900/10 bg-paper-white [&_[data-slot=sidebar-inner]]:bg-paper-white'

export const appCardClassName =
  'rounded-xl border-2 border-ink-900/10 bg-paper-white shadow-paper'

export const appCardHeaderClassName = 'border-b border-line-light'

export const appPageTitleClassName =
  'text-2xl font-bold tracking-tight text-ink-900 md:text-3xl'

export const appPageSubtitleClassName =
  'max-w-3xl text-sm font-medium leading-relaxed text-ink-500 md:text-base'

export const appKpiLabelClassName = 'truncate text-sm font-medium text-ink-500'

export const appKpiValueClassName = 'text-2xl font-bold tracking-tight text-ink-900'

export const appSegmentedControlClassName =
  'inline-flex items-center gap-1 rounded-lg border-2 border-ink-900/10 bg-paper-paper p-1'

export const appSegmentedItemActiveClassName =
  'bg-brand-blue text-ink-900 shadow-none'

export const appSegmentedItemIdleClassName = 'text-ink-500 hover:text-ink-700'

/** Grid kertas halus (sama konsep hero landing), untuk latar halaman dashboard. */
export const appDashboardGridOverlayStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, #050914 1px, transparent 1px), linear-gradient(to bottom, #050914 1px, transparent 1px)',
  backgroundSize: '24px 24px',
}

export const appToolbarPrimaryButtonClassName =
  'h-11 shrink-0 gap-2 rounded-sm border-2 border-ink-900/10 px-5 font-semibold shadow-none'

export const appCourseCardClassName =
  'group flex h-full w-full flex-col overflow-hidden rounded-xl border-2 border-ink-900/10 bg-paper-white shadow-paper transition-colors duration-200 hover:border-ink-900/20'

/** Kartu lembut (rounded-2xl) — detail publik, user manage, dll. */
export const appSoftCardClassName = cn(
  appCardClassName,
  'rounded-2xl shadow-sm',
)

export const appShellNavTriggerClassName =
  'size-10 shrink-0 rounded-xl border border-input bg-card text-muted-foreground shadow-sm transition-all duration-200 hover:bg-muted active:scale-95'

export const appShellBackLinkClassName =
  'inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-input bg-card px-2.5 py-2 text-sm font-semibold text-foreground transition outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 sm:px-3'

export const appShellBreadcrumbLinkClassName =
  'max-w-[7rem] truncate rounded-md px-1.5 py-1 font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground lg:max-w-[9rem]'

export const appShellBreadcrumbCurrentClassName =
  'max-w-[8rem] truncate rounded-md px-1.5 py-1 font-semibold text-foreground lg:max-w-[11rem]'

export const appShellBreadcrumbMutedClassName =
  'max-w-[7rem] truncate rounded-md px-1.5 py-1 font-medium text-muted-foreground lg:max-w-[9rem]'

export const appShellGridOverlayClassName =
  'app-shell-grid-overlay pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.08]'
