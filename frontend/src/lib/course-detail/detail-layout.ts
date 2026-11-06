/** Shared layout tokens for public course detail surfaces. */
export const detailLayout = {
  page: 'mx-auto w-full max-w-6xl',
  pageGutter: 'px-4 sm:px-6 lg:px-8',
  pageSection: 'py-6 sm:py-8 lg:py-10',
  pageBottomMobile: 'pb-28 lg:pb-12',
  contentStack: 'flex flex-col gap-6 sm:gap-8',
  mainGrid: 'grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_360px]',
  sectionCard: 'relative rounded-[20px] border-2 border-ink-900 bg-paper-white shadow-paper',
  sectionPadding: 'p-5 sm:p-7 md:p-8',
  sectionTitle: 'font-display text-xl sm:text-2xl font-bold tracking-tight text-ink-900',
  sectionSubtitle: 'font-mono text-xs font-bold uppercase tracking-wider text-ink-500',
  body: 'text-sm leading-relaxed text-ink-700 sm:text-base',
  meta: 'font-mono text-xs font-bold text-ink-500',
  backLink:
    'inline-flex min-h-10 items-center gap-1.5 rounded-xl border-2 border-ink-900 bg-paper-white px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink-900 shadow-button transition-all hover:bg-note-yellow active:translate-x-[1px] active:translate-y-[1px]',
  stickyBar:
    'fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink-900 bg-paper-white/95 backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden shadow-[0_-4px_16px_rgba(5,9,20,0.08)]',
} as const
