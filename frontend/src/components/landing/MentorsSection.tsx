import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import Reveal from '@/components/playful/Reveal'
import MentorCard from '@/components/landing/MentorCard'
import { LANDING_COPY } from '@/lib/landing/copy'
import { usePublicMentors } from '@/hooks/use-public-mentors'
import { toLandingMentor, type LandingMentor } from '@/lib/landing/mentors'

const TILTS = ['-rotate-1', 'rotate-1', 'rotate-1', '-rotate-1'] as const

/** Jumlah mentor pratinjau di beranda — sejajar 4 kolom. */
export const MENTOR_PREVIEW_COUNT = 4

export default function MentorsSection() {
  const { mentors } = LANDING_COPY
  const { data, isLoading, isError } = usePublicMentors(MENTOR_PREVIEW_COUNT)
  const preview: LandingMentor[] = data?.mentors.map(toLandingMentor) ?? []

  return (
    <section id="mentor" className="relative overflow-hidden bg-paper-panel">
      {/* Garis horizontal bergaris buku tulis (ruled lines) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'linear-gradient(to bottom, #050914 1px, transparent 1px)',
          backgroundSize: '100% 28px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 lg:py-28">
        {/* Header Seksi */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-block rounded-sm border-2 border-ink-900 bg-note-mint px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-900 shadow-button -rotate-1">
              {mentors.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight text-ink-900 [text-wrap:balance]">
              {mentors.title}
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              Belajar langsung dari praktisi yang aktif berkarya di industri dan siap mendampingi progresmu.
            </p>
          </div>
        </div>

        {/* Grid Kartu Mentor Polaroid — 4 Kolom Sejajar */}
        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-3.5 shadow-paper animate-pulse"
              />
            ))}
          </div>
        ) : isError || preview.length === 0 ? (
          <Reveal y={24} className="mt-10 sm:mt-12">
            <div className="mx-auto max-w-md py-10 text-center">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-note-mint text-ink-900">
                <Users className="size-6 text-ink-900" />
              </div>
              <h3 className="font-display text-xl font-bold text-ink-900">
                {isError ? 'Gagal Memuat Mentor' : 'Mentor Sedang Disiapkan'}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {isError
                  ? 'Terjadi kendala saat menghubungkan ke server. Silakan coba beberapa saat lagi.'
                  : 'Daftar mentor praktisi yang akan membimbingmu sedang dalam proses kurasi dan akan segera hadir.'}
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {preview.slice(0, 4).map((mentor, i) => (
              <MentorCard
                key={mentor.uid}
                mentor={mentor}
                index={i}
                className={cn(TILTS[i % TILTS.length])}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
