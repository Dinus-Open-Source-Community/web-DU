import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Compass,
  Layers,
  Rocket,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react'

import { StickerTape } from '@/components/playful/Stickers'
import { detailLayout } from '@/lib/course-detail/detail-layout'
import { apiLevelToUi } from '@/lib/course-form/level'
import { ROUTES } from '@/lib/routes'
import type { ICourseItem } from '@/lib/types/course'
import { cn } from '@/lib/utils'

const CARD_ACCENTS = [
  { bg: 'bg-note-mint' },
  { bg: 'bg-note-yellow' },
  { bg: 'bg-note-peach' },
  { bg: 'bg-note-sky' },
  { bg: 'bg-note-lavender' },
  { bg: 'bg-note-pink' },
] as const

const FALLBACK_ICONS: LucideIcon[] = [BookOpen, Compass, Layers, Rocket, Sparkles]

const TAPE_POSITIONS = [
  'absolute -top-2.5 left-6 -rotate-2',
  'absolute -top-2.5 right-6 rotate-2',
  'absolute -top-2.5 left-8 rotate-1',
  'absolute -top-2.5 right-8 -rotate-1',
]

interface PopularCoursesStripProps {
  title?: string
  items: ICourseItem[]
  baseHref?: string
  className?: string
  itemsPerPage?: number
  isSidebar?: boolean
  limit?: number
}

export function PopularCoursesStrip({
  title = 'Kursus Populer',
  items,
  baseHref,
  className,
  isSidebar = false,
  limit = 3,
}: PopularCoursesStripProps) {
  const displayItems = useMemo(() => items.slice(0, limit), [items, limit])

  if (displayItems.length === 0) return null

  return (
    <section
      className={cn(
        detailLayout.sectionCard,
        isSidebar ? 'p-5 sm:p-6' : detailLayout.sectionPadding,
        className,
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2
          className={cn(
            isSidebar
              ? 'font-display text-lg sm:text-xl font-bold tracking-tight text-ink-900'
              : cn(detailLayout.sectionTitle),
          )}
        >
          {title}
        </h2>

        <Link
          to={baseHref ?? ROUTES.courses}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-ink-900 bg-paper-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-900 shadow-button transition-all hover:bg-note-yellow active:translate-x-[1px] active:translate-y-[1px]"
        >
          <span>Liat lebih</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 gap-5',
          !isSidebar && 'sm:grid-cols-2 lg:grid-cols-3',
        )}
      >
        {displayItems.map((course, i) => {
          const accent = CARD_ACCENTS[i % CARD_ACCENTS.length]
          const FallbackIcon = FALLBACK_ICONS[i % FALLBACK_ICONS.length]
          const tapeClass = TAPE_POSITIONS[i % TAPE_POSITIONS.length]
          const levelLabel = apiLevelToUi(course.level)
          const detailHref = ROUTES.courseDetail(course.uid)
          const ratingValue = course.rating !== undefined ? Number(course.rating) : null
          const hasReviews = Boolean(ratingValue && ratingValue > 0 && course.total_reviews)
          const primaryMentor =
            course.mentors && course.mentors.length > 0 ? course.mentors[0] : null

          return (
            <Link
              key={course.uid}
              to={detailHref}
              className="group relative flex h-full flex-col justify-between rounded-[20px] border-2 border-ink-900 bg-paper-white p-4 shadow-paper transition-[translate] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 motion-reduce:transition-none outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/50 focus-visible:ring-inset"
            >
              <StickerTape className={tapeClass} />

              <div>
                {/* Visual Cover Frame */}
                <div
                  className={cn(
                    'relative aspect-[16/10] w-full overflow-hidden rounded-xl border-2 border-ink-900 shadow-2xs',
                    accent.bg,
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-3 select-none opacity-30">
                    <FallbackIcon className="size-8 text-ink-900" />
                  </div>

                  {course.cover_url || course.thumbnail_url ? (
                    <img
                      src={course.cover_url || course.thumbnail_url}
                      alt={course.title}
                      loading="lazy"
                      className="relative z-1 h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : null}
                </div>

                {/* Metadata Bar (Level & Rating) */}
                <div className="mt-3.5 flex items-center justify-between border-b border-ink-900/10 pb-2 text-xs font-bold">
                  <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-ink-600">
                    {levelLabel}
                  </span>
                  {hasReviews ? (
                    <div className="flex items-center gap-1 text-ink-700">
                      <Star className="size-3 fill-note-yellow text-ink-900" />
                      <span className="font-mono text-[11px] font-bold">
                        {ratingValue?.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-normal text-ink-400">
                        ({course.total_reviews})
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Course Title */}
                <h3 className="mt-2.5 line-clamp-2 font-display text-base font-bold leading-snug text-ink-900">
                  {course.title}
                </h3>

                {/* Course Description */}
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-600">
                  {course.description || course.subtitle}
                </p>
              </div>

              {/* Bottom Bar: Primary Mentor & Action Arrow Button */}
              <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink-900/15 pt-3">
                {primaryMentor ? (
                  <div className="flex items-center gap-2 min-w-0">
                    {primaryMentor.avatar_url ? (
                      <img
                        src={primaryMentor.avatar_url}
                        alt={primaryMentor.name}
                        className="size-5 shrink-0 rounded-full border border-ink-900 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="grid size-5 shrink-0 place-items-center rounded-full border border-ink-900 bg-note-yellow font-mono text-[9px] font-bold text-ink-900">
                        {primaryMentor.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate text-xs font-bold text-ink-800">
                      {primaryMentor.name}
                    </span>
                  </div>
                ) : (
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-500">
                    Komunitas Doscom
                  </span>
                )}

                <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-ink-900 bg-paper-white text-ink-900 shadow-2xs transition-all duration-200 group-hover:bg-note-yellow group-hover:translate-x-0.5">
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
