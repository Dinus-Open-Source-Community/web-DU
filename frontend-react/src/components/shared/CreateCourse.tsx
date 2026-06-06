import { useLocation, useNavigate } from 'react-router-dom'

import { CourseFormDialog } from '@/components/shared/course-form/CourseFormDialog'
import { useCreateCourse } from '@/hooks/use-course-mutations'
import { buildCourseEditNavigationState } from '@/lib/course-edit/navigation-state'
import { formValuesToCreatePayload } from '@/lib/course-form/mappers'
import type { CourseFormValues } from '@/lib/course-form/types'

type CreateCourseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleBasePath?: '/mentor' | '/admin'
}

export function CreateCourseDialog({
  open,
  onOpenChange,
  roleBasePath = '/mentor',
}: CreateCourseDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const createCourse = useCreateCourse()

  const handleSubmit = async (values: CourseFormValues) => {
    const created = await createCourse.mutateAsync(formValuesToCreatePayload(values))
    if (!created.uid) {
      throw new Error('Backend tidak mengembalikan uid kursus')
    }

    onOpenChange(false)
    navigate(`${roleBasePath}/courses/${created.uid}/edit`, {
      state: buildCourseEditNavigationState(location),
    })
  }

  return (
    <CourseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="create"
      submitting={createCourse.isPending}
      onSubmitCreate={handleSubmit}
    />
  )
}
