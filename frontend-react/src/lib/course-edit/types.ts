import type {
  CourseDetailLesson,
  ICourseDetailItem,
  ICourseDetailModule,
  ILesson,
  IQuiz,
  LessonDetailItem,
  LessonPayloadInput,
} from '@/lib/types/course'
import type { LessonDeliveryType } from '@/lib/types/lesson'

export type CourseEditRole = 'mentor' | 'admin'

export type CourseEditorTab = 'content' | 'homework'

export type CourseEditNavigationActions = {
  onSelectModule: (moduleId: string) => void
  onSelectLesson: (lessonId: string) => void
  onOpenCreateModule: () => void
  onRenameModule: (moduleId: string) => void
  onDeleteModule: (moduleId: string) => void
  onAddLesson: (moduleId?: string) => void
  onRenameLesson: (lessonId: string, title: string) => void
  onDeleteLesson: (lessonId: string) => void
  onChangeLessonType: (lessonId: string, type: LessonDeliveryType) => void
}

export type CourseEditClientProps = {
  initialModuleId?: string
  routeBasePath?: '/mentor' | '/admin'
  role?: CourseEditRole
  courseData: ICourseDetailItem
  modules: ICourseDetailModule[]
  lessonsByModule: Record<string, LessonDetailItem[]>
}

export type LessonApiItem = LessonDetailItem

export type EditableLesson = ILesson & { uid?: string }

export type EditableModule = Omit<ICourseDetailModule, 'lessons'> & {
  uid?: string
  lessons: EditableLesson[]
}

export type CourseEditViewModel = {
  course: Partial<ICourseDetailItem> | null
  modules: EditableModule[]
  outlineModules: ICourseDetailModule[]
  activeModuleId: string | null
  activeLessonId: string | null
  activeLesson: EditableLesson | null
  activeOutlineModule: ICourseDetailModule | null
  editorReady: boolean
  modifiedLessons: Set<string>
  isSaving: boolean
  shouldLoadLessonDetail: boolean
  isLessonDetailLoading: boolean
  renameModuleTitle: string
}

export type { CourseDetailLesson, IQuiz, LessonPayloadInput }
