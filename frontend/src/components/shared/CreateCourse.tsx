import { CourseFormDialog } from '@/components/shared/course-form/CourseFormDialog'
import type { CourseFormOptionsViewModel } from '@/lib/course-form/course-form-options-view-model'
import type { CourseFormValues } from '@/lib/course-form/types'

type CreateCourseDialogProps = CourseFormOptionsViewModel & {
  open: boolean
  onOpenChange: (open: boolean) => void
  submitting?: boolean
  onSubmitCreate: (values: CourseFormValues) => Promise<void>
}

export function CreateCourseDialog({
  open,
  onOpenChange,
  submitting = false,
  onSubmitCreate,
  categories,
  courseTypes,
  optionsLoading,
}: CreateCourseDialogProps) {
  return (
    <CourseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="create"
      submitting={submitting}
      onSubmitCreate={onSubmitCreate}
      categories={categories}
      courseTypes={courseTypes}
      optionsLoading={optionsLoading}
    />
  )
}
