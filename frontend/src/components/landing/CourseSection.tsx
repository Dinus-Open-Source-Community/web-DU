import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Compass,
  Layers,
  Rocket,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'
import Reveal from '@/components/playful/Reveal'
import { StickerTape, StickerStar, StickerSquiggle, StickerSparkle } from '@/components/playful/Stickers'
import { LANDING_COPY } from '@/lib/landing/copy'
import { useCourses } from '@/hooks/use-course'
import { apiLevelToUi } from '@/lib/course-form/level'
import { ROUTES } from '@/lib/routes'

const COURSES_QUERY_PARAMS = { page: 1, per_page: 4 } as const

const CARD_ACCENTS = [
  { bg: 'bg-note-mint' },
  { bg: 'bg-note-yellow' },
  { bg: 'bg-note-peach' },
  { bg: 'bg-note-sky' },
] as const

const FALLBACK_ICONS: LucideIcon[] = [BookOpen, Compass, Layers, Rocket]

const TAPE_POSITIONS = [
  'absolute -top-2 left-6 -rotate-2',
  'absolute -top-2 right-6 rotate-2',
  'absolute -top-2 left-8 rotate-1',
  'absolute -top-2 right-8 -rotate-1',
]

export default function CourseSection() {
  const { course } = LANDING_COPY
  const sectionRef = useRef<HTMLElement | null>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start 0.25'],
  })
  const rawY = useTransform(scrollYProgress, [0, 1], [72, 0])
  const y = useSpring(rawY, { stiffness: 120, damping: 24, mass: 0.35 })

  const { data, isLoading, isError } = useCourses(COURSES_QUERY_PARAMS)
  const courses = data?.courses?.slice(0, 4) ?? []

  return (
    <section ref={sectionRef} id="program" className="relative overflow-hidden bg-paper-white">
      {/* Garis batas atas kertas */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-ink-900/90" />
      {/* Dekorasi doodle */}
      <StickerStar className="pointer-events-none absolute right-[4%] top-8 hidden size-10 rotate-12 opacity-80 md:block" />
      <StickerSparkle className="pointer-events-none absolute left-[3%] bottom-20 hidden size-8 opacity-70 md:block" />

      {/* Pola titik (dot grid) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: 'radial-gradient(#050914 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
        }}
      />

      <motion.div
        style={reduceMotion ? undefined : { y }}
        className="relative mx-auto max-w-7xl px-6 py-16 will-change-transform md:px-10 md:py-24 lg:py-28"
      >
        {/* Header asimetris: judul besar */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal once={false} y={32} className="max-w-2xl">
            <span className="inline-block rounded-sm border-2 border-ink-900 bg-note-yellow px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-900 shadow-button -rotate-2">
              {course.eyebrow}
            </span>
            <h2 className="mt-5 font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[0.98] text-ink-900 [text-wrap:balance]">
              {course.title}
            </h2>
            <StickerSquiggle className="mt-3 h-4 w-40" />
          </Reveal>
        </div>

        {/* Content Area: Loading, Error/Empty, atau 4-Card Compact Grid */}
        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {[0, 1, 2, 3].map((i) => {
              const tapeClass = TAPE_POSITIONS[i % TAPE_POSITIONS.length]
              return (
                <div
                  key={i}
                  className="relative flex h-full flex-col justify-between rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-4 shadow-paper animate-pulse"
                >
                  <StickerTape className={tapeClass} />
                  <div>
                    <div className="aspect-[16/10] w-full rounded-xl border border-ink-900/15 bg-paper-panel" />
                    <div className="mt-3 h-3.5 w-1/3 rounded bg-ink-900/10" />
                    <div className="mt-2.5 h-5 w-3/4 rounded bg-ink-900/10" />
                    <div className="mt-2 space-y-1.5">
                      <div className="h-3.5 w-full rounded bg-ink-900/10" />
                      <div className="h-3.5 w-2/3 rounded bg-ink-900/10" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink-900/10 pt-3">
                    <div className="h-4 w-20 rounded bg-ink-900/10" />
                    <div className="size-7 rounded-lg border border-ink-900/10 bg-paper-panel" />
                  </div>
                </div>
              )
            })}
          </div>
        ) : isError || courses.length === 0 ? (
          <Reveal once={false} y={24} className="mt-10 sm:mt-12">
            <div className="mx-auto max-w-md py-10 text-center">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-note-yellow text-ink-900">
                <BookOpen className="size-6 text-ink-900" />
              </div>
              <h3 className="font-display text-xl font-bold text-ink-900">
                {isError ? 'Gagal Memuat Program Belajar' : 'Program Sedang Disiapkan'}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {isError
                  ? 'Terjadi kendala saat menghubungkan ke server. Silakan muat ulang halaman atau jelajahi katalog kursus.'
                  : 'Program belajar terbaru sedang dalam proses kurasi. Silakan lihat katalog lengkap kami.'}
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {courses.map((item, i) => {
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length]
              const FallbackIcon = FALLBACK_ICONS[i % FALLBACK_ICONS.length]
              const tapeClass = TAPE_POSITIONS[i % TAPE_POSITIONS.length]
              const levelLabel = apiLevelToUi(item.level)
              const detailHref = ROUTES.courseDetail(item.uid)
              const ratingValue = item.rating !== undefined ? Number(item.rating) : null
              const hasReviews = Boolean(ratingValue && ratingValue > 0 && item.total_reviews)
              const primaryMentor = item.mentors && item.mentors.length > 0 ? item.mentors[0] : null

              return (
                <Reveal key={item.uid} once={false} y={32} delay={i * 0.06} className="h-full">
                  <Link
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
                        {/* Fallback Icon */}
                        <div className="absolute inset-0 flex items-center justify-center p-3 select-none opacity-35">
                          <FallbackIcon className="size-8 text-ink-900" />
                        </div>

                        {item.cover_url ? (
                          <img
                            src={item.cover_url}
                            alt={item.title}
                            loading="lazy"
                            className="relative z-1 h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : null}
                      </div>

                      {/* Metadata Bar (Level & Rating) — Netral, Tanpa Chip */}
                      <div className="mt-3 flex items-center justify-between border-b border-ink-900/10 pb-2 text-xs font-bold">
                        <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-ink-600">
                          {levelLabel}
                        </span>
                        {hasReviews ? (
                          <div className="flex items-center gap-1 text-ink-700">
                            <Star className="fill-note-yellow size-3 text-ink-900" />
                            <span className="font-mono text-[11px] font-bold">{ratingValue?.toFixed(1)}</span>
                            <span className="text-[10px] font-normal text-ink-400">({item.total_reviews})</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Course Title — Warna Ink Tetap, Tanpa Hover Biru */}
                      <h3 className="mt-2.5 line-clamp-2 font-display text-base font-bold leading-snug text-ink-900">
                        {item.title}
                      </h3>

                      {/* Course Description */}
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-600">
                        {item.description || item.subtitle}
                      </p>
                    </div>

                    {/* Footer Kartu Kompak: Info Mentor & Tombol Aksi */}
                    <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink-900/15 pt-3">
                      {primaryMentor ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-700">
                          <img
                            src={primaryMentor.avatar_url}
                            alt={primaryMentor.name}
                            className="size-4 rounded-full border border-ink-900 object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <span className="line-clamp-1">{primaryMentor.name}</span>
                        </div>
                      ) : (
                        <span />
                      )}

                      <span className="grid size-7 place-items-center rounded-lg border border-ink-900 bg-paper-white text-ink-900 shadow-2xs transition-all duration-200 group-hover:bg-note-yellow group-hover:translate-x-0.5">
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        )}
      </motion.div>
    </section>
  )
}
