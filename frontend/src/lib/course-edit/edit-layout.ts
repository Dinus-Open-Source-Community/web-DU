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

/** Layout & permukaan Edit Kurikulum — selaras app shell ink/paper. */
export const editLayout = {
  page: 'mx-auto flex w-full flex-col gap-6 pb-10 lg:pb-10',
  pageCompact: 'gap-4 pb-28 lg:gap-6 lg:pb-10',
  shell: cn(
    appCardClassName,
    'grid gap-6 rounded-2xl p-5 shadow-paper sm:p-6 lg:grid-cols-[minmax(17rem,21rem)_minmax(0,1fr)] lg:gap-0 lg:divide-x lg:divide-line-light lg:p-6 xl:p-8',
  ),
  shellCompactOutline: 'flex min-h-0 flex-1 flex-col',
  shellCompactEditor: 'flex min-h-0 flex-1 flex-col',
  outlinePanel:
    'flex min-h-0 w-full min-w-0 flex-col lg:sticky lg:top-4 lg:max-h-[calc(100dvh-10rem)] lg:pr-6 xl:pr-8',
  outlinePanelFull: 'flex min-h-0 flex-1 flex-col',
  editorPanel: 'min-w-0 lg:pl-6 xl:pl-8',
  editorPanelCompact: 'min-w-0 flex-1 px-0 sm:px-1',
  divider: 'border-b-2 border-ink-900/10',
  sectionDivider: 'border-t border-line-light',
  pageTitle: cn(appPageTitleClassName, 'text-lg sm:text-xl'),
  panelTitle: 'text-sm font-semibold text-ink-900',
  moduleTitle: 'text-xs font-bold uppercase tracking-widest text-ink-400',
  moduleTitleText: 'break-words text-sm font-medium leading-snug text-ink-800',
  body: cn(appPageSubtitleClassName, 'max-w-none text-sm'),
  sectionTitle: 'text-base font-semibold tracking-tight text-ink-900 sm:text-lg',
  meta: 'text-xs tabular-nums font-medium text-ink-400',
  control: cn(
    appToolbarPrimaryButtonClassName,
    'h-9 min-h-9 rounded-full px-4 text-sm shadow-none',
  ),
  iconButton: 'size-9 min-h-9 min-w-9 shrink-0 rounded-full',
  surfaceMuted:
    'space-y-2 rounded-xl border-2 border-ink-900/10 bg-paper-paper p-3 sm:p-4',
  moduleRow: 'mb-1 flex items-center gap-0.5 rounded-md px-1 transition-colors',
  moduleRowActive: 'bg-paper-paper',
  moduleRowIdle: 'hover:bg-paper-paper',
  outlineSection: 'min-w-0 border-t border-line-light pt-4 pb-3',
  skeleton: 'animate-pulse rounded-md bg-paper-paper',
  lessonRow:
    'grid w-full min-h-11 grid-cols-[1.25rem_1rem_minmax(0,1fr)] items-start gap-x-2 rounded-r-lg border-l-2 py-2.5 pl-2.5 pr-2 text-left text-sm leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30',
  lessonRowIdle:
    'border-transparent text-ink-600 hover:bg-paper-paper hover:text-ink-900 active:bg-paper-paper/80',
  lessonRowActive: 'border-brand-blue bg-brand-blue/5 font-medium text-ink-900',
  fieldLabel: appKpiLabelClassName,
  segmented: cn(appSegmentedControlClassName, 'w-full sm:w-auto rounded-full'),
  segmentedItem:
    'inline-flex h-9 min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 sm:flex-none sm:h-8',
  segmentedItemActive: cn(appSegmentedItemActiveClassName, 'shadow-none'),
  segmentedItemIdle: appSegmentedItemIdleClassName,
  stickyBar: cn(
    appShellTopBarClassName,
    'fixed inset-x-0 bottom-0 z-30 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden',
  ),
  stickyHeader: cn(
    appShellTopBarClassName,
    'sticky top-0 z-20 py-3 lg:hidden',
  ),
  dialogShell: cn(
    'gap-0 overflow-hidden border-2 border-ink-900/10 p-0 shadow-paper sm:max-w-md',
    appCardClassName,
  ),
  dialogHeader: 'border-b-2 border-ink-900/10 px-5 py-5 sm:px-6',
  dialogFooter:
    'flex flex-col-reverse gap-2 border-t-2 border-ink-900/10 bg-paper-paper px-5 py-4 sm:flex-row sm:justify-end sm:px-6',
} as const

export type CurriculumOutlineLayout = 'sidebar' | 'full'
