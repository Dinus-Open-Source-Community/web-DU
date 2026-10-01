import { FormatRupiah } from '@/lib/func/func'
import { cn } from '@/lib/utils'

export const CourseInfoCard = ({ label, value, strike, isPrice }: { label: string; value: string | number; strike?: number; isPrice?: boolean }) => (
  <div className="flex items-center justify-between border-b border-border/60 pb-4 last:border-0 last:pb-0">
    <span className="text-xs font-medium text-ink-400">{label}</span>
    <div className="flex flex-col items-end">
      <span className={cn('text-sm font-bold', isPrice ? 'text-primary' : 'text-ink-900')}>{value}</span>
      {strike ? <span className="text-[10px] text-ink-400 line-through">{FormatRupiah(strike)}</span> : null}
    </div>
  </div>
)
