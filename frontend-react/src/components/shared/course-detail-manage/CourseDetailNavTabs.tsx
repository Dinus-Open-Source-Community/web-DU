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
import { TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  { value: 'overview', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },
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
  { value: 'review', label: 'Review', shortLabel: 'Review', icon: Star },
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
}

export function CourseDetailNavTabs({ isAdmin }: CourseDetailNavTabsProps) {
  const tabs = getCourseDetailTabs(isAdmin)

  return (
    <div className={manageDetailLayout.tabScroll}>
      <TabsList
        variant="line"
        aria-label="Navigasi detail course"
        className={manageDetailLayout.tabList}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={manageDetailLayout.tabTrigger}
          >
            <tab.icon className="size-4 opacity-70" aria-hidden />
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
