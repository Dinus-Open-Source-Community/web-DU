import { useEffect, useState } from 'react'

import {
  COURSE_EDIT_DESKTOP_BREAKPOINT_PX,
  resolveCourseEditViewportMode,
  type CourseEditViewportMode,
} from '@/lib/course-edit/viewport'

export function useCourseEditViewport() {
  const [viewportMode, setViewportMode] = useState<CourseEditViewportMode>(() => {
    if (typeof window === 'undefined') return 'desktop'
    return resolveCourseEditViewportMode(window.innerWidth)
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(min-width: ${COURSE_EDIT_DESKTOP_BREAKPOINT_PX}px)`,
    )

    const syncViewport = () => {
      setViewportMode(resolveCourseEditViewportMode(window.innerWidth))
    }

    mediaQuery.addEventListener('change', syncViewport)
    syncViewport()

    return () => mediaQuery.removeEventListener('change', syncViewport)
  }, [])

  return {
    viewportMode,
    isCompact: viewportMode === 'compact',
    isDesktop: viewportMode === 'desktop',
  }
}
