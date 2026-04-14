import { CalendarViewMode } from './types'

export const VIEW_OPTIONS: Array<{ label: string; value: CalendarViewMode }> = [
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
  { label: 'Day', value: 'day' },
  { label: 'Agenda', value: 'agenda' },
]

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Keep this fixed so aside height remains stable while content scrolls.
export const UPCOMING_PANEL_HEIGHT_CLASS = 'xl:h-[700px]'
