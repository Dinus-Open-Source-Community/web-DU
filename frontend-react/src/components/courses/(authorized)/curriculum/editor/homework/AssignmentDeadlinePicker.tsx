import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { CalendarClock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  getTimeStringFromIso,
  mergeDateAndTimeToIso,
  parseIsoToDate,
} from '@/lib/course-edit/datetime-local'
import { cn } from '@/lib/utils'

import { editLayout } from '../../edit-layout'

type AssignmentDeadlinePickerProps = {
  id?: string
  value: string
  onChange: (iso: string) => void
}

export function AssignmentDeadlinePicker({
  id = 'assignment-deadline',
  value,
  onChange,
}: AssignmentDeadlinePickerProps) {
  const [open, setOpen] = useState(false)
  const selectedDate = parseIsoToDate(value)
  const timeValue = getTimeStringFromIso(value)
  const currentYear = new Date().getFullYear()

  const displayLabel = useMemo(() => {
    const date = parseIsoToDate(value)
    if (!date) return 'Pilih tanggal dan waktu'

    return format(date, 'd MMMM yyyy, HH:mm', { locale: localeId })
  }, [value])

  const applyDate = (date: Date | undefined) => {
    if (!date) return

    const iso = mergeDateAndTimeToIso(date, timeValue)
    if (iso) onChange(iso)
  }

  const applyTime = (time: string) => {
    const baseDate = selectedDate ?? new Date()
    const iso = mergeDateAndTimeToIso(baseDate, time)
    if (iso) onChange(iso)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            editLayout.control,
            'h-10 w-full justify-start rounded-lg px-3 font-normal',
            !selectedDate && 'text-muted-foreground',
          )}
        >
          <CalendarClock className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{displayLabel}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={applyDate}
          captionLayout="dropdown"
          fromYear={currentYear}
          toYear={currentYear + 5}
          locale={localeId}
          initialFocus
        />

        <div className="space-y-2 border-t border-slate-200 p-3">
          <label htmlFor={`${id}-time`} className={editLayout.fieldLabel}>
            Waktu
          </label>
          <Input
            id={`${id}-time`}
            type="time"
            value={timeValue}
            onChange={(event) => applyTime(event.target.value)}
            className="rounded-lg"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
