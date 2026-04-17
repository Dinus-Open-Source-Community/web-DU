import {
  LayoutDashboard,
  Users2,
  GraduationCap,
  Wallet,
  LineChart,
  Megaphone,
  ShieldCheck,
  Settings2,
  BookMarked,
  ScrollText,
  Banknote,
  Layers,
  Globe,
  Trophy,
  ArrowRightLeft,
  Calendar,
  LayoutGrid,
} from 'lucide-react'

import type { NavItem } from '@/components/sidebar/types'

// ─── Admin Navigation ────────────────────────────────────────────────────────

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
    children: [
      { name: 'All Courses', path: '/admin/courses' },
      { name: 'Categories', path: '/admin/courses/categories' },
      { name: 'Pending Approvals', path: '/admin/courses/pending-approvals' },
      { name: 'Reviews & Q&A', path: '/admin/courses/reviews-qa' },
    ],
  },
  {
    name: 'Sales & Finance',
    icon: Wallet,
    children: [
      { name: 'Transactions', path: '/admin/finance/transactions' },
      { name: 'Payouts', path: '/admin/finance/payouts' },
    ],
  },
  {
    name: 'Analytics & Reports',
    icon: LineChart,
    children: [
      { name: 'Learning Metrics', path: '/admin/analytics/learning' },
      { name: 'Financial Reports', path: '/admin/analytics/financial' },
    ],
  },
  {
    name: 'Marketing',
    icon: Megaphone,
    children: [{ name: 'Coupons & Promotions', path: '/admin/marketing/coupons' }],
  },
  {
    name: 'System & Security',
    icon: ShieldCheck,
    children: [
      { name: 'RBAC', path: '/admin/security/rbac' },
      { name: 'Audit Logs', path: '/admin/security/audit-logs' },
    ],
  },
  {
    name: 'Settings',
    icon: Settings2,
    children: [
      { name: 'General', path: '/admin/settings/general' },
      { name: 'Integrations', path: '/admin/settings/integrations' },
    ],
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
  { name: 'Absensi', icon: Calendar, path: '/mentor/attendance' },
  { name: 'Tugas', icon: ScrollText, path: '/mentor/assignments' },
  { name: 'Earnings', icon: Banknote, path: '/mentor/earnings' },
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
      { name: 'Attendance', path: '/student/attendance' },
    ],
  },
  { name: 'Browse Courses', icon: Globe, path: '/student/browse' },
  { name: 'Certificates', icon: Trophy, path: '/student/certificates' },
  { name: 'Transactions', icon: ArrowRightLeft, path: '/student/transactions' },
]
