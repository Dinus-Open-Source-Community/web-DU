import { cn } from '@/lib/utils'

interface DeadlineItemProps {
  month: string
  day: string
  title: string
  course: string
  isPast?: boolean
}

export default function DeadlineItem({ month, day, title, course, isPast }: DeadlineItemProps) {
  return (
    <div className={cn('bg-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 border border-slate-100 shadow-xs', isPast && 'opacity-50')}>
      <div className="flex flex-row items-center gap-4">
        {/* Date Badge */}
        <div className={cn('w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0', isPast ? 'bg-slate-50 text-slate-400' : 'bg-red-50 text-red-500')}>
          <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{month}</span>
          <span className="text-lg font-extrabold tracking-tight leading-none">{day}</span>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center">
          <h4 className="font-bold text-slate-900 leading-snug">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{course}</p>
        </div>
      </div>

      {/* Status */}
      <div className="text-right">
        <span className={cn('text-xs font-bold uppercase tracking-widest', isPast ? 'text-slate-400' : 'text-slate-600')}>{isPast ? 'Terlewat' : 'Mendatang'}</span>
      </div>
    </div>
  )
}
