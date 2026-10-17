import {
  appCardClassName,
  appKpiLabelClassName,
  appPageSubtitleClassName,
  appPageTitleClassName,
  appSegmentedControlClassName,
  appSegmentedItemActiveClassName,
  appSegmentedItemIdleClassName,
  appShellTopBarClassName,
  appToolbarPrimaryButtonClassName,
} from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

/** Layout & permukaan course detail (admin/mentor) — selaras dashboard admin (ink/paper). */
export const manageDetailLayout = {
  page: 'flex w-full flex-col gap-6 sm:gap-7 md:gap-8 lg:gap-10',
  pageBottomMobile: 'pb-32 lg:pb-0',
  sectionCard: appCardClassName,
  sectionPadding: 'p-4 sm:p-6',
  sectionTitle: 'text-base font-semibold tracking-tight text-ink-900 sm:text-lg',
  sectionLabel: appKpiLabelClassName,
  tabCountBadge:
    'inline-flex items-center gap-1.5 rounded-md border-2 border-ink-900/10 bg-paper-paper px-2.5 py-1 text-xs font-semibold text-ink-600',
  tableSurface: cn(appCardClassName, 'overflow-hidden shadow-paper'),
  tableHead:
    'text-[11px] font-semibold uppercase tracking-wide text-ink-500',
  tableHeaderRow: 'border-line-light bg-paper-paper/80 hover:bg-paper-paper/80',
  tableBodyRow: 'border-line-light hover:bg-paper-paper/60',
  body: 'text-sm leading-relaxed text-ink-600 sm:text-[15px]',
  meta: 'text-xs font-medium text-ink-500',
  pageTitle: cn(appPageTitleClassName, 'lg:text-4xl'),
  pageSubtitle: appPageSubtitleClassName,
  actionButton:
    'h-11 min-h-11 rounded-sm border-2 border-ink-900/10 px-4 text-sm font-semibold shadow-none transition-all active:scale-[0.98]',
  tabScroll:
    'overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  tabList: cn(
    'inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-b-2 border-ink-900/10 bg-transparent p-0 snap-x snap-mandatory',
  ),
  tabTrigger: cn(
    'relative -mb-px !flex-none inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-none border-b-2 border-transparent px-3 pb-2.5 pt-2 text-sm font-medium text-ink-500 transition-colors after:!hidden hover:text-ink-900 sm:min-h-10 sm:px-4',
    'data-active:border-brand-blue data-active:text-ink-900',
  ),
  statCard: cn(appCardClassName, 'border-l-4 border-l-brand-blue px-4 py-3 shadow-paper'),
  stickyBar: cn(
    appShellTopBarClassName,
    'fixed inset-x-0 bottom-0 z-30 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden',
  ),
  stickyBarInner: 'mx-auto flex w-full max-w-3xl flex-col gap-3',
  overviewGrid:
    'grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-start lg:gap-8',
  overviewInfoSticky: 'lg:sticky lg:top-[calc(4rem+1rem)] lg:z-[1] lg:self-start',
  overviewInfoCardShell: 'rounded-xl shadow-paper',
  overviewInfoCardInner: cn(
    appCardClassName,
    'overflow-hidden rounded-xl shadow-none',
  ),
  overviewInfoCardScroll:
    'max-h-[calc(100dvh-4rem-2.5rem)] overflow-y-auto overscroll-contain',
  overviewInfoCardPadding: 'p-3 sm:p-4',
  statGrid:
    'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4',
  flatPage: 'flex w-full flex-col gap-6 sm:gap-8',
  flatStats:
    'grid grid-cols-2 gap-x-6 gap-y-4 border-b border-line-light pb-5 sm:grid-cols-4',
  flatStatLabel: appKpiLabelClassName,
  flatStatValue: cn('text-xl font-bold tracking-tight text-ink-900 sm:text-2xl'),
  flatToolbar:
    'flex flex-col gap-4 border-b border-line-light pb-5 lg:flex-row lg:items-end lg:justify-between',
  flatList: 'divide-y divide-line-light',
  flatListItem: 'py-5 first:pt-0',
  flatEmpty: 'py-12 text-center text-sm font-medium text-ink-500',
  flatError: 'border-b border-destructive/30 py-4 text-sm text-destructive',
  segmentedControl: appSegmentedControlClassName,
  segmentedButton:
    'inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-semibold transition-colors active:scale-[0.98]',
  segmentedButtonActive: appSegmentedItemActiveClassName,
  segmentedButtonInactive: appSegmentedItemIdleClassName,
  toolbarPrimaryButton: appToolbarPrimaryButtonClassName,
  submissionDetailShell:
    'flex min-h-0 w-full flex-1 flex-col lg:min-h-[calc(100dvh-4rem)] lg:flex-row',
  submissionDetailMain:
    'min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-6',
  submissionDetailSection: 'border-t border-border pt-6',
  submissionDetailSectionTitle: 'text-sm font-semibold text-foreground',
  submissionDetailSectionDesc: 'text-sm font-medium text-muted-foreground',
  submissionDetailBody: 'text-sm leading-6 text-muted-foreground',
  submissionDetailThread: 'border-l-2 border-border pl-4 sm:pl-5',
  submissionDetailFormGrid:
    'grid gap-4 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)_auto] sm:items-end',
} as const
