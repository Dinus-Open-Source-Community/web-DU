import { cn } from '@/lib/utils'
import Reveal from '@/components/playful/Reveal'
import { StickerTape } from '@/components/playful/Stickers'
import type { StaticCourse, StaticCourseAccent } from '@/lib/landing/courses'

/**
 * Kartu kursus statis — cover pastel sebagai objek visual utama (tanpa foto).
 * Nomor DynaPuff besar + tape di pojok; elemen aksen di cover bereaksi saat
 * hover (geser halus). Level tampil sebagai badge kertas.
 */

const ACCENT_BG: Record<StaticCourseAccent, string> = {
  yellow: 'bg-note-yellow',
  mint: 'bg-note-mint',
  peach: 'bg-note-peach',
  pink: 'bg-note-pink',
  sky: 'bg-note-sky',
  lavender: 'bg-note-lavender',
}

type StaticCourseCardProps = {
  course: StaticCourse
  index?: number
  className?: string
}

export default function StaticCourseCard({ course, index = 0, className }: StaticCourseCardProps) {
  const num = String(index + 1).padStart(2, '0')
  return (
    <Reveal delay={(index % 3) * 0.1} className={cn('h-full', className)}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border-2 border-ink-900 bg-paper-white shadow-paper transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover">
        {/* Cover pastel — objek visual utama */}
        <div className={cn('relative h-44 overflow-hidden border-b-2 border-ink-900', ACCENT_BG[course.accent])}>
          {/* Nomor kursus DynaPuff raksasa */}
          <span
            aria-hidden
            className="font-display text-ink-900/25 absolute -right-2 -bottom-5 text-[7rem] leading-none font-bold transition-transform duration-500 ease-out select-none group-hover:-translate-x-2 group-hover:-translate-y-1"
          >
            {num}
          </span>
          {/* Aksen lingkaran coret yang bergeser saat hover */}
          <span
            aria-hidden
            className="absolute top-6 -left-4 size-16 rounded-full border-[3px] border-ink-900/30 transition-transform duration-500 ease-out group-hover:translate-x-3 group-hover:rotate-12"
          />
          {/* Tape pojok kanan atas */}
          <StickerTape className="absolute top-3 right-4 rotate-6" />
          {/* Badge level */}
          <span className="absolute bottom-3 left-4 inline-block rounded-full border-2 border-ink-900 bg-paper-white px-3 py-0.5 text-xs font-extrabold text-ink-900 shadow-button">
            {course.level}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-xl leading-tight font-bold text-ink-900">
            {course.title}
          </h3>
          <p className="text-ink-600 mt-2 text-sm leading-relaxed">{course.desc}</p>
        </div>
      </article>
    </Reveal>
  )
}
