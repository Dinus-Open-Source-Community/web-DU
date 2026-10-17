import {
  appCardClassName,
  appKpiLabelClassName,
  appKpiValueClassName,
  appPageSubtitleClassName,
  appPageTitleClassName,
  appShellBackLinkClassName,
} from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

export const userManageLayout = {
  page: 'relative z-[1] flex w-full flex-col gap-6',
  pageTitle: appPageTitleClassName,
  pageSubtitle: appPageSubtitleClassName,
  backLink: appShellBackLinkClassName,
  statCard: cn(appCardClassName, 'rounded-2xl px-4 py-3 shadow-sm'),
  statLabel: appKpiLabelClassName,
  statValue: cn(appKpiValueClassName, 'text-2xl'),
  roleOption:
    'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
  roleOptionActive: 'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.12)]',
  roleOptionIdle:
    'border-ink-900/10 bg-card hover:border-ink-900/20 hover:bg-paper-paper',
  tableActionButton: 'h-8 rounded-sm px-3 text-xs font-semibold',
  tableDestructiveActionButton:
    'text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15',
} as const
