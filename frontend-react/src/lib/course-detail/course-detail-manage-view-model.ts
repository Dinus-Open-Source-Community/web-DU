import type { CourseEditNavigationState } from '@/lib/course-edit/navigation-state'
import type { AssignCourseMentorDialogViewModel } from '@/lib/course-detail/assign-course-mentor-view-model'
import type { CourseFormOptionsViewModel } from '@/lib/course-form/course-form-options-view-model'
import type { CourseFormValues } from '@/lib/course-form/types'
import type { ICourseDetailItem, IMentorCourseStudent, IModulesData } from '@/lib/types/course'

export type CourseDetailManageViewModel = {
  course: ICourseDetailItem
  courseUid: string
  isAdmin: boolean
  isPublished: boolean
  editHref: string
  previewHref: string
  curriculumEditNavigationState: CourseEditNavigationState
  modules: IModulesData[]
  dataStudents: IMentorCourseStudent[]
  editOpen: boolean
  onEditOpenChange: (open: boolean) => void
  isConfirmOpen: boolean
  onConfirmOpenChange: (open: boolean) => void
  onEditClick: () => void
  onPublishClick: () => void
  confirmTitle: string
  confirmDescription: string
  confirmLabel: string
  onConfirmPublish: () => void
  onCancelPublish: () => void
  isDeleteConfirmOpen: boolean
  onDeleteConfirmOpenChange: (open: boolean) => void
  onDeleteClick: () => void
  onConfirmDelete: () => void
  isDeleting: boolean
  onReplyReview: (reviewUid: string, comment: string) => Promise<void>
  submittingReviewUid: string | null
  editDialogSubmitting: boolean
  onEditCourseSubmit: (values: CourseFormValues) => Promise<void>
  formOptions: CourseFormOptionsViewModel
  assignMentorDialog: AssignCourseMentorDialogViewModel | null
}

export type CourseDetailShellProps = {
  view: CourseDetailManageViewModel
}

export type CourseDetailManageInput = {
  courseUid: string
  dataCourse: ICourseDetailItem | ICourseDetailItem[] | null
  dataStudents: IMentorCourseStudent[]
  dataModules?: IModulesData[]
  role?: 'mentor' | 'admin'
}
