import { BookOpen } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { SOCIAL_ICONS } from '@/components/profile/SettingsSocialSection'
import { mentorInitials, type LandingMentor } from '@/lib/landing/mentors'
import { socialPlatformLabel } from '@/lib/profile/social-links'
import { cn } from '@/lib/utils'

/** Latar fallback di belakang foto (terlihat saat gambar lambat/gagal). */
const FALLBACK_BG = ['bg-note-yellow', 'bg-note-mint', 'bg-note-peach'] as const

type MentorDetailModalProps = {
  mentor: LandingMentor
  index?: number
  /** Pemicu yang membuka modal (kartu mentor). */
  children: React.ReactNode
}

/** Modal detail mentor — foto, bio, course yang diajar, dan sosmed. */
export default function MentorDetailModal({ mentor, index = 0, children }: MentorDetailModalProps) {
  return (
    <Dialog>
      {children}
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-[24px] border-2 border-ink-900 bg-paper-white p-0 shadow-paper sm:max-w-2xl">
        <div className="flex flex-col sm:flex-row">
          {/* Foto persegi */}
          <div className={cn('relative aspect-square w-full shrink-0 sm:aspect-auto sm:min-h-full sm:w-72', FALLBACK_BG[index % FALLBACK_BG.length])}>
            <img
              src={mentor.photo}
              alt={`${mentor.name} — ${mentor.role}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            {/* Inisial fallback bila foto gagal dimuat */}
            <span
              aria-hidden
              className="font-display absolute inset-0 grid place-items-center text-6xl font-bold text-ink-900/20"
            >
              {mentorInitials(mentor.name)}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4 p-6 sm:p-8">
            <div>
              <DialogTitle className="font-display text-3xl leading-tight font-bold text-ink-900">
                {mentor.name}
              </DialogTitle>
              <p className="mt-1.5 text-base font-bold text-brand-ink">{mentor.role}</p>
              {/* Deskripsi sr-only agar dialog tetap aksesibel (radix butuh description). */}
              <DialogDescription className="sr-only">
                Detail profil mentor {mentor.name}.
              </DialogDescription>
            </div>

            {/* Course yang diajar */}
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                <BookOpen className="size-3.5" aria-hidden />
                Mengajar
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {mentor.courses.map((course) => (
                  <li
                    key={course}
                    className="rounded-md border border-line-light bg-paper-paper px-2.5 py-1 text-xs font-medium text-ink-800"
                  >
                    {course}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sosmed */}
            {mentor.socials.length > 0 ? (
              <div>
                <p className="text-xs font-extrabold tracking-[0.15em] text-ink-500 uppercase">
                  Terhubung
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {mentor.socials.map((social) => {
                    const Icon = SOCIAL_ICONS[social.platform]
                    const isPlaceholder = social.url === '#'
                    const label = socialPlatformLabel(social.platform)
                    const cls =
                      'inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-ink-900 px-2.5 text-xs font-extrabold text-ink-900 shadow-button transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/30'
                    return (
                      <li key={social.platform}>
                        {isPlaceholder ? (
                          <span
                            title={`${label} — segera hadir`}
                            aria-label={`${label} — segera hadir`}
                            className={cn(cls, 'cursor-not-allowed opacity-40')}
                          >
                            <Icon className="size-4" />
                            {label}
                          </span>
                        ) : (
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${label} ${mentor.name} (buka di tab baru)`}
                            className={cn(cls, 'bg-paper-white hover:bg-paper-paper')}
                          >
                            <Icon className="size-4" />
                            {label}
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
