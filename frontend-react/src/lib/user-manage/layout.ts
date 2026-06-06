export const userManageLayout = {
  page: 'flex flex-col gap-6',
  statCard:
    'rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
  statLabel: 'text-xs font-medium text-slate-500',
  statValue: 'mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900',
  roleOption:
    'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
  roleOptionActive: 'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.12)]',
  roleOptionIdle: 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80',
} as const
