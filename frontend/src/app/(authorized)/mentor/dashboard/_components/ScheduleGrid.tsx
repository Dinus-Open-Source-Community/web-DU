import { IScheduleItem } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ScheduleGridProps {
  items: IScheduleItem[]
}

export default function ScheduleGrid({ items }: ScheduleGridProps) {
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getDayIndex = (date: string): number => {
    // Map date to day index (13-17 April 2026)
    const dateNum = parseInt(date.split(' ')[0])
    const dayMap: Record<number, number> = {
      13: 5, // Saturday
      14: 6, // Sunday
      15: 0, // Monday
      16: 1, // Tuesday
      17: 2, // Wednesday
    }
    return dayMap[dateNum] ?? 0
  }

  const getTimeSlotIndex = (time: string): number => {
    const hour = parseInt(time.split(':')[0])
    return Math.max(0, Math.min(timeSlots.length - 1, hour - 8))
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 p-4">
      <div className="min-w-fit">
        {/* Header */}
        <div className="grid gap-1" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
          <div className="py-2 px-3 text-xs font-bold text-slate-500"></div>
          {days.map((day) => (
            <div key={day} className="py-2 px-3 text-xs font-bold text-center text-slate-700">
              {day}
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="space-y-1">
          {timeSlots.map((time) => (
            <div key={time} className="grid gap-1" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
              {/* Time label */}
              <div className="py-2 px-3 text-xs font-semibold text-slate-600 text-right">{time}</div>

              {/* Day cells */}
              {days.map((_, dayIndex) => {
                const itemsInSlot = items.filter((item) => getDayIndex(item.scheduleDate) === dayIndex && getTimeSlotIndex(item.scheduleTime) === getTimeSlotIndex(time))

                return (
                  <div key={`${time}-${dayIndex}`} className={cn('min-h-20 py-2 px-2 rounded-lg border', itemsInSlot.length > 0 ? 'bg-primary/5 border-primary/30' : 'bg-slate-50 border-slate-100')}>
                    <div className="space-y-1">
                      {itemsInSlot.map((item) => (
                        <div
                          key={item.uid}
                          className={cn('p-1.5 rounded text-[11px] font-semibold truncate', item.classType === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700')}
                          title={item.courseName}>
                          {item.courseName.substring(0, 12)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
