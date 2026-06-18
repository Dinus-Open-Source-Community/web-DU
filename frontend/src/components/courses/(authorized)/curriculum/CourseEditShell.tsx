import { useCallback, useEffect, useState } from 'react'

import type {
  CourseEditNavigationActions,
  CourseEditorTab,
  EditableLesson,
} from '@/lib/course-edit/types'
import type { ICourseDetailItem } from '@/lib/types/course'
import type { IModulesData } from '@/lib/types/module'
import { getLessonKey } from '@/lib/course-edit/mappers'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import { resolveCourseProfiles } from '@/lib/course-detail/course-profile'
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
import { editLayout } from '@/lib/course-edit/edit-layout'
import { UnsavedEditorTabDialog } from './UnsavedEditorTabDialog'

type CourseEditShellProps = CourseEditNavigationActions & {
  routeBasePath: '/mentor' | '/admin'
  course: Partial<ICourseDetailItem>
  isAdmin: boolean
  isSaving: boolean
  isSavingAssignment: boolean
  isPublishing: boolean
  hasUnsavedLesson: boolean
  hasUnsavedAssignment: boolean
  canSaveAssignment: boolean
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
  isAssignmentLoading?: boolean
  onPublish: () => void
  onSaveLesson: () => Promise<void>
  onSaveAssignment: () => Promise<void>
  onDeleteAssignment: () => Promise<void>
  onPatchLesson: (
    lessonId: string,
    updater: (lesson: EditableLesson) => EditableLesson,
  ) => void
  onPatchAssignment: (
    lessonId: string,
    updater: (lesson: EditableLesson) => EditableLesson,
  ) => void
}

export function CourseEditShell({
  routeBasePath,
  course,
  isAdmin,
  isSaving,
  isSavingAssignment,
  isPublishing,
  hasUnsavedLesson,
  hasUnsavedAssignment,
  canSaveAssignment,
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
  isAssignmentLoading = false,
  onPublish,
  onSaveLesson,
  onSaveAssignment,
  onDeleteAssignment,
  onPatchLesson,
  onPatchAssignment,
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
  const [unsavedTabDialogOpen, setUnsavedTabDialogOpen] = useState(false)
  const [pendingEditorTab, setPendingEditorTab] = useState<CourseEditorTab | null>(
    null,
  )
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

  const handleEditorTabChange = useCallback(
    (tab: CourseEditorTab) => {
      if (tab === editorTab) return

      const leavingContent = editorTab === 'content' && hasUnsavedLesson
      const leavingHomework = editorTab === 'homework' && hasUnsavedAssignment

      if (leavingContent || leavingHomework) {
        setPendingEditorTab(tab)
        setUnsavedTabDialogOpen(true)
        return
      }

      setEditorTab(tab)
    },
    [editorTab, hasUnsavedAssignment, hasUnsavedLesson],
  )

  const handleSaveTabAndContinue = useCallback(async () => {
    try {
      if (editorTab === 'content' && hasUnsavedLesson) {
        await onSaveLesson()
      } else if (editorTab === 'homework' && hasUnsavedAssignment) {
        await onSaveAssignment()
      }

      if (pendingEditorTab) {
        setEditorTab(pendingEditorTab)
      }
      setPendingEditorTab(null)
      setUnsavedTabDialogOpen(false)
    } catch {
      // Error toast already shown in save handlers.
    }
  }, [
    editorTab,
    hasUnsavedAssignment,
    hasUnsavedLesson,
    onSaveAssignment,
    onSaveLesson,
    pendingEditorTab,
  ])

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
  const isTabSaving = editorTab === 'homework' ? isSavingAssignment : isSaving

  return (
    <div className={`${editLayout.page} ${isCompact ? editLayout.pageCompact : ''}`}>
      <CourseEditToolbar
        course={course}
        isAdmin={isAdmin}
        isSaving={isTabSaving}
        isPublishing={isPublishing}
        editorTab={editorTab}
        showEditorActions={Boolean(activeLesson)}
        hasUnsavedLesson={hasUnsavedLesson}
        hasUnsavedAssignment={hasUnsavedAssignment}
        canSaveAssignment={canSaveAssignment}
        isCompact={isCompact}
        compactPane={compactPane}
        onBack={goBack}
        onPublish={onPublish}
        onSaveLesson={() => void onSaveLesson()}
        onSaveAssignment={() => void onSaveAssignment()}
        onDeleteLesson={() => {
          if (activeLesson) onDeleteLesson(getLessonKey(activeLesson))
        }}
        onDeleteAssignment={() => void onDeleteAssignment()}
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
                lessonId={getLessonKey(activeLesson)}
                lessonTitle={activeLesson.title}
                moduleLabel={moduleLabel}
                onBackToOutline={openOutline}
                onRenameLesson={onRenameLesson}
              />
            )}

            <div className={isCompact ? editLayout.editorPanelCompact : undefined}>
              <CourseLessonWorkspace
                activeLesson={activeLesson}
                moduleLabel={isCompact ? undefined : moduleLabel}
                editorTab={editorTab}
                onEditorTabChange={handleEditorTabChange}
                editorReady={editorReady}
                isLoadingDetail={isLoadingDetail}
                isAssignmentLoading={isAssignmentLoading}
                isCompact={isCompact}
                onRenameLesson={onRenameLesson}
                onChangeLessonType={onChangeLessonType}
                onPatchLesson={onPatchLesson}
                onPatchAssignment={onPatchAssignment}
              />
            </div>
          </main>
        )}
      </div>

      {showCompactEditorChrome && activeLesson && (
        <CourseEditStickySaveBar
          editorTab={editorTab}
          isSaving={isTabSaving}
          isPublishing={isPublishing}
          hasUnsavedLesson={hasUnsavedLesson}
          hasUnsavedAssignment={hasUnsavedAssignment}
          canSaveAssignment={canSaveAssignment}
          isAdmin={isAdmin}
          isPublished={isCoursePublished(course)}
          hasMentor={resolveCourseProfiles(course).length > 0}
          onSaveLesson={() => void onSaveLesson()}
          onSaveAssignment={() => void onSaveAssignment()}
          onPublish={onPublish}
          onDeleteLesson={() => onDeleteLesson(getLessonKey(activeLesson))}
          onDeleteAssignment={() => void onDeleteAssignment()}
        />
      )}

      <UnsavedEditorTabDialog
        open={unsavedTabDialogOpen}
        onOpenChange={(open) => {
          setUnsavedTabDialogOpen(open)
          if (!open) setPendingEditorTab(null)
        }}
        currentTab={editorTab}
        targetTab={pendingEditorTab}
        isSaving={isTabSaving}
        onSaveAndContinue={() => void handleSaveTabAndContinue()}
      />
    </div>
  )
}
