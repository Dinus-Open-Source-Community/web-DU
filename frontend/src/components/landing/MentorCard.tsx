import { DialogTrigger } from '@/components/ui/dialog'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/playful/Reveal'
import { StickerTape } from '@/components/playful/Stickers'
import MentorDetailModal from '@/components/landing/MentorDetailModal'
import type { LandingMentor } from '@/lib/landing/mentors'
import { cn } from '@/lib/utils'

/** Latar fallback di belakang foto (terlihat saat gambar lambat/gagal). */
const FALLBACK_BG = ['bg-note-yellow', 'bg-note-mint', 'bg-note-peach'] as const

type MentorCardProps = {
  mentor: LandingMentor
  index?: number
  className?: string
  showRole?: boolean
}

/**
 * Kartu profil mentor bergaya polaroid editorial taktil — foto berbingkai, nama, peran, dan detail.
 * Klik membuka modal profil lengkap.
 */
export default function MentorCard({ mentor, index = 0, className }: MentorCardProps) {
  const roleDisplay = mentor.role && mentor.role !== 'mentor' ? mentor.role : 'Mentor Praktisi'

  return (
    <Reveal delay={(index % 4) * 0.08} className={cn('w-full', className)}>
      <article className="h-full">
        <MentorDetailModal mentor={mentor} index={index}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={`Lihat detail profil ${mentor.name}`}
              className="group relative flex h-full w-full min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-[20px] border-2 border-ink-900 bg-paper-white p-3.5 text-left shadow-paper transition-[translate] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/50 focus-visible:ring-inset motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
            >
              {/* Washi tape di atas kartu polaroid */}
              <StickerTape className="absolute -top-2 left-1/2 -translate-x-1/2 -rotate-2 z-10" />

              <div>
                {/* Foto profil berbingkai polaroid */}
                <div
                  className={cn(
                    'relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-ink-900/20 shadow-2xs',
                    FALLBACK_BG[index % FALLBACK_BG.length],
                  )}
                >
                  <img
                    src={mentor.photo}
                    alt={mentor.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-[center_25%]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>

                {/* Info Mentor */}
                <div className="mt-3">
                  <h3 className="font-display text-base font-bold leading-tight text-ink-900 line-clamp-1 sm:text-lg">
                    {mentor.name}
                  </h3>
                  <p className="mt-1 font-mono text-xs font-semibold text-ink-600">
                    {roleDisplay}
                  </p>
                </div>
              </div>

              {/* Footer Kartu Taktil */}
              <div className="mt-3.5 flex items-center justify-between border-t border-dashed border-ink-900/15 pt-2.5">
                <span className="font-mono text-[11px] font-bold text-ink-500">
                  {mentor.assignedCourses && typeof mentor.assignedCourses === 'number'
                    ? `${mentor.assignedCourses} Kelas Aktif`
                    : 'Praktisi Aktif'}
                </span>
                <span className="grid size-6 place-items-center rounded-lg border border-ink-900 bg-paper-white text-ink-900 shadow-2xs transition-all duration-200 group-hover:bg-note-yellow group-hover:translate-x-0.5">
                  <ArrowRight className="size-3" />
                </span>
              </div>
            </button>
          </DialogTrigger>
        </MentorDetailModal>
      </article>
    </Reveal>
  )
}
