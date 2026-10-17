import {
  appShellGridOverlayClassName,
  appShellPageBgClassName,
  appSoftCardClassName,
} from '@/lib/design/app-shell-tokens'
import { dashboardSurface } from '@/lib/layout/dashboard-surface'
import {
  appPageContentClassName,
  dashboardPageStackClassName,
} from '@/lib/layout/page-layout'
import { cn } from '@/lib/utils'

/** Layout shell & permukaan halaman mentor (selaras admin dashboard). */
export const mentorDashboardLayout = {
  contentClassName: cn(appPageContentClassName, appShellPageBgClassName, 'relative'),
  gridOverlay: appShellGridOverlayClassName,
  pageStack: dashboardPageStackClassName,
  pageHeader: dashboardSurface.pageHeader,
  calendarSkeleton: cn(appSoftCardClassName, 'h-[700px] animate-pulse'),
} as const
