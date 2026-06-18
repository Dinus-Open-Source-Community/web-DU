import { Link } from 'react-router-dom'
import { Users2, BookOpen, CreditCard, BarChart3, type LucideIcon } from 'lucide-react'
import { ROUTES } from '../../../lib/routes'

interface QuickLinkItem {
  label: string
  href: string
  icon: LucideIcon
  description: string
}

const QUICK_LINKS: QuickLinkItem[] = [
  {
    label: 'Students',
    href: ROUTES.admin.users.students,
    icon: Users2,
    description: 'Kelola data siswa',
  },
  {
    label: 'Courses',
    href: ROUTES.admin.courses,
    icon: BookOpen,
    description: 'Kelola kursus',
  },
  {
    label: 'Transactions',
    href: ROUTES.admin.transactions,
    icon: CreditCard,
    description: 'Riwayat transaksi',
  },
  {
    label: 'Financial',
    href: ROUTES.admin.financial,
    icon: BarChart3,
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
          className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-primary/20 hover:shadow-md"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <link.icon className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">{link.label}</p>
            <p className="truncate text-xs text-slate-500">{link.description}</p>
          </div>
        </Link>
      ))}
    </section>
  )
}
