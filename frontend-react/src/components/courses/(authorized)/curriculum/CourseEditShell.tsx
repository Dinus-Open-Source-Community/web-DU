import { useCallback, useEffect, useState } from 'react'

import type {
  CourseEditNavigationActions,
  CourseEditorTab,
  EditableLesson,
} from '@/lib/course-edit/types'
import type { ICourseDetailItem } from '@/lib/types/course'
import type { IModulesData } from '@/lib/types/module'
import {
  shouldShowEditorPane,
  shouldShowOutlinePane,
} from '@/lib/course-edit/viewport'
import { useCourseEditBackNavigation } from '@/hooks/use-course-edit-back-navigation'
import { useCourseEditViewport } from '@/hooks/use-course-edit-viewport'
import { useCompactCourseEditNavigation } from '@/hooks/use-compact-course-edit-navigation'

import { CourseEditCompactHeader } from './compact/CourseEditCompactHeader'
import { CourseEditStickySaveBar } from './compact/CourseEditStickySaveBar'
import { CourseEditToolbar } from './CourseEditChrome'
import { CourseLessonWorkspace } from './CourseLessonWorkspace'
import { CurriculumOutline } from './CurriculumOutline'
import { editLayout } from './edit-layout'

type CourseEditShellProps = CourseEditNavigationActions & {
  routeBasePath: '/mentor' | '/admin'
  course: Partial<ICourseDetailItem>
  isAdmin: boolean
  isSaving: boolean
  isPublishing: boolean
  hasUnsavedLesson: boolean
  modules: IModulesData[]
  loadedModuleIds: Set<string>
  loadingModuleId: string | null
  activeModuleId: string | null
  activeLessonId: string | null
  activeLesson: EditableLesson | null
  activeModuleTitle: string | null
  activeModuleIndex: number | null
  editorReady: boolean
  isLoadingDetail: boolean
  onPublish: () => void
  onSave: () => void
  onPatchLesson: (
    lessonId: string,
    updater: (lesson: EditableLesson) => EditableLesson,
  ) => void
}

export function CourseEditShell({
  routeBasePath,
  course,
  isAdmin,
  isSaving,
  isPublishing,
  hasUnsavedLesson,
  modules,
  loadedModuleIds,
  loadingModuleId,
  activeModuleId,
  activeLessonId,
  activeLesson,
  activeModuleTitle,
  activeModuleIndex,
  editorReady,
  isLoadingDetail,
  onPublish,
  onSave,
  onPatchLesson,
  onSelectModule,
  onSelectLesson,
  onOpenCreateModule,
  onAddLesson,
  onRenameModule,
  onDeleteModule,
  onRenameLesson,
  onDeleteLesson,
  onChangeLessonType,
}: CourseEditShellProps) {
  const [editorTab, setEditorTab] = useState<CourseEditorTab>('content')
  const { goBack } = useCourseEditBackNavigation(routeBasePath)
  const { isCompact, viewportMode } = useCourseEditViewport()
  const { compactPane, openOutline, openEditor } = useCompactCourseEditNavigation(
    isCompact,
    activeLessonId,
  )

  const handleSelectLessonFromOutline = useCallback(
    (lessonId: string) => {
      const didNavigate = onSelectLesson(lessonId)
      if (isCompact && compactPane === 'outline' && didNavigate !== false) {
        openEditor()
      }
    },
    [compactPane, isCompact, onSelectLesson, openEditor],
  )

  useEffect(() => {
    setEditorTab('content')
  }, [activeLessonId])

  const moduleLabel =
    activeModuleTitle && activeModuleIndex != null
      ? `Modul ${activeModuleIndex + 1} · ${activeModuleTitle}`
      : undefined

  const showOutline = shouldShowOutlinePane(viewportMode, compactPane)
  const showEditor = shouldShowEditorPane(
    viewportMode,
    compactPane,
    Boolean(activeLessonId),
  )
  const showCompactEditorChrome = isCompact && showEditor && Boolean(activeLesson)
  const outlineLayout = isCompact ? 'full' : 'sidebar'

  return (
    <div className={`${editLayout.page} ${isCompact ? editLayout.pageCompact : ''}`}>
      <CourseEditToolbar
        course={course}
        isAdmin={isAdmin}
        isSaving={isSaving}
        isPublishing={isPublishing}
        hasUnsavedLesson={hasUnsavedLesson}
        isCompact={isCompact}
        compactPane={compactPane}
        onBack={goBack}
        onPublish={onPublish}
        onSave={onSave}
      />

      <div className={isCompact ? 'flex min-h-0 flex-1 flex-col' : editLayout.shell}>
        {showOutline && (
          <div className={isCompact ? editLayout.shellCompactOutline : undefined}>
            <CurriculumOutline
              layout={outlineLayout}
              modules={modules}
              loadedModuleIds={loadedModuleIds}
              loadingModuleId={loadingModuleId}
              activeModuleId={activeModuleId}
              activeLessonId={activeLessonId}
              onSelectModule={onSelectModule}
              onSelectLesson={handleSelectLessonFromOutline}
              onOpenCreateModule={onOpenCreateModule}
              onAddLesson={onAddLesson}
              onRenameModule={onRenameModule}
              onDeleteModule={onDeleteModule}
            />
          </div>
        )}

        {showEditor && (
          <main
            className={
              isCompact ? editLayout.shellCompactEditor : editLayout.editorPanel
            }
          >
            {showCompactEditorChrome && activeLesson && (
              <CourseEditCompactHeader
                lessonTitle={activeLesson.title}
                moduleLabel={moduleLabel}
                onBackToOutline={openOutline}
              />
            )}

            <div className={isCompact ? editLayout.editorPanelCompact : undefined}>
              <CourseLessonWorkspace
                activeLesson={activeLesson}
                moduleLabel={isCompact ? undefined : moduleLabel}
                editorTab={editorTab}
                onEditorTabChange={setEditorTab}
                editorReady={editorReady}
                isLoadingDetail={isLoadingDetail}
                isCompact={isCompact}
                onRenameLesson={onRenameLesson}
                onDeleteLesson={onDeleteLesson}
                onChangeLessonType={onChangeLessonType}
                onPatchLesson={onPatchLesson}
              />
            </div>
          </main>
        )}
      </div>

      {showCompactEditorChrome && (
        <CourseEditStickySaveBar
          isSaving={isSaving}
          isPublishing={isPublishing}
          hasUnsavedLesson={hasUnsavedLesson}
          isAdmin={isAdmin}
          isPublished={Boolean(course.is_published)}
          onSave={onSave}
          onPublish={onPublish}
        />
      )}
    </div>
  )
}
