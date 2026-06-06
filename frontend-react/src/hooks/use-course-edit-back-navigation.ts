import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  resolveCourseEditBackTarget,
  type CourseEditBackTarget,
} from '@/lib/course-edit/navigation-state'

export function useCourseEditBackNavigation(routeBasePath: '/mentor' | '/admin') {
  const location = useLocation()
  const navigate = useNavigate()

  const fallbackPath = `${routeBasePath}/courses`

  const backTarget = useMemo(
    () =>
      resolveCourseEditBackTarget(
        location.state,
        `${location.pathname}${location.search}`,
        fallbackPath,
      ),
    [fallbackPath, location.pathname, location.search, location.state],
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
