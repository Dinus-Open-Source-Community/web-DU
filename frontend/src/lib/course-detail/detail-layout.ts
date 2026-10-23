import {
  appKpiLabelClassName,
  appPageTitleClassName,
  appSoftCardClassName,
} from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

/** Shared layout tokens for public course detail surfaces. */
export const detailLayout = {
  page: 'mx-auto w-full max-w-6xl',
  pageGutter: 'px-4 sm:px-5 md:px-6 lg:px-8',
  pageSection: 'py-5 sm:py-6 md:py-8 lg:py-10',
  pageBottomMobile: 'pb-28 lg:pb-10',
  contentStack: 'flex flex-col gap-4 sm:gap-5',
  mainGrid: 'grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px]',
  sectionCard: appSoftCardClassName,
  sectionPadding: 'p-4 sm:p-6',
  sectionTitle: cn(appPageTitleClassName, 'text-base sm:text-lg'),
  sectionSubtitle: appKpiLabelClassName,
  body: 'text-sm leading-relaxed text-ink-600 sm:text-[15px]',
  meta: 'text-xs font-medium text-ink-500',
  backLink:
    'inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-medium text-white/90 transition-colors hover:text-white active:scale-[0.98]',
  stickyBar:
    'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm supports-backdrop-filter:bg-card/85 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden',
} as const
