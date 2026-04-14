import { MONTH_LABELS, WEEKDAY_LABELS } from './constants'
import { CalendarViewMode } from './types'

export const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate())
export const endOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1)
export const addDays = (date: Date, days: number): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
export const addMonths = (date: Date, months: number): Date => new Date(date.getFullYear(), date.getMonth() + months, 1)

export const startOfWeek = (date: Date): Date => {
  const dayIndex = date.getDay()
  return addDays(startOfDay(date), -dayIndex)
}

export const endOfWeek = (date: Date): Date => {
  return endOfDay(addDays(startOfWeek(date), 6))
}

export const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime()
}

export const buildRangeLabel = (cursorDate: Date, mode: CalendarViewMode): string => {
  if (mode === 'month') {
    return `${MONTH_LABELS[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`
  }

  if (mode === 'day') {
    return `${WEEKDAY_LABELS[cursorDate.getDay()]}, ${cursorDate.getDate()} ${MONTH_LABELS[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`
  }

  const weekStart = startOfWeek(cursorDate)
  const weekEnd = addDays(weekStart, 6)

  if (mode === 'agenda') {
    const agendaEnd = addDays(startOfDay(cursorDate), 13)
    return `${cursorDate.getDate()} ${MONTH_LABELS[cursorDate.getMonth()]} - ${agendaEnd.getDate()} ${MONTH_LABELS[agendaEnd.getMonth()]} ${agendaEnd.getFullYear()}`
  }

  return `${weekStart.getDate()} ${MONTH_LABELS[weekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTH_LABELS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`
}
