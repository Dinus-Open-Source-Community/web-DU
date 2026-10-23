type UserDetailProgressBarProps = {
  label: string
  percent: number
}

export function UserDetailProgressBar({ label, percent }: UserDetailProgressBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-ink-500">Progres belajar</span>
        <span className="text-xs font-bold tabular-nums text-ink-800">{label}</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full border border-line-light bg-paper-paper"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progres belajar ${label}`}
      >
        <div
          className="h-full rounded-full bg-brand-blue transition-[width] duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
