import { cn } from '@/lib/utils'
import Reveal from '@/components/playful/Reveal'
import type { LandingMentor } from '@/lib/landing/mentors'

/**
 * Foto mentor yang tersedia di public/images (3 foto kegiatan DOSCOM).
 * 4 mentor → dipetakan berurutan dengan modulo.
 */
const MENTOR_PHOTOS = [
  '/images/_BW08644.JPG',
  '/images/_BW08702.JPG',
  '/images/_BW08640.JPG',
] as const

/** Latar fallback di belakang foto (terlihat saat gambar lambat/gagal). */
const FALLBACK_BG = ['bg-note-yellow', 'bg-note-mint', 'bg-note-peach', 'bg-note-pink'] as const

type MentorCardProps = {
  mentor: LandingMentor
  index?: number
  /** true = kartu sedang melebar (hover/focus). Nama & role hanya tampil di sini. */
  active?: boolean
  className?: string
}

export default function MentorCard({ mentor, index = 0, active = false, className }: MentorCardProps) {
  const photo = MENTOR_PHOTOS[index % MENTOR_PHOTOS.length]
  return (
    <Reveal delay={(index % 4) * 0.08} className={cn('h-full', className)}>
      <article
        className={cn(
          'relative h-full overflow-hidden rounded-[36px] border-2 border-ink-900 bg-ink-800 shadow-paper transition-all duration-500 ease-out',
          active && 'shadow-button-hover',
        )}
      >
        {/* Foto full-bleed; fallback pastel di belakangnya */}
        <div className={cn('absolute inset-0', FALLBACK_BG[index % FALLBACK_BG.length])} />
        <img
          src={photo}
          alt={mentor.name}
          loading="lazy"
          className={cn(
            'absolute inset-0 h-full w-full object-cover object-[center_22%] transition-all duration-700 ease-out',
            active && 'scale-[1.04]',
          )}
        />

        {/* Overlay gelap di bawah — selalu ada, lebih pekat saat kartu aktif */}
        <div
          aria-hidden
          className={cn(
            'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-500',
            active ? 'h-2/3 opacity-100' : 'h-2/3 opacity-0',
          )}
        />

        {/* Nama + role — hanya tampil saat kartu melebar */}
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
          <p className="mt-1 text-sm font-bold text-paper-white/70">{mentor.role}</p>
        </div>
      </article>
    </Reveal>
  )
}
