function MetricBar({
  valuePercent,
  barClassName,
}: {
  valuePercent: number
  barClassName: string
}) {
  const clamped = Math.min(100, Math.max(0, valuePercent))
  return (
    <div className="flex min-w-[100px] max-w-[180px] flex-col gap-1.5">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-100/80">
        <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-slate-600">{clamped}%</span>
    </div>
  )
}

export function MaterialProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return <MetricBar valuePercent={clamped} barClassName="bg-primary/95" />
}

export function AttendanceRateBar({ present, total }: { present: number; total: number }) {
  const pct = total <= 0 ? 0 : Math.min(100, Math.round((present / total) * 100))
  return <MetricBar valuePercent={pct} barClassName="bg-emerald-500/90" />
}
