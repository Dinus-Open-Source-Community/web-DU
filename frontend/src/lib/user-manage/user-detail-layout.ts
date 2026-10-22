import {
  appKpiLabelClassName,
  appKpiValueClassName,
  appPageTitleClassName,
  appSoftCardClassName,
} from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

/** Shared layout tokens for admin user detail surfaces. */
export const userDetailLayout = {
  page: 'flex flex-col gap-6',
  surface: appSoftCardClassName,
  surfacePadding: 'p-5 sm:p-6',
  contentPanel: cn(appSoftCardClassName, 'overflow-hidden'),
  contentPanelToolbar: 'border-b border-line-light px-4 py-4 sm:px-6',
  contentPanelBody: 'p-4 sm:p-6',
  card: cn(
    appSoftCardClassName,
    'transition-all duration-200 hover:border-ink-900/20',
  ),
  cardPadding: 'p-4 sm:p-5',
  cardTitle: 'text-sm font-semibold tracking-tight text-ink-900 sm:text-base',
  cardSubtitle: cn(appKpiLabelClassName, 'mt-1 leading-relaxed'),
  cardMeta: 'text-xs font-medium text-ink-500',
  sectionTitle: 'text-base font-semibold tracking-tight text-ink-900',
  fieldLabel: 'text-xs font-medium text-ink-500',
  fieldValue: 'mt-1 text-sm font-medium text-ink-900',
  fieldValueMuted: 'mt-1 text-sm leading-relaxed text-ink-700',
  statsGrid:
    'grid grid-cols-2 gap-x-6 gap-y-4 border-b border-line-light pb-5 sm:grid-cols-3 lg:grid-cols-5',
  statLabel: appKpiLabelClassName,
  statValue: cn(appKpiValueClassName, 'text-2xl'),
  list: 'flex flex-col gap-4',
  metaChip: 'text-xs font-medium text-ink-500',
  actionButton:
    'h-9 shrink-0 rounded-lg border-ink-900/10 px-3 text-xs font-semibold',
  destructiveActionButton:
    'text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15',
  profileName: cn(appPageTitleClassName, 'text-xl sm:text-2xl'),
  profileEmail: 'text-sm text-ink-600',
  avatarFallback: 'bg-paper-paper text-lg font-semibold text-ink-600',
  nestedSection: 'border-t border-line-light px-4 pb-4 sm:px-5 sm:pb-5',
  nestedSectionTitle: cn(appKpiLabelClassName, 'mb-3 font-semibold'),
  nestedRow:
    'flex flex-col gap-1 rounded-xl bg-paper-paper px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between',
  nestedRowTitle: 'truncate text-sm font-medium text-ink-800',
  nestedRowMeta: 'truncate text-xs text-ink-500',
  nestedRowValue: 'text-xs font-medium tabular-nums text-ink-600',
  reviewBody: 'mt-3 text-sm leading-relaxed text-ink-700',
  amountValue: cn(appKpiValueClassName, 'text-base'),
  ratingValue:
    'flex items-center gap-1 text-xs font-semibold tabular-nums text-amber-700 dark:text-amber-400',
} as const
