import { cn } from '@/lib/utils'
import Reveal from '@/components/playful/Reveal'
import type { LandingMentor } from '@/lib/landing/mentors'

/**
 * Foto mentor — 3 mentor, 3 foto, urutannya sengaja disamakan dengan
 * TESTIMONIALS (alfi/nafan/jariz) supaya wajah sama di dua tempat.
 */
const MENTOR_PHOTOS = [
  '/images/alfi.webp',
  '/images/nafan.webp',
  '/images/jariz.webp',
] as const

/** Latar fallback di belakang foto (terlihat saat gambar lambat/gagal). */
const FALLBACK_BG = ['bg-note-yellow', 'bg-note-mint', 'bg-note-peach'] as const

type MentorCardProps = {
  mentor: LandingMentor
  index?: number
  /** true = kartu sedang melebar (hover/focus desktop). Nama & role tampil penuh. */
  active?: boolean
  className?: string
}

export default function MentorCard({ mentor, index = 0, active = false, className }: MentorCardProps) {
  const photo = MENTOR_PHOTOS[index % MENTOR_PHOTOS.length]
  return (
    <Reveal delay={(index % 3) * 0.08} className={cn('h-full', className)}>
      <article
        className={cn(
          'group relative h-full overflow-hidden rounded-[36px] border-2 border-ink-900 bg-ink-800 shadow-paper transition-all duration-500 ease-out',
          active && 'shadow-button-hover',
        )}
      >
        {/* Foto full-bleed; fallback pastel di belakangnya */}
        <div className={cn('absolute inset-0', FALLBACK_BG[index % FALLBACK_BG.length])} />
        <img
          src={photo}
          alt={`${mentor.name} — ${mentor.role}`}
          loading="lazy"
          className={cn(
            'absolute inset-0 h-full w-full object-cover object-[center_30%] transition-all duration-700 ease-out',
            active && 'scale-[1.05]',
          )}
        />

        {/* Overlay gelap di bawah — selalu ada, lebih pekat saat kartu aktif */}
        <div
          aria-hidden
          className={cn(
            'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-500',
            active ? 'h-2/3 opacity-100' : 'h-2/3 opacity-60',
          )}
        />

        {/* Nama + role + tagline — nama tampil saat kartu melebar, tagline ikut saat desktop lebar */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 p-6 transition-all duration-500 ease-out',
            active
              ? 'translate-y-0 opacity-100 delay-200'
              : 'pointer-events-none translate-y-4 opacity-0',
          )}
        >
          <h3 className="font-display text-2xl leading-tight font-bold text-paper-white">
            {mentor.name}
          </h3>
          <p className="mt-1 text-sm font-bold text-brand-soft">{mentor.role}</p>
          <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-paper-white/85">
            {mentor.tagline}
          </p>
        </div>
      </article>
    </Reveal>
  )
}
