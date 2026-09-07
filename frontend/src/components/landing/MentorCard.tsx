import { cn } from '@/lib/utils'
import Reveal from '@/components/playful/Reveal'
import type { LandingMentor } from '@/lib/landing/mentors'

/**
 * Foto mentor yang tersedia di public/images (3 foto kegiatan DOSCOM).
 * 4 mentor → dipetakan berurutan dengan modulo; foto landscape di-card portrait
 * di-crop object-cover (fokus tengah-atas).
 */
const MENTOR_PHOTOS = [
  '/images/_BW08644.JPG',
  '/images/_BW08702.JPG',
  '/images/_BW08640.JPG',
] as const

/** Latar fallback di belakang foto (terlihat saat gambar lambat/gagal). */
const FALLBACK_BG = ['bg-note-yellow', 'bg-note-mint', 'bg-note-peach', 'bg-note-pink'] as const

type MentorCardProps = { mentor: LandingMentor; index?: number; className?: string }

export default function MentorCard({ mentor, index = 0, className }: MentorCardProps) {
  const photo = MENTOR_PHOTOS[index % MENTOR_PHOTOS.length]
  return (
    <Reveal delay={(index % 4) * 0.1} className={cn('h-full', className)}>
      <article className="group relative h-full overflow-hidden rounded-[36px] border-2 border-ink-900 shadow-paper transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover">
        {/* Foto full-bleed; fallback pastel di belakangnya */}
        <div className={cn('absolute inset-0', FALLBACK_BG[index % FALLBACK_BG.length])} />
        <img
          src={photo}
          alt={mentor.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-[center_22%] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />

        {/* Overlay gelap di bawah untuk keterbacaan teks putih (satu-satunya
            gradient — fungsional, bukan dekoratif) */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/70 via-black/35 to-transparent"
        />

        {/* Nama + role di atas overlay */}
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h3 className="font-display text-2xl leading-tight font-bold text-paper-white">
            {mentor.name}
          </h3>
          <p className="mt-1 text-sm font-bold text-paper-white/70">{mentor.role}</p>
        </div>
      </article>
    </Reveal>
  )
}
