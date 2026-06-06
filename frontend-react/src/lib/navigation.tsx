import { LayoutDashboard, Users2, GraduationCap, Wallet, LineChart, BookMarked, Layers, Globe, Trophy, ArrowRightLeft, LayoutGrid, Mail, type LucideIcon } from 'lucide-react'
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
    { name: 'Certificates', icon: Trophy, path: ROUTES.student.certificates },
    { name: 'Transactions', icon: ArrowRightLeft, path: ROUTES.student.transactions },
  ],
}

export const footerLinks = {
  Product: [
    { label: 'Course', href: '/course' },
    { label: 'Community', href: '/community' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
  ],
  Company: [
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Disclaimer', href: '/disclaimer' },
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
  { label: 'Home', href: '/' },
  { label: 'Course', href: '/course' },
  { label: 'Community', href: '/community' },
  { label: 'About', href: '/about' },
]
