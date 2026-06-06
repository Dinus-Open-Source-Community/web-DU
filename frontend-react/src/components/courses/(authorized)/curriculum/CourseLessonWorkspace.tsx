import { useEffect, useRef } from 'react'
import { FileText } from 'lucide-react'

import { getLessonKey } from '@/lib/course-edit/mappers'
import { isHomeworkConfigured } from '@/lib/course-edit/homework'
import type { CourseEditorTab, EditableLesson } from '@/lib/course-edit/types'
import type { LessonDeliveryType } from '@/lib/types/lesson'

import { LessonContentPanel } from './editor/LessonContentPanel'
import { LessonEditorHeader } from './editor/LessonEditorHeader'
import { LessonHomeworkPanel } from './editor/LessonHomeworkPanel'
import { PanelTransition } from './editor/PanelTransition'
import { tabSlideDirection } from './editor/edit-motion'
import { editLayout } from './edit-layout'

type CourseLessonWorkspaceProps = {
  activeLesson: EditableLesson | null
  moduleLabel?: string
  editorTab: CourseEditorTab
  onEditorTabChange: (tab: CourseEditorTab) => void
  editorReady: boolean
  isLoadingDetail: boolean
  onRenameLesson: (lessonId: string, title: string) => void
  onDeleteLesson: (lessonId: string) => void
  onChangeLessonType: (lessonId: string, type: LessonDeliveryType) => void
  onPatchLesson: (
    lessonId: string,
    updater: (lesson: EditableLesson) => EditableLesson,
  ) => void
}

function EmptyWorkspace() {
  return (
    <div className="flex min-h-[16rem] flex-col items-center justify-center py-12 text-center lg:min-h-[24rem]">
      <FileText className="size-10 text-slate-300" aria-hidden />
      <p className={`mt-4 ${editLayout.sectionTitle}`}>Pilih lesson di panel kiri</p>
      <p className={`mt-2 max-w-sm ${editLayout.body}`}>
        Daftar modul dan lesson ada di kolom kurikulum. Klik lesson untuk mulai mengedit.
      </p>
    </div>
  )
}

export function CourseLessonWorkspace({
  activeLesson,
  moduleLabel,
  editorTab,
  onEditorTabChange,
  editorReady,
  isLoadingDetail,
  onRenameLesson,
  onDeleteLesson,
  onChangeLessonType,
  onPatchLesson,
}: CourseLessonWorkspaceProps) {
  const previousTabRef = useRef<CourseEditorTab>(editorTab)

  useEffect(() => {
    previousTabRef.current = editorTab
  }, [editorTab])

  if (!activeLesson) {
    return <EmptyWorkspace />
  }

  const lessonKey = getLessonKey(activeLesson)
  const showEditor = editorReady && !isLoadingDetail
  const tabDirection = tabSlideDirection(editorTab, previousTabRef.current)
  const panelKey = `${lessonKey}-${editorTab}`

  return (
    <PanelTransition panelKey={lessonKey} direction="bottom" className="min-w-0">
      <LessonEditorHeader
        lessonId={lessonKey}
        lessonTitle={activeLesson.title}
        moduleLabel={moduleLabel}
        lessonOrder={activeLesson.order}
        editorTab={editorTab}
        hasHomework={isHomeworkConfigured(activeLesson)}
        onEditorTabChange={onEditorTabChange}
        onRenameLesson={onRenameLesson}
        onDeleteLesson={onDeleteLesson}
      />

      {editorTab === 'content' && (
        <PanelTransition panelKey={panelKey} direction={tabDirection}>
          <LessonContentPanel
            lesson={activeLesson}
            showEditor={showEditor}
            isLoadingDetail={isLoadingDetail}
            onChangeDeliveryType={(type) => onChangeLessonType(lessonKey, type)}
            onPatchLesson={onPatchLesson}
          />
        </PanelTransition>
      )}

      {editorTab === 'homework' && (
        <PanelTransition panelKey={panelKey} direction={tabDirection}>
          <LessonHomeworkPanel lesson={activeLesson} onPatchLesson={onPatchLesson} />
        </PanelTransition>
      )}
    </PanelTransition>
  )
}
