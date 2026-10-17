import { Link } from 'react-router-dom'

import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

const QUICK_LINKS: { label: string; href: string; description: string }[] = [
  {
    label: 'Kursus',
    href: ROUTES.mentor.courses,
    description: 'Kelola kursus yang Anda bimbing',
  },
  {
    label: 'Ulasan & Tanya Jawab',
    href: ROUTES.mentor.reviewsAndQaPath,
    description: 'Balas ulasan dan diskusi peserta',
  },
]

export function MentorQuickLinks() {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {QUICK_LINKS.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className={cn(
            appCardClassName,
            'group p-4 shadow-none transition-colors hover:bg-paper-paper',
          )}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900 group-hover:text-brand-ink">{link.label}</p>
            <p className="truncate text-xs font-medium text-ink-500">{link.description}</p>
          </div>
        </Link>
      ))}
    </section>
  )
}
