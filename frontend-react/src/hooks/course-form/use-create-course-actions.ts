import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useCreateCourse } from '@/hooks/use-course-mutations'
import { buildCourseEditNavigationState } from '@/lib/course-edit/navigation-state'
import { formValuesToCreatePayload } from '@/lib/course-form/mappers'
import type { CourseFormValues } from '@/lib/course-form/types'

type UseCreateCourseActionsOptions = {
  roleBasePath?: '/mentor' | '/admin'
}

export function useCreateCourseActions({ roleBasePath = '/mentor' }: UseCreateCourseActionsOptions = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const createCourse = useCreateCourse()

  const onSubmit = useCallback(
    async (values: CourseFormValues) => {
      const created = await createCourse.mutateAsync(formValuesToCreatePayload(values))
      if (!created.uid) {
        throw new Error('Backend tidak mengembalikan uid kursus')
      }

      navigate(`${roleBasePath}/courses/${created.uid}/edit`, {
        state: buildCourseEditNavigationState(location),
      })
    },
    [createCourse, location, navigate, roleBasePath],
  )

  return {
    submitting: createCourse.isPending,
    onSubmit,
  }
}
