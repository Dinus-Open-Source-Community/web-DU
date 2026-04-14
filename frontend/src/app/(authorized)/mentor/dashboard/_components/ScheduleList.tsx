import { cn } from '@/lib/utils'
import { IScheduleItem } from '@/lib/types'
import { Globe, MapPin, Users } from 'lucide-react'

interface ScheduleListProps {
  items: IScheduleItem[]
}

export default function ScheduleList({ items }: ScheduleListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.uid}
          className="bg-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 border border-slate-100 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex flex-row items-center gap-4 flex-1">
            {/* Time Badge */}
            <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 bg-primary/10 text-primary">
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{item.scheduleTime.split(':')[0]}</span>
              <span className="text-sm font-extrabold tracking-tight leading-none">{item.scheduleTime.split(':')[1]}</span>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center flex-1">
              <h4 className="font-bold text-slate-900 leading-snug line-clamp-1">{item.courseName}</h4>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  {item.classType === 'online' ? <Globe size={14} /> : <MapPin size={14} />}
                  {item.location}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Users size={14} />
                  {item.studentCount} students
                </span>
              </div>
            </div>
          </div>

          {/* Class Type Badge */}
          <div className="text-right flex items-center gap-3">
            <span className={cn('text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full', item.classType === 'online' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700')}>
              {item.classType === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
