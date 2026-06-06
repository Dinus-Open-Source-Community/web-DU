import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { detailLayout } from '@/lib/course-detail/detail-layout'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

interface CourseDetailHeroProps {
  title: string
  description?: string
  category: string
  backHref?: string
  backLabel?: string
  actions?: ReactNode
}

export function CourseDetailHero({
  title,
  description,
  category,
  backHref = ROUTES.courses,
  backLabel = 'Kembali ke kursus',
  actions,
}: CourseDetailHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0a84dc_0%,#075e9c_100%)] text-white">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-white/5 blur-3xl"
        aria-hidden
      />

      <div
        className={cn(
          detailLayout.page,
          detailLayout.pageGutter,
          'relative flex flex-col gap-4 py-6 sm:gap-5 sm:py-8 lg:py-10',
        )}
      >
        <nav aria-label="Navigasi kursus">
          <Link to={backHref} className={detailLayout.backLink}>
            <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
            <span>{backLabel}</span>
          </Link>
        </nav>

        <div className="flex flex-col gap-2.5 sm:gap-3">
          <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
            {category}
          </span>
          <h1 className="max-w-3xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-[2.5rem]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">{description}</p>
          ) : null}
        </div>

        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  )
}
