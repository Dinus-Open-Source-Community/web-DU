import { LayoutGrid, Users2, Library, TrendingUp, SlidersHorizontal, BookMarked, ScrollText, Banknote, Layers, Globe, Trophy, ArrowRightLeft, Shield, Calendar } from 'lucide-react'

import type { NavItem } from '@/components/sidebar/types'

// ─── Admin Navigation ────────────────────────────────────────────────────────

export const adminNavigation: NavItem[] = [
  { name: 'Dashboard', icon: LayoutGrid, path: '/admin/dashboard' },
  {
    name: 'Users',
    icon: Users2,
    children: [
      { name: 'All Users', path: '/admin/users' },
      { name: 'Mentors', path: '/admin/mentors' },
    ],
  },
  {
    name: 'RBAC',
    icon: Shield,
    children: [
      { name: 'Roles', path: '/admin/rbac/roles' },
      { name: 'Permissions', path: '/admin/rbac/permissions' },
    ],
  },
  {
    name: 'Courses',
    icon: Library,
    children: [
      { name: 'All Courses', path: '/admin/courses' },
      { name: 'Categories', path: '/admin/categories' },
      { name: 'Reviews', path: '/admin/reviews' },
    ],
  },
  { name: 'Reports', icon: TrendingUp, path: '/admin/reports' },
  { name: 'Settings', icon: SlidersHorizontal, path: '/admin/settings' },
]

// ─── Mentor Navigation ───────────────────────────────────────────────────────

export const mentorNavigation: NavItem[] = [
  { name: 'Dashboard', icon: LayoutGrid, path: '/mentor/dashboard' },
  {
    name: 'My Courses',
    icon: BookMarked,
    children: [
      { name: 'Active Courses', path: '/mentor/courses/active' },
      { name: 'Drafts', path: '/mentor/courses/drafts' },
      { name: 'Create Course', path: '/mentor/courses/create' },
    ],
  },
  { name: 'Assignments', icon: ScrollText, path: '/mentor/assignments' },
  { name: 'Earnings', icon: Banknote, path: '/mentor/earnings' },
]

// ─── Student Navigation ──────────────────────────────────────────────────────

export const studentNavigation: NavItem[] = [
  { name: 'Dashboard', icon: LayoutGrid, path: '/student/dashboard' },
  { name: 'My Learning', icon: Layers, path: '/student/learning' },
  { name: 'Attendance', icon: Calendar, path: '/student/attendeance' },
  { name: 'Browse Courses', icon: Globe, path: '/student/browse' },
  { name: 'Certificates', icon: Trophy, path: '/student/certificates' },
  { name: 'Transactions', icon: ArrowRightLeft, path: '/student/transactions' },
]
