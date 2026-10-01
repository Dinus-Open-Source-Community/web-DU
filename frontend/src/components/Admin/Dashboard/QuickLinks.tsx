import { Link } from 'react-router-dom'
import { ROUTES } from '../../../lib/routes'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

interface QuickLinkItem {
  label: string
  href: string
  description: string
}

const QUICK_LINKS: QuickLinkItem[] = [
  {
    label: 'Students',
    href: ROUTES.admin.users.students,
    description: 'Kelola data siswa',
  },
  {
    label: 'Courses',
    href: ROUTES.admin.courses,
    description: 'Kelola kursus',
  },
  {
    label: 'Transactions',
    href: ROUTES.admin.transactions,
    description: 'Riwayat transaksi',
  },
  {
    label: 'Financial',
    href: ROUTES.admin.financial,
    description: 'Laporan keuangan',
  },
]

export function QuickLinks() {
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-4">
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
