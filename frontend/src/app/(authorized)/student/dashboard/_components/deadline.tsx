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
    <div
      className={cn(
        'bg-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 border border-slate-100 shadow-xs',
        isPast && 'opacity-50'
      )}>
      <div className="flex flex-row items-center gap-4">
        {/* Date Badge */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0',
            isPast ? 'bg-slate-50 text-slate-400' : 'bg-red-50 text-red-500'
          )}>
          <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{month}</span>
          <span className="text-lg font-extrabold tracking-tight leading-none">{day}</span>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h4 className="font-semibold text-[14px] leading-tight text-slate-800">{title}</h4>
            <span
              className={cn(
                'px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-md shrink-0',
                isPast ? 'bg-red-50 text-red-400' : 'bg-amber-50 text-amber-500'
              )}>
              {isPast ? 'Terlambat' : 'Segera'}
            </span>
          </div>
          <p className="text-[12px] font-medium text-slate-400">{course}</p>
        </div>
      </div>

      {/* Action */}
      <button
        className={cn(
          'px-4 py-2 rounded-xl font-semibold text-[12px] whitespace-nowrap w-full sm:w-auto transition-colors duration-200',
          isPast ? 'bg-slate-50 text-slate-400' : 'bg-primary/8 text-primary'
        )}>
        {isPast ? 'Lihat Detail' : 'Selesaikan'}
      </button>
    </div>
  )
}
