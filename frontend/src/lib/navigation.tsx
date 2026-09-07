import { LayoutDashboard, Users2, GraduationCap, Wallet, LineChart, BookMarked, Layers, Globe, ArrowRightLeft, LayoutGrid, Mail, type LucideIcon } from 'lucide-react'
import { ROUTES } from './routes.ts'
import type { NavItem } from './types/utils'

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

export const socialLinks = [
  { icon: Globe, href: 'https://github.com', label: 'GitHub' },
  { icon: Globe, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Globe, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Globe, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Mail, href: 'mailto: ', label: 'Email' },
]

export const navLinks = [
  { label: 'Beranda', href: '/#top' },
  { label: 'Stack', href: '/#stack' },
  { label: 'Mentor', href: '/#mentor' },
  { label: 'Kursus', href: '/course' },
  { label: 'Galeri', href: '/#galeri' },
  { label: 'Kontak', href: '/#kontak' },
]
