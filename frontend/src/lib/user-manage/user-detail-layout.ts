import {
  appCardClassName,
  appKpiLabelClassName,
  appKpiValueClassName,
  appPageTitleClassName,
} from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

/** Shared layout tokens for admin user detail surfaces. */
export const userDetailLayout = {
  page: 'flex flex-col gap-5',
  surface: appCardClassName,
  surfacePadding: 'p-5 sm:p-6',
  contentPanel: cn(appCardClassName, 'overflow-hidden'),
  contentPanelToolbar: 'border-b-2 border-ink-900/10 bg-paper-offwhite/60 px-4 py-3.5 sm:px-6',
  contentPanelBody: 'p-4 sm:p-6',
  card: 'rounded-xl border-2 border-ink-900/10 bg-paper-offwhite transition-colors duration-200 hover:border-ink-900/20',
  cardPadding: 'p-4 sm:p-5',
  cardTitle: 'text-sm font-bold tracking-tight text-ink-900 sm:text-base',
  cardSubtitle: cn(appKpiLabelClassName, 'mt-1 leading-relaxed'),
  cardMeta: 'text-xs font-medium text-ink-500',
  sectionTitle: 'text-base font-bold tracking-tight text-ink-900',
  fieldCard: 'rounded-xl border border-line-light bg-paper-offwhite p-4',
  fieldLabel: 'text-[11px] font-bold uppercase tracking-wider text-ink-500',
  fieldValue: 'mt-1.5 text-sm font-semibold text-ink-900',
  fieldValueMuted: 'mt-1.5 text-sm font-medium leading-relaxed text-ink-700',
  statsGrid: 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5',
  statCard:
    'rounded-xl border-2 border-ink-900/10 bg-paper-white p-4 shadow-paper border-l-4',
  statLabel: 'truncate text-[11px] font-bold uppercase tracking-wider text-ink-500',
  statValue: cn(appKpiValueClassName, 'mt-1.5 text-2xl tabular-nums'),
  list: 'flex flex-col gap-4',
  metaChip:
    'inline-flex items-center rounded-md border border-ink-900/10 bg-paper-white px-2 py-0.5 text-xs font-semibold text-ink-700',
  actionButton:
    'h-9 shrink-0 rounded-lg border-2 border-ink-900/10 bg-paper-white px-3.5 text-xs font-semibold text-ink-800 shadow-none hover:bg-paper-paper hover:text-ink-900',
  destructiveActionButton:
    'border-destructive/25 text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive',
  profileName: cn(appPageTitleClassName, 'text-xl sm:text-2xl'),
  profileEmail: 'text-sm font-medium text-ink-600',
  avatarFallback:
    'border-2 border-ink-900/10 bg-brand-soft/60 text-lg font-bold text-brand-blue',
  nestedSection: 'border-t border-line-light px-4 pt-3.5 pb-4 sm:px-5 sm:pb-5',
  nestedSectionTitle: 'mb-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-500',
  nestedRow:
    'flex flex-col gap-1.5 rounded-lg border border-line-light bg-paper-white px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between',
  nestedRowTitle: 'truncate text-sm font-semibold text-ink-900',
  nestedRowMeta: 'truncate text-xs font-medium text-ink-500',
  nestedRowValue:
    'w-fit shrink-0 rounded-md border border-ink-900/10 bg-paper-paper px-2 py-0.5 text-xs font-semibold tabular-nums text-ink-700',
  reviewBody: 'mt-3 text-sm font-medium leading-relaxed text-ink-700',
  amountValue: cn(appKpiValueClassName, 'text-base tabular-nums'),
  ratingValue:
    'inline-flex shrink-0 items-center gap-1 rounded-md border border-ink-900/10 bg-note-yellow px-2.5 py-1 text-xs font-bold tabular-nums text-ink-900',
} as const
