export const courseMasterLayout = {
  fieldLabel: 'text-xs font-semibold uppercase tracking-wide text-slate-500',
  fieldHint: 'text-xs leading-5 text-slate-500',
  fieldStack: 'flex flex-col gap-2',
  input:
    'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
  textarea:
    'min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
  activeRow: 'flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3',
} as const
