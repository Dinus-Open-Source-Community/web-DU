import { useMemo } from 'react'

import type { CourseDetailTabValue } from '@/components/shared/course-detail-manage/CourseDetailNavTabs'
import {
  getCourseDetailTabValues,
  resolveCourseDetailTab,
} from '@/lib/course-detail/resolve-course-detail-tab'
import { useQueryStateEnum } from '@/lib/nuqs-react-router'

type UseCourseDetailTabOptions = {
  isAdmin: boolean
  defaultTab?: CourseDetailTabValue
}

export function useCourseDetailTab({
  isAdmin,
  defaultTab = 'overview',
}: UseCourseDetailTabOptions) {
  const tabValues = useMemo(() => getCourseDetailTabValues(isAdmin), [isAdmin])
  const [rawTab, setRawTab] = useQueryStateEnum('tab', tabValues, defaultTab)
  const activeTab = resolveCourseDetailTab(rawTab, isAdmin, defaultTab)

  const setActiveTab = (nextTab: CourseDetailTabValue) => {
    setRawTab(nextTab)
  }

  return {
    activeTab,
    setActiveTab,
    tabValues,
  }
}
