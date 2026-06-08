import type { LessonDeliveryType } from '../common/domain'
import type { ICourseDetailItem } from '../data/course'
import type { ILesson, ILessonDetailItem } from '../data/lesson'
import type { ICourseDetailModule } from '../data/module'

export type CourseEditRole = 'mentor' | 'admin'
export type CourseEditorTab = 'content' | 'homework'

export interface ICourseEditNavigationActions {
  onSelectModule: (moduleId: string) => void
  onSelectLesson: (lessonId: string) => boolean | void
  onOpenCreateModule: () => void
  onRenameModule: (moduleId: string) => void
  onDeleteModule: (moduleId: string) => void
  onAddLesson: (moduleId?: string) => void
  onRenameLesson: (lessonId: string, title: string) => void | Promise<void>
  onDeleteLesson: (lessonId: string) => void
  onChangeLessonType: (lessonId: string, type: LessonDeliveryType) => void
}

export interface ICourseEditClientProps {
  initialModuleId?: string
  routeBasePath?: '/mentor' | '/admin'
  role?: CourseEditRole
  courseData: ICourseDetailItem
  modules: ICourseDetailModule[]
}

export interface ILessonContentDrafts {
  textContentHtml?: string
  videoUrl?: string
  videoDescriptionHtml?: string
}

export type IEditableLesson = ILesson & {
  uid?: string
  contentDrafts?: ILessonContentDrafts
}

export type IEditableModule = Omit<ICourseDetailModule, 'lessons'> & {
  uid?: string
  lessons: IEditableLesson[]
}

export interface ICourseEditViewModel {
  course: Partial<ICourseDetailItem> | null
  modules: IEditableModule[]
  outlineModules: ICourseDetailModule[]
  activeModuleId: string | null
  activeLessonId: string | null
  activeLesson: IEditableLesson | null
  activeOutlineModule: ICourseDetailModule | null
  editorReady: boolean
  modifiedLessons: Set<string>
  isSaving: boolean
  shouldLoadLessonDetail: boolean
  isLessonDetailLoading: boolean
  renameModuleTitle: string
}

/** Alias backward-compat. */
export type CourseEditNavigationActions = ICourseEditNavigationActions
export type CourseEditClientProps = ICourseEditClientProps
export type LessonContentDrafts = ILessonContentDrafts
export type EditableLesson = IEditableLesson
export type EditableModule = IEditableModule
export type CourseEditViewModel = ICourseEditViewModel
export type LessonApiItem = ILessonDetailItem
export type { IQuiz } from '../data/lesson'
