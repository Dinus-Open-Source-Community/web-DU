export const courseFormLayout = {
  dialog: 'sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl border-input',
  header: 'px-6 pt-6 pb-4 border-b border-input',
  title: 'text-lg font-semibold tracking-tight text-foreground',
  description: 'text-sm text-muted-foreground leading-relaxed',
  body: 'max-h-[65vh] overflow-y-auto px-6 py-5 space-y-6',
  sectionTitle: 'text-[11px] font-bold uppercase tracking-widest text-muted-foreground',
  label: 'text-xs font-semibold uppercase tracking-wide text-muted-foreground',
  input:
    'w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground shadow-none outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-line-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
  textarea:
    'w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground shadow-none outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-line-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 resize-y',
  uploadZone:
    'flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-input bg-muted px-4 py-6 text-sm font-medium text-muted-foreground outline-none transition-[color,box-shadow,background-color] hover:border-ring hover:bg-accent/40 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
  coverPreview: 'h-20 max-w-full rounded-xl border border-input object-cover',
  footer: 'border-t border-input px-6 py-4',
  actionButton: 'rounded-xl',
} as const
