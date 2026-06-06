import { useLayoutEffect, useRef, useState } from 'react'
import { FileText } from 'lucide-react'

import { getLessonKey } from '@/lib/course-edit/mappers'
import { isHomeworkConfigured } from '@/lib/course-edit/homework'
import type { CourseEditorTab, EditableLesson } from '@/lib/course-edit/types'
import type { LessonDeliveryType } from '@/lib/types/lesson'

import { LessonContentPanel } from './editor/LessonContentPanel'
import { LessonEditorHeader } from './editor/LessonEditorHeader'
import { LessonHomeworkPanel } from './editor/LessonHomeworkPanel'
import { PanelTransition } from './editor/PanelTransition'
import { tabSlideDirection, type PanelSlideDirection } from './editor/edit-motion'
import { editLayout } from './edit-layout'

type CourseLessonWorkspaceProps = {
  activeLesson: EditableLesson | null
  moduleLabel?: string
  editorTab: CourseEditorTab
  onEditorTabChange: (tab: CourseEditorTab) => void
  editorReady: boolean
  isLoadingDetail: boolean
  isCompact?: boolean
  onRenameLesson: (lessonId: string, title: string) => void
  onDeleteLesson: (lessonId: string) => void
  onChangeLessonType: (lessonId: string, type: LessonDeliveryType) => void
  onPatchLesson: (
    lessonId: string,
    updater: (lesson: EditableLesson) => EditableLesson,
  ) => void
}

function EmptyWorkspace({ isCompact = false }: { isCompact?: boolean }) {
  return (
    <div className="flex min-h-[16rem] flex-col items-center justify-center px-4 py-12 text-center lg:min-h-[24rem]">
      <FileText className="size-10 text-slate-300" aria-hidden />
      <p className={`mt-4 ${editLayout.sectionTitle}`}>
        {isCompact ? 'Pilih lesson di kurikulum' : 'Pilih lesson di panel kiri'}
      </p>
      <p className={`mt-2 max-w-sm ${editLayout.body}`}>
        {isCompact
          ? 'Buka daftar kurikulum, pilih modul, lalu ketuk lesson yang ingin diedit.'
          : 'Daftar modul dan lesson ada di kolom kurikulum. Klik lesson untuk mulai mengedit.'}
      </p>
    </div>
  )
}

function LoadingWorkspace() {
  return (
    <div className="flex min-h-[16rem] flex-col items-center justify-center py-12 text-center lg:min-h-[24rem]">
      <div className="size-10 animate-pulse rounded-full bg-slate-200" aria-hidden />
      <p className={`mt-4 ${editLayout.sectionTitle}`}>Memuat lesson…</p>
      <p className={`mt-2 max-w-sm ${editLayout.body}`}>
        Mengambil daftar lesson modul yang dipilih.
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
  isCompact = false,
  onRenameLesson,
  onDeleteLesson,
  onChangeLessonType,
  onPatchLesson,
}: CourseLessonWorkspaceProps) {
  const [tabDirection, setTabDirection] = useState<PanelSlideDirection>('bottom')
  const previousEditorTabRef = useRef(editorTab)

  const handleEditorTabChange = (tab: CourseEditorTab) => {
    setTabDirection(tabSlideDirection(tab, editorTab))
    previousEditorTabRef.current = tab
    onEditorTabChange(tab)
  }

  useLayoutEffect(() => {
    if (previousEditorTabRef.current === editorTab) return

    setTabDirection(tabSlideDirection(editorTab, previousEditorTabRef.current))
    previousEditorTabRef.current = editorTab
  }, [editorTab])

  if (!activeLesson) {
    return isLoadingDetail ? <LoadingWorkspace /> : <EmptyWorkspace isCompact={isCompact} />
  }

  const lessonKey = getLessonKey(activeLesson)
  const showEditor = editorReady && !isLoadingDetail
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
        isCompact={isCompact}
        onEditorTabChange={handleEditorTabChange}
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
