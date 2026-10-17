import { DialogTrigger } from '@/components/ui/dialog'
import { SOCIAL_ICONS } from '@/components/profile/SettingsSocialSection'
import Reveal from '@/components/playful/Reveal'
import MentorDetailModal from '@/components/landing/MentorDetailModal'
import { mentorInitials, type LandingMentor } from '@/lib/landing/mentors'
import { socialPlatformLabel } from '@/lib/profile/social-links'
import { cn } from '@/lib/utils'

/** Latar fallback di belakang foto (terlihat saat gambar lambat/gagal). */
const FALLBACK_BG = ['bg-note-yellow', 'bg-note-mint', 'bg-note-peach'] as const

type MentorCardProps = {
  mentor: LandingMentor
  index?: number
  className?: string
}

/**
 * Kartu mentor persegi ala profil — foto, nama, course yang diajar, sosmed.
 * Klik area kartu (foto/nama/course) membuka modal detail.
 */
export default function MentorCard({ mentor, index = 0, className }: MentorCardProps) {
  return (
    <Reveal delay={(index % 3) * 0.08} className={cn('h-full', className)}>
      <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border-2 border-ink-900 bg-paper-white shadow-paper transition-transform duration-300 ease-out hover:-translate-y-1">
        <MentorDetailModal mentor={mentor} index={index}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={`Lihat detail ${mentor.name} — ${mentor.role}`}
              className="block w-full cursor-pointer text-left outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/50 focus-visible:ring-inset"
            >
              {/* Foto profil persegi */}
              <div className={cn('relative aspect-square w-full border-b-2 border-ink-900', FALLBACK_BG[index % FALLBACK_BG.length])}>
                <span
                  aria-hidden
                  className="font-display absolute inset-0 grid place-items-center text-6xl font-bold text-ink-900/20"
                >
                  {mentorInitials(mentor.name)}
                </span>
                <img
                  src={mentor.photo}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-[center_30%] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="font-display text-lg leading-tight font-bold text-ink-900">
                  {mentor.name}
                </h3>
                <p className="mt-0.5 text-xs font-bold text-brand-ink sm:text-sm">{mentor.role}</p>

                {/* Course yang diajar */}
                <ul className="mt-2 flex flex-wrap gap-1" aria-label={`Course yang diajar ${mentor.name}`}>
                  {mentor.courses.map((course) => (
                    <li
                      key={course}
                      className="rounded-full border border-ink-900/25 bg-paper-panel px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-ink-900 uppercase"
                    >
                      {course}
                    </li>
                  ))}
                </ul>
              </div>
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
                  className="text-ink-900 inline-grid size-8 place-items-center rounded-lg border-2 border-ink-900 bg-paper-white shadow-button outline-none transition-all hover:-translate-y-0.5 hover:bg-note-yellow focus-visible:ring-3 focus-visible:ring-ring/30"
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
