import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
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
}

function useResponsiveItemsPerPage(fallback = 3) {
  const [itemsPerPage, setItemsPerPage] = useState(fallback)

  useEffect(() => {
    const mediaSm = window.matchMedia('(min-width: 640px)')
    const mediaLg = window.matchMedia('(min-width: 1024px)')

    const updateItemsPerPage = () => {
      if (mediaLg.matches) {
        setItemsPerPage(3)
        return
      }

      if (mediaSm.matches) {
        setItemsPerPage(2)
        return
      }

      setItemsPerPage(1)
    }

    updateItemsPerPage()
    mediaSm.addEventListener('change', updateItemsPerPage)
    mediaLg.addEventListener('change', updateItemsPerPage)

    return () => {
      mediaSm.removeEventListener('change', updateItemsPerPage)
      mediaLg.removeEventListener('change', updateItemsPerPage)
    }
  }, [])

  return itemsPerPage
}

export function PopularCoursesStrip({
  title = 'Kursus populer',
  items,
  className,
  itemsPerPage: itemsPerPageOverride,
  isSidebar = false,
}: PopularCoursesStripProps) {
  const responsiveItemsPerPage = useResponsiveItemsPerPage()
  const itemsPerPage = itemsPerPageOverride ?? (isSidebar ? 2 : responsiveItemsPerPage)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return items.slice(startIndex, startIndex + itemsPerPage)
  }, [currentPage, items, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages))
    }
  }, [currentPage, totalPages])

  if (items.length === 0) return null

  return (
    <section
      className={cn(
        detailLayout.sectionCard,
        isSidebar ? 'p-5 sm:p-6' : detailLayout.sectionPadding,
        className,
      )}
    >
      <h2
        className={cn(
          isSidebar
            ? 'mb-5 font-display text-lg sm:text-xl font-bold tracking-tight text-ink-900'
            : cn(detailLayout.sectionTitle, 'mb-6'),
        )}
      >
        {title}
      </h2>

      <div
        className={cn(
          'grid grid-cols-1 gap-5',
          !isSidebar && 'sm:grid-cols-2 lg:grid-cols-3',
        )}
      >
        {paginatedItems.map((course, i) => {
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
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="size-6 shrink-0 overflow-hidden rounded-full border border-ink-900/30 bg-note-yellow/60">
                      {primaryMentor.avatar_url ? (
                        <img
                          src={primaryMentor.avatar_url}
                          alt={primaryMentor.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center font-mono text-[10px] font-bold text-ink-900">
                          {primaryMentor.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="truncate text-xs font-bold text-ink-700">
                      {primaryMentor.name}
                    </span>
                  </div>
                ) : (
                  <span className="font-mono text-xs font-semibold text-ink-500">
                    Komunitas Doscom
                  </span>
                )}

                <div
                  className="grid size-8 place-items-center rounded-lg border-2 border-ink-900 bg-note-yellow text-ink-900 shadow-2xs transition-all group-hover:bg-brand-blue"
                  aria-hidden
                >
                  <ArrowRight className="size-4 -rotate-45 transition-transform duration-200 group-hover:rotate-0" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5 border-t-2 border-dashed border-ink-900/15 pt-5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border-2 border-ink-900 bg-paper-white px-2 font-mono text-xs font-bold text-ink-900 shadow-2xs transition-all hover:bg-paper-panel active:translate-x-[1px] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="size-3.5" />
            <span className={cn('hidden', !isSidebar && 'sm:inline')}>Sebelumnya</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1
              const isActive = currentPage === pageNumber
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  aria-label={`Halaman ${pageNumber}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'grid size-8 place-items-center rounded-lg border-2 border-ink-900 font-mono text-xs font-bold transition-all active:translate-x-[1px] active:translate-y-[1px]',
                    isActive
                      ? 'bg-note-yellow text-ink-900'
                      : 'bg-paper-white text-ink-700 hover:bg-paper-panel hover:text-ink-900',
                  )}
                >
                  {pageNumber}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border-2 border-ink-900 bg-paper-white px-2 font-mono text-xs font-bold text-ink-900 shadow-2xs transition-all hover:bg-paper-panel active:translate-x-[1px] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Halaman berikutnya"
          >
            <span className={cn('hidden', !isSidebar && 'sm:inline')}>Selanjutnya</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </section>
  )
}
