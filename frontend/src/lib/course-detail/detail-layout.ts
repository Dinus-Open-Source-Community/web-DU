/** Shared layout tokens for public course detail surfaces. */
export const detailLayout = {
  page: 'mx-auto w-full max-w-6xl',
  pageGutter: 'px-4 sm:px-5 md:px-6 lg:px-8',
  pageSection: 'py-5 sm:py-6 md:py-8 lg:py-10',
  pageBottomMobile: 'pb-28 lg:pb-10',
  contentStack: 'flex flex-col gap-4 sm:gap-5',
  mainGrid: 'grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px]',
  sectionCard:
    'rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
  sectionPadding: 'p-4 sm:p-6',
  sectionTitle: 'text-base font-semibold tracking-tight text-slate-900 sm:text-lg',
  sectionSubtitle: 'text-sm font-medium text-slate-500',
  body: 'text-sm leading-relaxed text-slate-600 sm:text-[15px]',
  meta: 'text-xs text-slate-500',
  price: 'text-xl font-bold tracking-tight text-slate-900 sm:text-2xl',
  strikePrice: 'text-sm text-slate-400 line-through sm:text-base',
  discount: 'text-xs font-medium text-rose-600',
  backLink:
    'inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-medium text-white/90 transition-colors hover:text-white active:scale-[0.98]',
  stickyBar:
    'fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-sm supports-backdrop-filter:bg-white/85 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden',
} as const
