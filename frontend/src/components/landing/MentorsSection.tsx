import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import SectionHeader from '@/components/playful/SectionHeader'
import MentorCard from '@/components/landing/MentorCard'
import { LANDING_MENTORS } from '@/lib/landing/mentors'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * Mentors — komposisi pecah (asimetris): header rata-kiri di atas kolom angka
 * editorial, lalu tiga kartu foto dengan expand-on-hover. Beda material &
 * irama dari Stack (kartu pastel) dan Courses (kartu kertas).
 */
export default function MentorsSection() {
  const { mentors } = LANDING_COPY
  const [activeIndex, setActiveIndex] = useState<number | null>(0)
  // Inisialisasi sinkron dari matchMedia (hindari flash grid→accordion di desktop).
  const [isLg, setIsLg] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsLg(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return (
    <section id="mentor" className="relative overflow-hidden bg-paper-white">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        {/* Header kiri + angka editorial — istirahat dari header sentris */}
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeader
              eyebrow={mentors.eyebrow}
              title={mentors.title}
              copy={mentors.copy}
              align="left"
            />
          </div>
          <div className="hidden lg:col-span-5 lg:block">
            <p
              aria-hidden
              className="font-display text-ink-900/10 text-right text-[clamp(5rem,10vw,9rem)] leading-[0.8] font-bold tracking-tight select-none"
            >
              03
            </p>
            <p className="text-ink-400 mt-2 text-right text-xs font-extrabold tracking-[0.2em] uppercase">
              mentor aktif · tiga jalur belajar
            </p>
          </div>
          <p className="text-ink-400 mt-3 text-xs font-extrabold tracking-[0.2em] uppercase lg:hidden">
            mentor aktif · tiga jalur belajar
          </p>
        </div>

        {isLg ? (
          /* Accordion horizontal: kartu aktif (hover/focus) melebar, sisanya menyempit. */
          <div
            className="mx-auto mt-16 flex h-[540px] max-w-7xl items-stretch gap-3"
            onMouseLeave={() => setActiveIndex(null)}
          >
            {LANDING_MENTORS.map((mentor, i) => {
              const isActive = activeIndex === i
              return (
                <div
                  key={mentor.name}
                  onMouseEnter={() => setActiveIndex(i)}
                  onFocus={() => setActiveIndex(i)}
                  onBlur={() => setActiveIndex(null)}
                  tabIndex={0}
                  aria-label={`${mentor.name} — ${mentor.role}`}
                  aria-expanded={isActive}
                  className={cn(
                    'min-w-0 cursor-pointer rounded-[36px] outline-none transition-[flex-grow,flex-basis] duration-500 ease-out focus-visible:ring-4 focus-visible:ring-brand-blue/50',
                    isActive ? 'grow-[2.4] basis-0' : 'grow basis-0',
                  )}
                >
                  <MentorCard mentor={mentor} index={i} active={isActive} />
                </div>
              )
            })}
          </div>
        ) : (
          /* Grid normal (mobile/tablet): semua kartu menampilkan nama+role+tagline. */
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_MENTORS.map((mentor, i) => (
              <div key={mentor.name} className="h-[480px]">
                <MentorCard mentor={mentor} index={i} active />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
