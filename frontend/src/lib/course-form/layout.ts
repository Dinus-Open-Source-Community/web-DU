export const courseFormLayout = {
  dialog:
    '!flex max-h-[min(90dvh,52rem)] flex-col gap-0 overflow-hidden rounded-2xl border-input p-0 sm:max-w-2xl !top-[max(1rem,5dvh)] !translate-y-0',
  header: 'shrink-0 border-b border-input px-6 pt-6 pb-4',
  title: 'text-lg font-semibold tracking-tight text-foreground',
  description: 'text-sm text-muted-foreground leading-relaxed',
  body:
    'max-h-[calc(90dvh-12.5rem)] overflow-y-auto overscroll-y-contain px-6 py-5 space-y-6 [touch-action:pan-y]',
  sectionTitle: 'text-[11px] font-bold uppercase tracking-widest text-muted-foreground',
  label: 'text-xs font-semibold uppercase tracking-wide text-muted-foreground',
  input:
    'w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground shadow-none outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-line-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
  textarea:
    'w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground shadow-none outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-line-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 resize-y',
  coverPreview:
    'h-20 max-w-full shrink-0 rounded-xl border-2 border-ink-900/10 object-cover aspect-video',
  coverUpload:
    'flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-900/15 bg-paper-paper px-4 py-3 text-center outline-none transition-[border-color,background-color] hover:border-ink-900/25 hover:bg-paper-white focus-within:border-brand-blue/40 focus-within:ring-2 focus-within:ring-brand-blue/20',
  footer: 'shrink-0 border-t border-input px-6 py-4',
  actionButton: 'rounded-xl',
} as const
