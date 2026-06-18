/** Shared layout tokens for admin user detail surfaces. */
export const userDetailLayout = {
  page: 'flex flex-col gap-6',
  surface:
    'rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
  surfacePadding: 'p-5 sm:p-6',
  contentPanel:
    'overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
  contentPanelToolbar: 'border-b border-slate-100 px-4 py-4 sm:px-6',
  contentPanelBody: 'p-4 sm:p-6',
  card:
    'rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]',
  cardPadding: 'p-4 sm:p-5',
  cardTitle: 'text-sm font-semibold tracking-tight text-slate-900 sm:text-base',
  cardSubtitle: 'mt-1 text-sm leading-relaxed text-slate-500',
  cardMeta: 'text-xs font-medium text-slate-500',
  sectionTitle: 'text-base font-semibold tracking-tight text-slate-900',
  fieldLabel: 'text-xs font-medium text-slate-500',
  fieldValue: 'mt-1 text-sm font-medium text-slate-900',
  fieldValueMuted: 'mt-1 text-sm leading-relaxed text-slate-700',
  statsGrid:
    'grid grid-cols-2 gap-x-6 gap-y-4 border-b border-slate-200 pb-5 sm:grid-cols-3 xl:grid-cols-5',
  statLabel: 'text-xs font-medium text-slate-500',
  statValue: 'mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900',
  list: 'flex flex-col gap-4',
  metaChip:
    'inline-flex items-center rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600',
  actionButton:
    'h-9 shrink-0 rounded-lg border-slate-200 px-3 text-xs font-semibold',
} as const
