import { DialogTrigger } from '@/components/ui/dialog'
import { SOCIAL_ICONS } from '@/components/profile/SettingsSocialSection'
import Reveal from '@/components/playful/Reveal'
import MentorDetailModal from '@/components/landing/MentorDetailModal'
import type { LandingMentor } from '@/lib/landing/mentors'
import { socialPlatformLabel } from '@/lib/profile/social-links'
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
 * Kartu profil mentor portrait 3:4 — foto, nama, course yang diajar, sosmed.
 * Klik area kartu (foto/nama/course) membuka modal detail.
 */
export default function MentorCard({ mentor, index = 0, className, showRole = true }: MentorCardProps) {
  return (
    <Reveal delay={(index % 3) * 0.08} className={cn('w-full', className)}>
      <article className="flex aspect-[3/4] w-full min-w-0 flex-col overflow-hidden rounded-[20px] border-2 border-ink-900 bg-paper-white shadow-paper transition-[translate] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 motion-reduce:transition-none">
        <MentorDetailModal mentor={mentor} index={index}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={showRole ? `Lihat detail ${mentor.name} — ${mentor.role}` : `Lihat detail profil ${mentor.name}`}
              className="flex min-h-0 w-full flex-1 cursor-pointer flex-col text-left outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/50 focus-visible:ring-inset"
            >
              {/* Foto profil mengisi ruang portrait card */}
              <div className={cn('relative min-h-0 w-full flex-1 overflow-hidden border-b-2 border-ink-900', FALLBACK_BG[index % FALLBACK_BG.length])}>
                <img
                  src={mentor.photo}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 pb-3 pt-10 sm:px-4 sm:pb-4">
                  <h3 className="font-sans text-lg leading-tight font-bold text-white sm:text-xl">
                    {mentor.name}
                  </h3>
                </div>
              </div>

              {showRole || mentor.courses.length > 0 ? (
                <div className="p-3 sm:p-4">
                  {showRole ? <p className="text-xs font-bold text-brand-ink sm:text-sm">{mentor.role}</p> : null}
                  {mentor.courses.length > 0 ? (
                    <ul className={cn('flex flex-wrap gap-1.5', showRole ? 'mt-2' : '')} aria-label={`Course yang diajar ${mentor.name}`}>
                      {mentor.courses.map((course) => (
                        <li
                          key={course}
                          className="rounded-md border border-line-light bg-paper-paper px-2 py-0.5 text-xs font-medium text-ink-700"
                        >
                          {course}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </button>
          </DialogTrigger>
        </MentorDetailModal>

        {/* Sosmed — di luar tombol modal agar link tetap bisa diklik */}
        {mentor.socials.length > 0 ? (
          <div className="mt-auto flex items-center gap-1.5 border-t-2 border-dashed border-ink-900/15 px-3 py-2.5">
            {mentor.socials.map((social) => {
              const Icon = SOCIAL_ICONS[social.platform]
              const isPlaceholder = social.url === '#'
              const label = socialPlatformLabel(social.platform)
              return isPlaceholder ? (
                <span
                  key={social.platform}
                  title={`${label} — segera hadir`}
                  aria-label={`${label} — segera hadir`}
                  className="inline-grid size-8 cursor-not-allowed place-items-center rounded-lg border-2 border-ink-900/15 text-ink-900/30"
                >
                  <Icon className="size-3.5" />
                </span>
              ) : (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} ${mentor.name} (buka di tab baru)`}
                  title={label}
                  className="text-ink-900 inline-grid size-8 place-items-center rounded-lg border-2 border-ink-900 bg-paper-white shadow-button outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  <Icon className="size-3.5" />
                </a>
              )
            })}
            <span className="text-ink-400 ml-auto hidden text-[10px] font-extrabold tracking-wider uppercase sm:inline">
              Klik kartu untuk detail
            </span>
          </div>
        ) : null}
      </article>
    </Reveal>
  )
}
