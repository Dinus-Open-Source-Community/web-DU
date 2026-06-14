export const courseFormLayout = {
  dialog: 'sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl border-slate-200',
  header: 'px-6 pt-6 pb-4 border-b border-slate-100',
  title: 'text-lg font-semibold tracking-tight text-slate-900',
  description: 'text-sm text-slate-500 leading-relaxed',
  body: 'max-h-[65vh] overflow-y-auto px-6 py-5 space-y-6',
  sectionTitle: 'text-[11px] font-bold uppercase tracking-widest text-slate-400',
  label: 'text-xs font-semibold uppercase tracking-wide text-slate-500',
  input:
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary',
  textarea:
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary resize-y',
  uploadZone:
    'flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600 transition hover:border-primary/40 hover:bg-primary/5',
  coverPreview: 'h-20 max-w-full rounded-lg border border-slate-200 object-cover',
  footer: 'border-t border-slate-100 px-6 py-4',
  actionButton: 'rounded-xl',
} as const
