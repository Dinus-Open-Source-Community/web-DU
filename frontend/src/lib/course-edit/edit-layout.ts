/** Shared layout tokens for course edit UI. Flat surfaces, consistent typography. */
export const editLayout = {
  page: 'mx-auto flex w-full flex-col gap-6 pb-10 lg:pb-10',
  pageCompact: 'gap-4 pb-28 lg:gap-6 lg:pb-10',
  shell:
    'grid gap-6 lg:grid-cols-[minmax(15rem,17.5rem)_minmax(0,1fr)] lg:gap-0 lg:divide-x lg:divide-slate-200',
  shellCompactOutline: 'flex min-h-0 flex-1 flex-col',
  shellCompactEditor: 'flex min-h-0 flex-1 flex-col',
  outlinePanel:
    'flex min-h-0 flex-col lg:sticky lg:top-4 lg:max-h-[calc(100dvh-7rem)] lg:pr-6',
  outlinePanelFull:
    'flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-4 sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0',
  editorPanel: 'min-w-0 lg:pl-8',
  editorPanelCompact: 'min-w-0 flex-1 px-0 sm:px-1',
  divider: 'border-b border-slate-200',
  pageTitle: 'text-lg font-semibold tracking-tight text-slate-900 sm:text-xl',
  panelTitle: 'text-sm font-semibold text-slate-900',
  moduleTitle: 'text-xs font-medium uppercase tracking-wide text-slate-500',
  body: 'text-sm leading-relaxed text-slate-600',
  sectionTitle: 'text-base font-semibold tracking-tight text-slate-900 sm:text-lg',
  meta: 'text-xs tabular-nums text-slate-400',
  control: 'h-9 min-h-9 rounded-lg text-sm',
  iconButton: 'size-9 min-h-9 min-w-9 shrink-0 rounded-lg',
  lessonRow:
    'flex w-full min-h-11 items-center gap-2.5 rounded-r-lg border-l-2 py-2.5 pl-2.5 pr-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
  lessonRowIdle:
    'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100',
  lessonRowActive: 'border-primary bg-primary/5 font-medium text-primary',
  fieldLabel: 'text-xs font-medium text-slate-500',
  segmented:
    'inline-flex w-full rounded-lg border border-slate-200 bg-slate-50 p-0.5 sm:w-auto',
  segmentedItem:
    'inline-flex h-9 min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:flex-none sm:h-8',
  segmentedItemActive: 'bg-white text-slate-900 shadow-sm',
  segmentedItemIdle: 'text-slate-600 hover:text-slate-900',
} as const

export type CurriculumOutlineLayout = 'sidebar' | 'full'
