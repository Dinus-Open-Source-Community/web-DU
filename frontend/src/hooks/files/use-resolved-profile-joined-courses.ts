import { useMemo } from 'react'

import type { IJoinedCourse } from '@/lib/types/user'

import { useProtectedFileMap } from './use-protected-file-map'

function collectJoinedCourseImageReferences(courses?: IJoinedCourse[] | null): string[] {
  if (!courses?.length) return []

  const refs: string[] = []
  for (const course of courses) {
    if (course.cover_url?.trim()) refs.push(course.cover_url.trim())
    if (course.thumbnail_url?.trim()) refs.push(course.thumbnail_url.trim())
    for (const mentor of course.mentors ?? []) {
      if (mentor.avatar_url?.trim()) refs.push(mentor.avatar_url.trim())
    }
    if (course.created_by?.avatar_url?.trim()) {
      refs.push(course.created_by.avatar_url.trim())
    }
  }

  return refs
}

function applyJoinedCourseImages(
  course: IJoinedCourse,
  getDisplayUrl: (reference?: string | null) => string | null | undefined,
): IJoinedCourse {
  const resolve = (reference?: string | null) => {
    const resolved = getDisplayUrl(reference)
    return resolved ?? reference ?? ''
  }

  return {
    ...course,
    cover_url: resolve(course.cover_url),
    thumbnail_url: resolve(course.thumbnail_url),
    mentors: course.mentors?.map((mentor) => ({
      ...mentor,
      avatar_url: resolve(mentor.avatar_url),
    })),
    created_by: course.created_by
      ? {
          ...course.created_by,
          avatar_url: resolve(course.created_by.avatar_url),
        }
      : course.created_by,
  }
}

export function useResolvedProfileJoinedCourses(courses: IJoinedCourse[] | undefined) {
  const imageReferences = useMemo(
    () => collectJoinedCourseImageReferences(courses),
    [courses],
  )

  const fileMap = useProtectedFileMap(imageReferences, {
    enabled: Boolean(courses?.length) && imageReferences.length > 0,
  })

  const resolvedCourses = useMemo(() => {
    if (!courses?.length) return courses ?? []
    return courses.map((course) => applyJoinedCourseImages(course, fileMap.getDisplayUrl))
  }, [courses, fileMap.getDisplayUrl])

  return {
    courses: resolvedCourses,
    isResolvingImages: fileMap.isLoading || fileMap.isFetching,
  }
}
