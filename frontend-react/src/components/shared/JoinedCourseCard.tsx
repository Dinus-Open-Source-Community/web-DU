import { Link } from 'react-router-dom'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ReactIcon } from './icon'
import type { JoinedCourse } from '@/lib/types/user'
import { Check } from 'lucide-react'

export type JoinedCourseCardVariant = 'resume' | 'non-resume'

interface JoinedCourseCardProps {
  data: JoinedCourse
  variant?: JoinedCourseCardVariant
}

const levelLabel: Record<JoinedCourse['level'], string> = {
  PEMULA: 'Pemula',
  MENENGAH: 'Menengah',
  LANJUTAN: 'Lanjutan',
}

const levelSignal: Record<JoinedCourse['level'], { activeBars: number; color: string }> = {
  PEMULA: { activeBars: 1, color: 'bg-emerald-500' },
  MENENGAH: { activeBars: 2, color: 'bg-sky-500' },
  LANJUTAN: { activeBars: 3, color: 'bg-violet-500' },
}

const clampProgress = (progress: number) => Math.min(100, Math.max(0, Math.round(progress)))

const CourseLevelSignal = ({ level }: { level: JoinedCourse['level'] }) => {
  const signal = levelSignal[level]

  return (
    <span className="inline-flex items-end gap-2 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
      <span className="flex h-4 items-end gap-0.5" aria-hidden>
        {[1, 2, 3].map((bar) => (
          <span key={bar} className={`w-1.5 rounded-full ${bar <= signal.activeBars ? signal.color : 'bg-slate-200'}`} style={{ height: `${bar * 4 + 4}px` }} />
        ))}
      </span>
      {levelLabel[level]}
    </span>
  )
}

const JoinedCourseCard = ({ data, variant = 'non-resume' }: JoinedCourseCardProps) => {
  const progress = clampProgress(data.progress)
  const isResume = variant === 'resume'
  const image = data.cover_url || data.thumbnail_url
  const actionHref = `/student/learning/course/${data.uid}`
  const actionLabel = isResume ? 'Lanjut' : 'Mulai'

  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-[10px] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-slate-300/90 hover:shadow-md">
      <div className="relative aspect-video  w-full shrink-0 overflow-hidden rounded-[10px]">
        {image ? (
          <img
            src={image}
            alt={data.title}
            loading="lazy"
            className="h-full w-full rounded-[10px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 384px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#D2E1ED] text-[#00D8FF]">
            <ReactIcon />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-slate-950/45 to-transparent" />
      </div>

      <div className="relative z-10 -mt-5 flex grow flex-col rounded-xl border border-slate-100/70 bg-white p-5 shadow-[0_-8px_24px_rgba(15,23,42,0.04)]">
        <div className="mb-5 flex flex-col">
          <div className="mb-3 flex items-center justify-between gap-3">
            <CourseLevelSignal level={data.level} />
            <span className="line-clamp-1 text-xs font-semibold text-slate-400">{data.subtitle}</span>
          </div>
          <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-slate-900">{data.title}</h3>
          <p className="line-clamp-2 text-sm font-normal leading-[1.55] text-slate-500">{data.description || data.subtitle}</p>
        </div>

        {isResume && (
          <div className="mt-auto mb-5 w-full rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Progres Belajar</span>
              <span className="text-xs font-bold text-primary">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <Check className="h-3.5 w-3.5" aria-hidden />
            <span className="line-clamp-1">Dapat diakses</span>
          </span>

          {progress === 100 ? (
            <Badge variant="progressComplete" />
          ) : (
            <Button asChild className="rounded-lg px-5 py-2 text-sm font-semibold shadow-none" variant="default" size="sm">
              <Link to={actionHref}>{actionLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default JoinedCourseCard
