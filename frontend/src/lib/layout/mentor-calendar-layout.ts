import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

/** Permukaan kalender mentor — selaras app shell ink/paper. */
export const mentorCalendarLayout = {
  aside: cn(appCardClassName, 'flex min-h-0 flex-col p-5 shadow-paper'),
  eventCard: cn(appCardClassName, 'p-3 shadow-none'),
  monthGrid: cn(appCardClassName, 'overflow-hidden p-0 shadow-none'),
  dayPanel: cn(appCardClassName, 'p-3 shadow-none'),
} as const
