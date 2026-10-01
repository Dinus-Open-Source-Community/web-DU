import {
  appCardClassName,
  appKpiLabelClassName,
  appPageSubtitleClassName,
  appPageTitleClassName,
  appSoftCardClassName,
} from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

/** Token permukaan dashboard (student/mentor/shared) — ikut tema gelap via ink/paper & semantik. */
export const dashboardSurface = {
  pageTitle: appPageTitleClassName,
  pageSubtitle: appPageSubtitleClassName,
  pageHeader: 'mb-0 space-y-1.5',
  sectionCard: appSoftCardClassName,
  compactCard: cn(appCardClassName, 'shadow-sm'),
  sectionTitle: 'text-base font-semibold tracking-tight text-ink-900 sm:text-lg',
  body: 'text-sm leading-relaxed text-ink-600',
  meta: appKpiLabelClassName,
  mutedText: 'text-sm text-muted-foreground',
  tableHeader: 'bg-paper-paper text-ink-500',
  tableRow: 'border-line-light hover:bg-paper-paper/80',
  tableCell: 'text-ink-700',
} as const
