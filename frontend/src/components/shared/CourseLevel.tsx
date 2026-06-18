import type { JoinedCourse } from '@/lib/types/user'

const levelSignal: Partial<Record<string, { activeBars: number; color: string }>> = {
  PEMULA: { activeBars: 1, color: 'bg-emerald-500' },
  MENENGAH: { activeBars: 2, color: 'bg-sky-500' },
  LANJUTAN: { activeBars: 3, color: 'bg-violet-500' },
}

export const CourseLevelSignal = ({ level }: { level?: JoinedCourse['level'] | string }) => {
  const signal = levelSignal[level ?? '']

  if (!signal) {
    return <span className="text-xs text-slate-400">-</span>
  }

  return (
    <span className="inline-flex items-end gap-2 rounded-full  px-2.5 py-1 text-xs font-semibold text-slate-500">
      <span className="flex h-4 items-end gap-0.5" aria-hidden>
        {[1, 2, 3].map((bar) => (
          <span key={bar} className={`w-1.5 rounded-full ${bar <= signal.activeBars ? signal.color : 'bg-slate-200'}`} style={{ height: `${bar * 4 + 4}px` }} />
        ))}
      </span>
    </span>
  )
}
