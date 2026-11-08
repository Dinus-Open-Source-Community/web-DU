import { courseFormLayout } from '@/lib/course-form/layout'
import {
  appCardClassName,
  appKpiLabelClassName,
  appPageSubtitleClassName,
  appPageTitleClassName,
  appToolbarPrimaryButtonClassName,
} from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

/** Halaman Settings (/profile) — selaras app shell ink/paper & form token. */
export const settingsLayout = {
  page: 'mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-5',
  pageTitle: appPageTitleClassName,
  pageSubtitle: appPageSubtitleClassName,
  card: cn(appCardClassName, 'p-4 sm:p-6'),
  cardLg: cn(appCardClassName, 'p-5 sm:p-8'),
  sectionTitle: cn('text-base font-semibold tracking-tight text-ink-900 sm:text-lg'),
  sectionDescription: cn(appPageSubtitleClassName, 'max-w-2xl text-sm'),
  cardHeader: 'mb-5 flex flex-col gap-1.5 sm:mb-5',
  personalRows:
    'divide-y-2 divide-ink-900/10 overflow-hidden rounded-xl border-2 border-ink-900/10 bg-paper-white',
  personalRow:
    'flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:px-5 sm:py-5',
  personalRowCopy: 'min-w-0 sm:max-w-[42%]',
  personalRowLabel: 'text-sm font-semibold text-ink-900',
  personalRowHint: 'mt-0.5 text-xs font-medium leading-relaxed text-ink-500',
  personalRowValue:
    'text-sm font-semibold text-ink-900 sm:text-right break-all',
  personalRowControl: 'w-full min-w-0 sm:max-w-md sm:flex-1',
  formSingleColumn: 'flex max-w-lg flex-col gap-4',
  formActions:
    'flex flex-col-reverse gap-3 border-t border-line-light pt-4 sm:flex-row sm:justify-end',
  securityGrid:
    'grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:items-start',
  sectionHeading: cn(
    appKpiLabelClassName,
    'text-[11px] font-bold uppercase tracking-widest text-brand-ink',
  ),
  fieldLabel: courseFormLayout.label,
  fieldLabelMd: 'text-sm font-medium text-ink-700',
  meta: 'text-sm font-medium text-ink-500',
  input: courseFormLayout.input,
  readOnlyInput: cn(
    courseFormLayout.input,
    'cursor-not-allowed bg-paper-paper text-ink-500',
  ),
  avatarFrame:
    'relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-ink-900/10 bg-paper-paper p-1',
  avatarInner:
    'relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-note-mint/50',
  avatarFallback: 'text-2xl font-bold text-ink-900',
  displayName: 'text-xl font-bold tracking-tight text-ink-900 sm:text-2xl',
  roleBadge:
    'rounded-md border border-line-light bg-paper-paper px-2.5 py-1 text-xs font-medium text-ink-700',
  divider: 'border-b-2 border-ink-900/10',
  subsection: 'flex flex-col gap-4 pb-6',
  formGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5',
  formStack: 'flex flex-col gap-5',
  fieldStack: 'flex flex-col gap-2',
  errorText: 'ml-1 text-xs font-medium text-destructive',
  primaryButton: cn(appToolbarPrimaryButtonClassName, 'rounded-xl border-ink-900/10'),
  outlineButton:
    'inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border-2 border-ink-900/10 bg-paper-white px-4 text-sm font-semibold text-ink-900 shadow-none transition-colors hover:bg-paper-paper focus-visible:ring-3 focus-visible:ring-ring/30 aria-disabled:pointer-events-none aria-disabled:opacity-60',
} as const
