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

/** Tab segmented pill brand-blue — selaras tab kursus dan filter admin. */
export function CourseDetailNavTabs({ isAdmin, value, onChange }: CourseDetailNavTabsProps) {
  const tabs = getCourseDetailTabs(isAdmin)

  return (
    <div className={cn(manageDetailLayout.tabScroll, 'py-0.5')}>
      <div
        className="inline-flex w-max items-center gap-1 rounded-lg border-2 border-ink-900/10 bg-paper-paper p-1"
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
                'inline-flex h-9 shrink-0 snap-start items-center justify-center gap-2 rounded-md px-3.5 text-sm transition-all sm:px-4',
                isActive
                  ? 'bg-brand-blue font-bold text-white shadow-none'
                  : 'font-semibold text-ink-500 hover:bg-paper-white hover:text-ink-800',
              )}
            >
              <tab.icon
                className={cn('size-4 transition-opacity', isActive ? 'opacity-100 text-white' : 'opacity-70')}
                aria-hidden
              />
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
