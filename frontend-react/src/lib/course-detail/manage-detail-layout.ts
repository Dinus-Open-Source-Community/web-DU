/** Shared layout tokens for admin/mentor course detail surfaces. */
export const manageDetailLayout = {
  page: 'flex w-full flex-col gap-6 sm:gap-8 lg:gap-10',
  pageBottomMobile: 'pb-32 md:pb-0',
  sectionCard:
    'rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
  sectionPadding: 'p-4 sm:p-6',
  sectionTitle: 'text-base font-semibold tracking-tight text-slate-900 sm:text-lg',
  sectionLabel: 'text-xs font-medium text-slate-500',
  body: 'text-sm leading-relaxed text-slate-600 sm:text-[15px]',
  meta: 'text-xs text-slate-500',
  pageTitle: 'text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl',
  pageSubtitle: 'text-sm leading-relaxed text-slate-500 sm:text-base',
  actionButton:
    'h-11 min-h-11 rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.98]',
  tabScroll:
    'overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  tabList:
    'inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-b border-slate-200 bg-transparent p-0 snap-x snap-mandatory',
  tabTrigger:
    'relative -mb-px !flex-none inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-none border-b-2 border-transparent px-3 pb-2.5 pt-2 text-sm font-medium text-slate-500 transition-colors after:!hidden data-active:border-primary data-active:text-slate-900 sm:min-h-10 sm:px-4',
  statCard: 'rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3',
  stickyBar:
    'fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pt-3 backdrop-blur-sm supports-backdrop-filter:bg-white/85 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden',
  stickyBarInner: 'mx-auto flex w-full max-w-3xl flex-col gap-3',
  overviewGrid: 'grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8',
  statGrid: 'grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-8',
} as const
