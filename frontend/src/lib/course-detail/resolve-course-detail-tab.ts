import type { CourseDetailTabValue } from '@/components/shared/course-detail-manage/CourseDetailNavTabs'

const COURSE_DETAIL_TAB_VALUES = [
  'overview',
  'kurikulum',
  'peserta',
  'assignments',
  'attendance',
  'review',
  'mentor',
] as const satisfies readonly CourseDetailTabValue[]

export function getCourseDetailTabValues(isAdmin: boolean): CourseDetailTabValue[] {
  if (isAdmin) {
    return [...COURSE_DETAIL_TAB_VALUES]
  }

  return COURSE_DETAIL_TAB_VALUES.filter((tab) => tab !== 'attendance' && tab !== 'mentor')
}

export function resolveCourseDetailTab(
  rawTab: string | null | undefined,
  isAdmin: boolean,
  fallback: CourseDetailTabValue = 'overview',
): CourseDetailTabValue {
  const allowedTabs = getCourseDetailTabValues(isAdmin)
  if (rawTab && allowedTabs.includes(rawTab as CourseDetailTabValue)) {
    return rawTab as CourseDetailTabValue
  }

  return fallback
}
