import {
  appShellGridOverlayClassName,
} from '@/lib/design/app-shell-tokens'
import { dashboardSurface } from '@/lib/layout/dashboard-surface'
import {
  appPageContentClassName,
  dashboardPageStackClassName,
} from '@/lib/layout/page-layout'

/** Layout shell halaman student dashboard — selaras mentor/admin. */
export const studentDashboardLayout = {
  contentClassName: appPageContentClassName,
  gridOverlay: appShellGridOverlayClassName,
  pageStack: dashboardPageStackClassName,
  pageHeader: dashboardSurface.pageHeader,
  emptyBlock:
    'rounded-xl border-2 border-dashed border-ink-900/10 bg-paper-paper/80 px-4 py-8 text-center text-sm font-medium text-ink-500',
} as const
