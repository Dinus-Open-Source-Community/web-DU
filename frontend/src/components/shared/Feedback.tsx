import { appCardClassName } from '@/lib/design/app-shell-tokens'
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
    <div className={cn(appCardClassName, 'min-h-[210px] max-w-full overflow-hidden p-4 shadow-none transition-colors hover:bg-paper-paper')}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest',
            status === 'Lulus' ? 'bg-[#A8EFCF]/40 text-ink-900' : 'bg-note-yellow/30 text-ink-900',
          )}
        >
          {status}
        </div>
        <span className="shrink-0 text-xs font-medium text-ink-500">{time}</span>
      </div>
      <h4 className="mb-1 line-clamp-2 max-w-full break-all text-sm font-semibold leading-snug text-ink-900">
        {title}
      </h4>
      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-ink-600">{comment}</p>
      <div className="flex min-w-0 items-center gap-2">
        <img
          src={instructor?.avatar || '/Logo.svg'}
          alt={instructor?.name ?? 'Instructor'}
          width={24}
          height={24}
          loading="lazy"
          className="h-6 w-6 shrink-0 rounded-full object-cover"
        />
        <span className="truncate text-[11px] font-bold uppercase tracking-wider text-ink-500">
          {instructor?.name ?? 'Instructor'}
        </span>
      </div>
    </div>
  )
}
