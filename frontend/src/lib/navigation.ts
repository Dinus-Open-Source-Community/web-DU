import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, Users2, GraduationCap, Wallet, LineChart, BookMarked, Layers, Globe, Trophy, ArrowRightLeft, LayoutGrid } from 'lucide-react'

import type { NavItem } from '@/components/sidebar/types'

/** Link datar untuk menu (mis. dropdown Navbar) — anak grup memakai ikon induk. */
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

export const adminNavigation: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  {
    name: 'Users Management',
    icon: Users2,
    children: [
      { name: 'Students', path: '/admin/users/students' },
      { name: 'Mentors', path: '/admin/users/mentors' },
      { name: 'Administrators', path: '/admin/users/administrators' },
    ],
  },
  {
    name: 'Course Catalog',
    icon: GraduationCap,
    children: [{ name: 'All Courses', path: '/admin/courses' }],
  },
  {
    name: 'Transactions',
    path: '/admin/transactions',
    icon: Wallet,
  },
  {
    name: 'Financial Reports',
    path: '/admin/financial',
    icon: LineChart,
  },
]

// ─── Mentor Navigation ───────────────────────────────────────────────────────

export const mentorNavigation: NavItem[] = [
  { name: 'Dashboard', icon: LayoutGrid, path: '/mentor/dashboard' },
  {
    name: 'Courses',
    icon: BookMarked,
    path: '/mentor/courses',
  },
]

// ─── Student Navigation ──────────────────────────────────────────────────────

export const studentNavigation: NavItem[] = [
  { name: 'Dashboard', icon: LayoutGrid, path: '/student/dashboard' },
  {
    name: 'My Learning',
    icon: Layers,
    children: [
      { name: 'Course', path: '/student/learning' },
      { name: 'Assignment', path: '/student/assignments' },
    ],
  },
  { name: 'Browse Courses', icon: Globe, path: '/student/browse' },
  { name: 'Certificates', icon: Trophy, path: '/student/certificates' },
  { name: 'Transactions', icon: ArrowRightLeft, path: '/student/transactions' },
]
