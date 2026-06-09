import type { RefObject } from 'react'

import type { LessonFooterNavAction } from '@/components/courses/module-viewer/LessonFooter'
import type { LessonEntry, LessonThemeMode } from '@/components/courses/module-viewer/utils'
import type { CourseModulePreviewVariant } from '@/lib/course-module-viewer/navigation'
import type { CourseViewerPane } from '@/lib/lesson-assignment/types'
import type { NormalizedQuiz } from '@/lib/lesson-assignment/quiz-payload'
import type { LessonDetailAssignment, LessonDetailItem } from '@/lib/types/lesson'
import type { ICourseDetailItem, IModulesDetail } from '@/lib/types/course'
import type { ICardData } from '@/lib/types/utils'
import type { NavbarSearchItem } from '@/providers/navbar-search-provider'
import type {
  LessonAssignmentSubmissionRecord,
  QuizReviewSummary,
  StudentSubmissionPhase,
} from '@/lib/lesson-assignment/types'
import type { SubmitLessonAssignmentPayload } from '@/lib/lesson-assignment/submission-draft'

export type CourseModuleViewerAssignmentState = {
  assignment: LessonDetailAssignment | null
  quiz: NormalizedQuiz | null
  submission: LessonAssignmentSubmissionRecord | null
  phase: StudentSubmissionPhase
  canStart: boolean
  submissionBlockReason: string | null
  quizReview: QuizReviewSummary | null
  isSubmitting: boolean
}

export type CourseModuleViewerViewModel = {
  courseUid: string
  variant: CourseModulePreviewVariant
  courseTitle: string
  backHref: string
  theme: LessonThemeMode
  isThemeDialogOpen: boolean
  onThemeDialogOpenChange: (open: boolean) => void
  onThemeChange: (theme: LessonThemeMode) => void
  modulesState: IModulesDetail[]
  lessonEntries: LessonEntry[]
  effectiveActiveLessonId: string | null
  activeEntry: LessonEntry | null
  displayedLesson: LessonDetailItem | null
  isLessonLoading: boolean
  isAssignmentLoading: boolean
  readLessonIds: ReadonlySet<string>
  completedLessonsCount: number
  progressPercent: number
  effectiveExpandedModules: Set<string>
  isRightSidebarOpen: boolean
  isMobileSidebarOpen: boolean
  isLocalSearchOpen: boolean
  searchQuery: string
  filteredSearchItems: NavbarSearchItem[]
  localSearchInputRef: RefObject<HTMLInputElement | null>
  viewerPane: CourseViewerPane
  assignmentState: CourseModuleViewerAssignmentState
  footerActiveTitle: string
  footerPreviousAction: LessonFooterNavAction | null
  footerNextAction: LessonFooterNavAction | null
  isContentShifted: boolean
  showFooter: boolean
  showLessonContent: boolean
  showAssignmentOverview: boolean
  showAssignmentDetail: boolean
  showAssignmentWork: boolean
  onOpenSearch: () => void
  onOpenThemeSettings: () => void
  onOpenModules: () => void
  onToggleSidebar: () => void
  onMobileSidebarOpenChange: (open: boolean) => void
  onToggleModule: (moduleId: string) => void
  onSelectLesson: (lessonId: string, moduleId?: string) => void
  onSearchQueryChange: (query: string) => void
  onCloseSearch: () => void
  onViewerPaneChange: (pane: CourseViewerPane) => void
  onSubmitAssignment: (payload: SubmitLessonAssignmentPayload) => Promise<void>
  mentorCourse: ICourseDetailItem
  repoCourse?: ICardData
}

export type CourseModuleViewerShellProps = {
  view: CourseModuleViewerViewModel
}

export type CourseModuleViewerPageInput = {
  courseUid: string
  variant: CourseModulePreviewVariant
  mentorCourse: ICourseDetailItem
  repoCourse?: ICardData
  storedModules: IModulesDetail[]
}
