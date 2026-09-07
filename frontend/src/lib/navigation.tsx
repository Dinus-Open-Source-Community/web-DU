import type { ComponentType, SVGProps } from 'react'
import { LayoutDashboard, Users2, GraduationCap, Wallet, LineChart, BookMarked, Layers, Globe, ArrowRightLeft, LayoutGrid, Mail, type LucideIcon } from 'lucide-react'
import { ROUTES } from './routes.ts'
import type { NavItem } from './types/components/navigation'

export type FlatNavLink = { name: string; path: string; icon?: LucideIcon }

export function flattenNavItems(items: NavItem[]): FlatNavLink[] {
  const out: FlatNavLink[] = []
  for (const item of items) {
    if (item.children?.length) {
      for (const child of item.children) {
        out.push({ name: child.name, path: child.path, icon: item.icon })
      }
    } else if (item.path) {
      out.push({ name: item.name, path: item.path, icon: item.icon })
    }
  }
  return out
}

export const Navigation: Record<string, NavItem[]> = {
  Admin: [
    { name: 'Dashboard', icon: LayoutDashboard, path: ROUTES.admin.dashboard },
    {
      name: 'Users Management',
      icon: Users2,
      children: [
        { name: 'Students', path: ROUTES.admin.users.students },
        { name: 'Mentors', path: ROUTES.admin.users.mentors },
        { name: 'Administrators', path: ROUTES.admin.users.administrators },
      ],
    },
    {
      name: 'Course Catalog',
      icon: GraduationCap,
      children: [
        { name: 'All Courses', path: ROUTES.admin.courses },
        { name: 'Categories', path: ROUTES.admin.courseCategories },
        { name: 'Course Types', path: ROUTES.admin.courseTypes },
      ],
    },
    {
      name: 'Transactions',
      path: ROUTES.admin.transactions,
      icon: Wallet,
    },
    {
      name: 'Financial Reports',
      path: ROUTES.admin.financial,
      icon: LineChart,
    },
  ],
  Mentor: [
    { name: 'Dashboard', icon: LayoutGrid, path: ROUTES.mentor.dashboard },
    {
      name: 'Courses',
      icon: BookMarked,
      path: ROUTES.mentor.courses,
    },
  ],
  Student: [
    { name: 'Dashboard', icon: LayoutGrid, path: ROUTES.student.dashboard },
    {
      name: 'My Learning',
      icon: Layers,
      children: [
        { name: 'Course', path: ROUTES.student.learning },
        { name: 'Assignment', path: ROUTES.student.assignments },
      ],
    },
    { name: 'Browse Courses', icon: Globe, path: ROUTES.student.browse },
    { name: 'Transactions', icon: ArrowRightLeft, path: ROUTES.student.transactions },
  ],
}

export const footerLinks = {
  Jelajah: [
    { label: 'Kursus', href: '/course' },
    { label: 'Mentor', href: '/#mentor' },
    { label: 'Cara Kerja', href: '/#cara-kerja' },
    { label: 'Galeri', href: '/#galeri' },
  ],
  Mulai: [
    { label: 'Daftar', href: '/auth/register' },
    { label: 'Masuk', href: '/auth/login' },
    { label: 'Beranda', href: '/#top' },
    { label: 'Kontak', href: '/#kontak' },
  ],
}

/**
 * Ikon brand sebagai komponen inline (fill=currentColor). Versi lucide-react
 * yang terpasang tidak menyertakan ikon brand (Github/Linkedin/Instagram),
 * jadi dipakai path resmi Simple Icons — tanpa menambah dependensi.
 */
/** Ikon brand — path Simple Icons, fill mengikuti warna teks (currentColor). */
function brandIconPath(d: string): ComponentType<SVGProps<SVGSVGElement>> {
  return function BrandIcon({ className }: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={d} />
      </svg>
    )
  }
}

export const BrandGithubIcon = brandIconPath(
  'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
)

export const BrandLinkedinIcon = brandIconPath(
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
)

export const BrandInstagramIcon = brandIconPath(
  'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
)

export type BrandSocialLink = {
  label: string
  href: string
  /** LucideIcon atau komponen ikon inline apa pun yang menerima className. */
  icon: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>
}

/** Ikon brand asli (bukan Globe generik). Href sengaja placeholder sampai ada akun resmi. */
export const socialLinks: BrandSocialLink[] = [
  // TODO: ganti '#' dengan akun DOSCOM resmi (github.com/doscom-university, dll) sebelum launch.
  { label: 'GitHub', href: '#', icon: BrandGithubIcon },
  { label: 'LinkedIn', href: '#', icon: BrandLinkedinIcon },
  { label: 'Instagram', href: '#', icon: BrandInstagramIcon },
  { label: 'Email', href: '#', icon: Mail },
]

/** Anchor navigasi landing. Terminal & Cerita diprioritaskan karena paling khas DOSCOM. */
export const navLinks = [
  { label: 'Beranda', href: '/#top' },
  { label: 'Mentor', href: '/#mentor' },
  { label: 'Terminal', href: '/#terminal' },
  { label: 'Cerita', href: '/#cerita' },
  { label: 'Kursus', href: '/course' },
  { label: 'Kontak', href: '/#kontak' },
]
