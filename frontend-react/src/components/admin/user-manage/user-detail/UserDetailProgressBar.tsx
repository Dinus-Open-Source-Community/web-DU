type UserDetailProgressBarProps = {
  label: string
  percent: number
}

export function UserDetailProgressBar({ label, percent }: UserDetailProgressBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">Progres belajar</span>
        <span className="text-xs font-semibold tabular-nums text-slate-700">{label}</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progres belajar ${label}`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
