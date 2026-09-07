import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Reveal from '@/components/playful/Reveal'
import { StickerTape } from '@/components/playful/Stickers'
import type { StaticCourseAccent } from '@/lib/landing/courses'
import { LANDING_COURSES } from '@/lib/landing/courses'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * CourseSection — "daftar program": baris editorial (bukan kartu) di atas
 * lembar kertas lebar. Tiap baris = nomor stempel pastel + judul + level +
 * panah. Memecah irama 3-grid kartu berturut tanpa meninggalkan bahasa kertas.
 */

const STAMP_BG: Record<StaticCourseAccent, string> = {
  yellow: 'bg-note-yellow',
  mint: 'bg-note-mint',
  peach: 'bg-note-peach',
  pink: 'bg-note-pink',
  sky: 'bg-note-sky',
  lavender: 'bg-note-lavender',
}

export default function CourseSection() {
  const { course } = LANDING_COPY

  return (
    <section id="kursus" className="relative overflow-hidden bg-paper-panel">
      {/* Garis tepi atas — lembar terpisah */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-ink-900/90" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        {/* Header + CTA tidak sentris (variasi dari header tengah) */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl">
            <p className="text-brand-ink text-sm font-extrabold tracking-[0.2em] uppercase italic">
              {course.eyebrow}
            </p>
            <h2 className="text-ink-900 mt-3 font-display text-5xl leading-[0.95] font-bold text-balance md:text-6xl">
              {course.title}
            </h2>
            <p className="text-ink-600 mt-4 text-lg leading-relaxed">{course.copy}</p>
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
        <Reveal className="mt-14" delay={0.05}>
          <div className="relative rounded-[28px] border-2 border-ink-900 bg-paper-white px-6 py-4 shadow-paper sm:px-10">
            <StickerTape className="absolute -top-2.5 left-10 -rotate-3" />
            <StickerTape className="absolute -top-2.5 right-10 rotate-3" />

            <ol className="divide-y-2 divide-dashed divide-ink-900/15">
              {LANDING_COURSES.map((item, i) => (
                <li key={item.title}>
                  <Link
                    to={course.allHref}
                    className="group flex items-center gap-5 rounded-2xl px-2 py-6 outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-brand-blue/40 sm:gap-7 sm:px-3"
                  >
                    {/* Stempel nomor pastel */}
                    <span
                      aria-hidden
                      className={cn(
                        'font-display inline-grid size-14 shrink-0 place-items-center rounded-2xl border-2 border-ink-900 text-xl font-bold text-ink-900 shadow-button transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 sm:size-16 sm:text-2xl',
                        STAMP_BG[item.accent],
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block items-center gap-3">
                        <span className="text-ink-900 font-display text-xl leading-tight font-bold sm:text-2xl">
                          {item.title}
                        </span>
                        <span className="text-brand-ink ml-3 hidden rounded-full border border-ink-900/20 bg-paper-panel px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide uppercase sm:inline-block">
                          {item.level}
                        </span>
                      </span>
                      <span className="text-ink-600 mt-1.5 block text-sm leading-relaxed sm:text-base">
                        {item.desc}
                      </span>
                    </span>

                    <ArrowRight
                      aria-hidden
                      className="text-ink-900/40 size-6 shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-blue sm:size-7"
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
