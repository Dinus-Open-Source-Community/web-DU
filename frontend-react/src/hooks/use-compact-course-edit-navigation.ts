import { useCallback, useEffect, useState } from 'react'

import type { CompactPane } from '@/lib/course-edit/viewport'

export function useCompactCourseEditNavigation(
  isCompact: boolean,
  activeLessonId: string | null,
) {
  const [compactPane, setCompactPane] = useState<CompactPane>('outline')

  useEffect(() => {
    if (isCompact && activeLessonId) {
      setCompactPane('editor')
    }
  }, [activeLessonId, isCompact])

  useEffect(() => {
    if (isCompact && !activeLessonId) {
      setCompactPane('outline')
    }
  }, [activeLessonId, isCompact])

  useEffect(() => {
    if (!isCompact) {
      setCompactPane('outline')
    }
  }, [isCompact])

  const openOutline = useCallback(() => {
    setCompactPane('outline')
  }, [])

  const openEditor = useCallback(() => {
    setCompactPane('editor')
  }, [])

  return {
    compactPane,
    openOutline,
    openEditor,
  }
}
