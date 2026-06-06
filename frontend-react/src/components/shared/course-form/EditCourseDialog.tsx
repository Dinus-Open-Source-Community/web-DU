import { CourseFormDialog } from './CourseFormDialog'
import { useUpdateCourse } from '@/hooks/use-course-mutations'
import { formValuesToUpdatePayload } from '@/lib/course-form/mappers'
import type { CourseFormValues } from '@/lib/course-form/types'
import type { ICourseDetailItem } from '@/lib/types/course'

type EditCourseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: ICourseDetailItem
  onSuccess?: () => void
}

export function EditCourseDialog({ open, onOpenChange, course, onSuccess }: EditCourseDialogProps) {
  const updateCourse = useUpdateCourse()

  const handleSubmit = async (values: CourseFormValues) => {
    await updateCourse.mutateAsync({
      uid: course.uid,
      payload: formValuesToUpdatePayload(values),
    })
    onSuccess?.()
  }

  return (
    <CourseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      course={course}
      submitting={updateCourse.isPending}
      onSubmitEdit={handleSubmit}
    />
  )
}
