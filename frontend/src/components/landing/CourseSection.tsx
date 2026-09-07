import { Link } from 'react-router-dom'
import { ArrowRight, Container, Palette, type LucideIcon } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/lib/utils'
import Reveal from '@/components/playful/Reveal'
import { StickerTape } from '@/components/playful/Stickers'
import type { StaticCourseAccent, StaticCourseIconKey } from '@/lib/landing/courses'
import { LANDING_COURSES } from '@/lib/landing/courses'
import { LANDING_COPY } from '@/lib/landing/copy'
import { BrandLaravelIcon, BrandNextjsIcon } from '@/lib/navigation'

/**
 * CourseSection — "daftar program": baris editorial (bukan kartu) di atas
 * lembar kertas lebar. Tiap baris = stempel ikon program pastel + judul +
 * level + panah. Memecah irama 3-grid kartu berturut tanpa meninggalkan
 * bahasa kertas. Nomor urut dipertahankan sebagai label kecil di pojok.
 */

type CourseIcon = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>

const STAMP_BG: Record<StaticCourseAccent, string> = {
  yellow: 'bg-note-yellow',
  mint: 'bg-note-mint',
  peach: 'bg-note-peach',
  pink: 'bg-note-pink',
  sky: 'bg-note-sky',
  lavender: 'bg-note-lavender',
}

/** iconKey → komponen: logo brand (Simple Icons) atau konsep lucide. */
const COURSE_ICON: Record<StaticCourseIconKey, CourseIcon> = {
  nextjs: BrandNextjsIcon,
  laravel: BrandLaravelIcon,
  palette: Palette,
  container: Container,
}

export default function CourseSection() {
  const { course } = LANDING_COPY

  return (
    <section id="kursus" className="relative overflow-hidden bg-paper-panel">
      {/* Garis tepi atas — lembar terpisah */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-ink-900/90" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24 lg:py-28">
        {/* Header + CTA tidak sentris (variasi dari header tengah) */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
          <Reveal className="max-w-2xl">
            <p className="text-brand-ink text-xs font-extrabold tracking-[0.2em] uppercase italic sm:text-sm">
              {course.eyebrow}
            </p>
            <h2 className="text-ink-900 mt-3 font-display text-[clamp(2rem,7.5vw,3.75rem)] leading-[1] font-bold text-balance md:text-6xl">
              {course.title}
            </h2>
            <p className="text-ink-600 mt-3 text-base leading-relaxed md:mt-4 md:text-lg">{course.copy}</p>
          </Reveal>
          <Reveal delay={0.1} className="shrink-0">
            <Link
              to={course.allHref}
              className="group/btn text-ink-900 hover:bg-note-yellow focus-visible:ring-brand-blue/50 inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-ink-900 bg-paper-white px-6 text-sm font-extrabold tracking-wider uppercase shadow-button outline-none transition-all hover:-translate-y-0.5 hover:shadow-button-hover focus-visible:ring-4"
            >
              {course.allLabel}
              <ArrowRight className="size-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {/* Lembar kertas lebar berisi daftar program */}
        <Reveal className="mt-10 sm:mt-14 md:mt-14" delay={0.05}>
          <div className="relative rounded-[28px] border-2 border-ink-900 bg-paper-white px-4 py-3 shadow-paper sm:px-10 sm:py-4">
            <StickerTape className="absolute -top-2.5 left-10 -rotate-3" />
            <StickerTape className="absolute -top-2.5 right-10 rotate-3" />

            <ol className="divide-y-2 divide-dashed divide-ink-900/15">
              {LANDING_COURSES.map((item, i) => (
                <li key={item.title}>
                  <Link
                    to={course.allHref}
                    className="group flex items-center gap-4 rounded-2xl px-2 py-5 outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-brand-blue/40 sm:gap-7 sm:px-3 sm:py-6"
                  >
                    {/* Stempel ikon program pastel + nomor urut kecil */}
                    <span
                      aria-hidden
                      className={cn(
                        'relative inline-grid size-14 shrink-0 place-items-center self-center rounded-2xl border-2 border-ink-900 text-ink-900 shadow-button transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 sm:size-16',
                        STAMP_BG[item.accent],
                      )}
                    >
                      {(() => {
                        const CourseIcon = COURSE_ICON[item.icon]
                        return (
                          <CourseIcon
                            aria-hidden
                            className="size-6 sm:size-7"
                            strokeWidth={2.4}
                          />
                        )
                      })()}
                      <span className="font-display absolute -top-1.5 -right-1.5 grid size-4.5 place-items-center rounded-md border border-ink-900 bg-paper-white text-[8px] leading-none font-bold sm:size-5 sm:text-[9px]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block items-center gap-3">
                        <span className="text-ink-900 font-display text-lg leading-tight font-bold sm:text-2xl">
                          {item.title}
                        </span>
                        <span className="text-brand-ink ml-3 hidden rounded-full border border-ink-900/20 bg-paper-panel px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide uppercase sm:inline-block">
                          {item.level}
                        </span>
                      </span>
                      <span className="text-ink-600 mt-1 block text-sm leading-relaxed sm:text-base">
                        {item.desc}
                      </span>
                    </span>

                    <ArrowRight
                      aria-hidden
                      className="text-ink-900/40 size-5 shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-blue sm:size-7"
                    />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
