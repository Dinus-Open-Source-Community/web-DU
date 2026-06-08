import { CourseFormDialog } from './CourseFormDialog'
import type { CourseFormOptionsViewModel } from '@/lib/course-form/course-form-options-view-model'
import type { CourseFormValues } from '@/lib/course-form/types'
import type { ICourseDetailItem } from '@/lib/types/course'

type EditCourseDialogProps = CourseFormOptionsViewModel & {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: ICourseDetailItem
  submitting?: boolean
  onSubmitEdit: (values: CourseFormValues) => Promise<void>
}

export function EditCourseDialog({
  open,
  onOpenChange,
  course,
  submitting = false,
  onSubmitEdit,
  categories,
  courseTypes,
  optionsLoading,
}: EditCourseDialogProps) {
  return (
    <CourseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      course={course}
      submitting={submitting}
      onSubmitEdit={onSubmitEdit}
      categories={categories}
      courseTypes={courseTypes}
      optionsLoading={optionsLoading}
    />
  )
}
