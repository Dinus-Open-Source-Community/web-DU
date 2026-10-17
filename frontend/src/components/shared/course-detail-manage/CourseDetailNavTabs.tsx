import type { LucideIcon } from 'lucide-react'
import {
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  Star,
  UsersRound,
} from 'lucide-react'

import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { cn } from '@/lib/utils'

export type CourseDetailTabValue =
  | 'overview'
  | 'kurikulum'
  | 'peserta'
  | 'assignments'
  | 'attendance'
  | 'review'
  | 'mentor'

type CourseDetailTabConfig = {
  value: CourseDetailTabValue
  label: string
  shortLabel: string
  icon: LucideIcon
  adminOnly?: boolean
}

const DETAIL_TAB_CONFIG: CourseDetailTabConfig[] = [
  { value: 'overview', label: 'Ringkasan', shortLabel: 'Ringkasan', icon: LayoutDashboard },
  { value: 'kurikulum', label: 'Kurikulum', shortLabel: 'Kurikulum', icon: Layers3 },
  { value: 'peserta', label: 'Peserta', shortLabel: 'Peserta', icon: UsersRound },
  { value: 'assignments', label: 'Tugas', shortLabel: 'Tugas', icon: ClipboardList },
  {
    value: 'attendance',
    label: 'Kehadiran',
    shortLabel: 'Absen',
    icon: ClipboardCheck,
    adminOnly: true,
  },
  { value: 'review', label: 'Ulasan', shortLabel: 'Ulasan', icon: Star },
  {
    value: 'mentor',
    label: 'Mentor',
    shortLabel: 'Mentor',
    icon: GraduationCap,
    adminOnly: true,
  },
]

export function getCourseDetailTabs(isAdmin: boolean) {
  return DETAIL_TAB_CONFIG.filter((tab) => !tab.adminOnly || isAdmin)
}

type CourseDetailNavTabsProps = {
  isAdmin: boolean
  value: CourseDetailTabValue
  onChange: (value: CourseDetailTabValue) => void
}

/** Tab garis bawah brand-blue — sama pola PeriodSelector dashboard. */
export function CourseDetailNavTabs({ isAdmin, value, onChange }: CourseDetailNavTabsProps) {
  const tabs = getCourseDetailTabs(isAdmin)

  return (
    <div className={manageDetailLayout.tabScroll}>
      <div
        className="inline-flex h-auto w-max min-w-full flex-nowrap border-b-2 border-ink-900/10"
        role="tablist"
        aria-label="Navigasi detail kursus"
      >
        {tabs.map((tab) => {
          const isActive = value === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={cn(
                '-mb-0.5 inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors sm:min-h-10 sm:px-4',
                isActive
                  ? 'border-brand-blue text-ink-900'
                  : 'border-transparent text-ink-500 hover:text-ink-800',
              )}
            >
              <tab.icon className="size-4 opacity-70" aria-hidden />
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
