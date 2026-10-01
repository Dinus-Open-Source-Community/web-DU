import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  resolveCourseEditBackTarget,
  type CourseEditBackTarget,
} from '@/lib/course-edit/navigation-state'
import { dashboardMenu } from '@/lib/routes'

export function useCourseEditBackNavigation(coursesListPath = dashboardMenu.courses) {
  const location = useLocation()
  const navigate = useNavigate()

  const backTarget = useMemo(
    () =>
      resolveCourseEditBackTarget(
        location.state,
        `${location.pathname}${location.search}`,
        coursesListPath,
      ),
    [coursesListPath, location.pathname, location.search, location.state],
  )

  const goBack = useCallback(() => {
    if (backTarget.type === 'path' || backTarget.type === 'fallback') {
      navigate(backTarget.path)
      return
    }

    navigate(-1)
  }, [backTarget, navigate])

  return { goBack, backTarget: backTarget as CourseEditBackTarget }
}
