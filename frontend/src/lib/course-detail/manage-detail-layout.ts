/** Shared layout tokens for admin/mentor course detail surfaces. */
export const manageDetailLayout = {
  page: "flex w-full flex-col gap-6 sm:gap-7 md:gap-8 lg:gap-10",
  pageBottomMobile: "pb-32 lg:pb-0",
  sectionCard:
    "rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
  sectionPadding: "p-4 sm:p-6",
  sectionTitle:
    "text-base font-semibold tracking-tight text-slate-900 sm:text-lg",
  sectionLabel: "text-xs font-medium text-slate-500",
  body: "text-sm leading-relaxed text-slate-600 sm:text-[15px]",
  meta: "text-xs text-slate-500",
  pageTitle:
    "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl",
  pageSubtitle: "text-sm leading-relaxed text-slate-500 sm:text-base",
  actionButton:
    "h-11 min-h-11 rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.98]",
  tabScroll:
    "overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  tabList:
    "inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-b border-slate-200 bg-transparent p-0 snap-x snap-mandatory",
  tabTrigger:
    "relative -mb-px !flex-none inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-none border-b-2 border-transparent px-3 pb-2.5 pt-2 text-sm font-medium text-slate-500 transition-colors after:!hidden data-active:border-primary data-active:text-slate-900 sm:min-h-10 sm:px-4",
  statCard: "rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3",
  stickyBar:
    "fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pt-3 backdrop-blur-sm supports-backdrop-filter:bg-white/85 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden",
  stickyBarInner: "mx-auto flex w-full max-w-3xl flex-col gap-3",
  overviewGrid:
    "grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8",
  statGrid:
    "grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-8",
  flatPage: "flex w-full flex-col gap-6 sm:gap-8",
  flatStats:
    "grid grid-cols-2 gap-x-6 gap-y-4 border-b border-slate-200 pb-5 sm:grid-cols-4",
  flatStatLabel: "text-xs font-medium text-slate-500",
  flatStatValue:
    "mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900",
  flatToolbar:
    "flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between",
  flatList: "divide-y divide-slate-200",
  flatListItem: "py-5 first:pt-0",
  flatEmpty: "py-12 text-center text-sm text-slate-500",
  flatError: "border-b border-rose-200 py-4 text-sm text-rose-700",
  segmentedControl: "inline-flex rounded-lg border border-slate-200 p-0.5",
  segmentedButton:
    "inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition-colors active:scale-[0.98]",
  segmentedButtonActive: "bg-primary text-white shadow-sm",
  segmentedButtonInactive: "text-slate-600 hover:bg-slate-50",
  submissionDetailShell:
    "flex min-h-0 w-full flex-1 flex-col lg:min-h-[calc(100dvh-4rem)] lg:flex-row",
  submissionDetailMain:
    "min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-6",
  submissionDetailSection: "border-t border-slate-200 pt-6",
  submissionDetailSectionTitle: "text-sm font-semibold text-slate-900",
  submissionDetailSectionDesc: "text-sm text-slate-500",
  submissionDetailBody: "text-sm leading-6 text-slate-700",
  submissionDetailThread: "border-l border-slate-200 pl-4 sm:pl-5",
  submissionDetailFormGrid:
    "grid gap-4 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)_auto] sm:items-end",
} as const;
