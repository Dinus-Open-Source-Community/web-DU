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
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full', status === 'Lulus' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
          {status}
        </div>
        <span className="text-xs text-slate-400 font-medium">{time}</span>
      </div>
      <h4 className="font-bold text-slate-800 mb-1 leading-tight">{title}</h4>
      <p className="text-sm text-slate-600 mb-4">{comment}</p>
      <div className="flex items-center gap-2">
        <img src={instructor.avatar} alt={instructor.name} width={24} height={24} loading="lazy" className="w-6 h-6 rounded-full object-cover" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">{instructor.name}</span>
      </div>
    </div>
  )
}
