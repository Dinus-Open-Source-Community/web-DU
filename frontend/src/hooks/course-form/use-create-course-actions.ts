import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useCreateCourse } from '@/hooks/use-course-mutations'
import { buildCourseEditNavigationState } from '@/lib/course-edit/navigation-state'
import { formValuesToCreatePayload } from '@/lib/course-form/mappers'
import type { CourseFormValues } from '@/lib/course-form/types'
import { dashboardMenu } from '@/lib/routes'

export function useCreateCourseActions() {
  const navigate = useNavigate()
  const location = useLocation()
  const createCourse = useCreateCourse()

  const onSubmit = useCallback(
    async (values: CourseFormValues) => {
      const created = await createCourse.mutateAsync(formValuesToCreatePayload(values))
      if (!created.uid) {
        throw new Error('Backend tidak mengembalikan uid kursus')
      }

      navigate(dashboardMenu.courseEdit(created.uid), {
        state: buildCourseEditNavigationState(location),
      })
    },
    [createCourse, location, navigate],
  )

  return {
    submitting: createCourse.isPending,
    onSubmit,
  }
}
