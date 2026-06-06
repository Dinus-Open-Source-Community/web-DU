/** Shared layout tokens for course edit UI. Flat surfaces, consistent typography. */
export const editLayout = {
  page: "mx-auto flex w-full  flex-col gap-6 pb-10",
  shell:
    "grid gap-6 lg:grid-cols-[minmax(15rem,17.5rem)_minmax(0,1fr)] lg:gap-0 lg:divide-x lg:divide-slate-200",
  outlinePanel:
    "flex min-h-0 flex-col lg:sticky lg:top-4 lg:max-h-[calc(100dvh-7rem)] lg:pr-6",
  editorPanel: "min-w-0 lg:pl-8",
  divider: "border-b border-slate-200",
  pageTitle: "text-xl font-semibold tracking-tight text-slate-900",
  panelTitle: "text-sm font-semibold text-slate-900",
  moduleTitle: "text-xs font-medium text-slate-500",
  body: "text-sm leading-relaxed text-slate-600",
  sectionTitle: "text-lg font-semibold tracking-tight text-slate-900",
  meta: "text-xs tabular-nums text-slate-400",
  control: "h-9 rounded-lg text-sm",
  iconButton: "size-9 shrink-0 rounded-lg",
  lessonRow:
    "flex w-full items-center gap-2 border-l-2 py-2.5 pl-3 pr-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
  lessonRowIdle:
    "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900",
  lessonRowActive: "border-primary bg-primary/5 font-medium text-primary",
  fieldLabel: "text-xs font-medium text-slate-500",
  segmented:
    "inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5",
  segmentedItem:
    "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
  segmentedItemActive: "bg-white text-slate-900 shadow-sm",
  segmentedItemIdle: "text-slate-600 hover:text-slate-900",
} as const;
