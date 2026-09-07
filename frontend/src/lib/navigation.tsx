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
    { label: 'Galeri', href: '/#galeri' },
  ],
  Mulai: [
    { label: 'Daftar', href: '/auth/register' },
    { label: 'Masuk', href: '/auth/login' },
    { label: 'Beranda', href: '/#top' },
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

export const BrandNextjsIcon = brandIconPath(
  'M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z',
)

export const BrandLaravelIcon = brandIconPath(
  'M23.642 5.43a.364.364 0 01.014.1v5.149c0 .135-.073.26-.189.326l-4.323 2.49v4.934a.378.378 0 01-.188.326L9.93 23.949a.316.316 0 01-.066.027c-.008.002-.016.008-.024.01a.348.348 0 01-.192 0c-.011-.002-.02-.008-.03-.012-.02-.008-.042-.014-.062-.025L.533 18.755a.376.376 0 01-.189-.326V2.974c0-.033.005-.066.014-.098.003-.012.01-.02.014-.032a.369.369 0 01.023-.058c.004-.013.015-.022.023-.033l.033-.045c.012-.01.025-.018.037-.027.014-.012.027-.024.041-.034H.53L5.043.05a.375.375 0 01.375 0L9.93 2.647h.002c.015.01.027.021.04.033l.038.027c.013.014.02.03.033.045.008.011.02.021.025.033.01.02.017.038.024.058.003.011.01.021.013.032.01.031.014.064.014.098v9.652l3.76-2.164V5.527c0-.033.004-.066.013-.098.003-.01.01-.02.013-.032a.487.487 0 01.024-.059c.007-.012.018-.02.025-.033.012-.015.021-.03.033-.043.012-.012.025-.02.037-.028.014-.01.026-.023.041-.032h.001l4.513-2.598a.375.375 0 01.375 0l4.513 2.598c.016.01.027.021.042.031.012.01.025.018.036.028.013.014.022.03.034.044.008.012.019.021.024.033.011.02.018.04.024.06.006.01.012.021.015.032zm-.74 5.032V6.179l-1.578.908-2.182 1.256v4.283zm-4.51 7.75v-4.287l-2.147 1.225-6.126 3.498v4.325zM1.093 3.624v14.588l8.273 4.761v-4.325l-4.322-2.445-.002-.003H5.04c-.014-.01-.025-.021-.04-.031-.011-.01-.024-.018-.035-.027l-.001-.002c-.013-.012-.021-.025-.031-.04-.01-.011-.021-.022-.028-.036h-.002c-.008-.014-.013-.031-.02-.047-.006-.016-.014-.027-.018-.043a.49.49 0 01-.008-.057c-.002-.014-.006-.027-.006-.041V5.789l-2.18-1.257zM5.23.81L1.47 2.974l3.76 2.164 3.758-2.164zm1.956 13.505l2.182-1.256V3.624l-1.58.91-2.182 1.255v9.435zm11.581-10.95l-3.76 2.163 3.76 2.163 3.759-2.164zm-.376 4.978L16.21 7.087 14.63 6.18v4.283l2.182 1.256 1.58.908zm-8.65 9.654l5.514-3.148 2.756-1.572-3.757-2.163-4.323 2.489-3.941 2.27z',
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

/** Anchor navigasi landing. Terminal diprioritaskan karena paling khas DOSCOM. */
export const navLinks = [
  { label: 'Beranda', href: '/#top' },
  { label: 'Mentor', href: '/#mentor' },
  { label: 'Terminal', href: '/#terminal' },
  { label: 'Kursus', href: '/course' },
  { label: 'Galeri', href: '/#galeri' },
]
