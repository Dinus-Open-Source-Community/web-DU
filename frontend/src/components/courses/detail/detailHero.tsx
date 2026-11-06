import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { detailLayout } from '@/lib/course-detail/detail-layout'
import { apiLevelToUi } from '@/lib/course-form/level'
import { ROUTES } from '@/lib/routes'

interface CourseDetailHeroProps {
  title: string
  description?: string
  category: string
  courseType?: string
  level?: string
  isEnrolled?: boolean
  rating?: number
  totalReviews?: number
  slot?: number
  mentorName?: string
  mentorAvatar?: string
  backHref?: string
  backLabel?: string
  actions?: ReactNode
}

export function CourseDetailHero({
  title,
  description,
  category,
  courseType,
  level,
  isEnrolled,
  backHref = ROUTES.courses,
  backLabel = 'Kembali ke katalog',
  actions,
}: CourseDetailHeroProps) {
  const levelLabel = level ? apiLevelToUi(level) : null

  return (
    <div className="flex flex-col gap-5">
      {/* Top Nav: Back button */}
      <div>
        <Link to={backHref} className={detailLayout.backLink}>
          <ArrowLeft className="size-4 shrink-0 text-ink-900" aria-hidden />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        {category && (
          <span className="inline-block rounded-sm border-2 border-ink-900 bg-note-yellow px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-ink-900 shadow-2xs -rotate-1">
            {category}
          </span>
        )}

        {courseType && (
          <span className="inline-block rounded-sm border-2 border-ink-900 bg-note-sky px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-900 shadow-2xs">
            {courseType}
          </span>
        )}

        {levelLabel && (
          <span className="inline-block rounded-sm border-2 border-ink-900 bg-paper-panel px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-800 shadow-2xs">
            Level: {levelLabel}
          </span>
        )}

        {isEnrolled && (
          <span className="inline-block rounded-sm border-2 border-ink-900 bg-note-mint px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-ink-900 shadow-2xs">
            ✓ Sudah Terdaftar
          </span>
        )}
      </div>

      {/* Main Title */}
      <h1 className="font-display text-3xl font-black tracking-tight text-ink-900 sm:text-4xl lg:text-[2.85rem] leading-[1.12] [text-wrap:balance]">
        {title}
      </h1>

      {/* Course Subtitle/Description */}
      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
          {description}
        </p>
      ) : null}

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
