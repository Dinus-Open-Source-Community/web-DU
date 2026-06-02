import { cn } from '@/lib/utils'

interface IFeedbackCardProps {
  status: 'Lulus' | 'Perlu Revisi'
  time: string
  title: string
  comment: string
  instructor: {
    name: string
    avatar: string
  }
}

export default function FeedbackCard({ status, time, title, comment, instructor }: IFeedbackCardProps) {
  return (
    <div className="max-w-full overflow-hidden rounded-[10px] border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className={cn('shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest', status === 'Lulus' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
          {status}
        </div>
        <span className="shrink-0 text-xs font-medium text-slate-400">{time}</span>
      </div>
      <h4 className="mb-1 line-clamp-2 max-w-full break-all text-sm font-bold leading-snug text-slate-800">{title}</h4>
      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-600">{comment}</p>
      <div className="flex min-w-0 items-center gap-2">
        <img src={instructor?.avatar || '/pinguin.png'} alt={instructor?.name ?? 'Instructor'} width={24} height={24} loading="lazy" className="h-6 w-6 shrink-0 rounded-full object-cover" />
        <span className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">{instructor?.name ?? 'Instructor'}</span>
      </div>
    </div>
  )
}
