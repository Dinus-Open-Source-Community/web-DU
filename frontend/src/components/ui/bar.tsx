import { formatLearningProgressLabel, toLearningProgressPercent } from '@/lib/learning/progress'

export const ProgressBar = ({ value }: { value: number }) => {
  const normalized = toLearningProgressPercent(value)
  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-paper-paper">
        <div className="h-full rounded-full bg-primary" style={{ width: `${normalized}%` }} />
      </div>
      <p className="text-xs font-medium tabular-nums text-ink-500">{formatLearningProgressLabel(value)}</p>
    </div>
  )
}
