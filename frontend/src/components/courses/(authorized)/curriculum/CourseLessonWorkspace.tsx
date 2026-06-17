import { FileText } from 'lucide-react'

import { getLessonKey } from '@/lib/course-edit/mappers'
import { isHomeworkConfigured } from '@/lib/course-edit/homework'
import type { CourseEditorTab, EditableLesson } from '@/lib/course-edit/types'
import type { LessonDeliveryType } from '@/lib/types/lesson'
import { cn } from '@/lib/utils'

import { LessonContentPanel } from './editor/LessonContentPanel'
import { LessonEditorHeader } from './editor/LessonEditorHeader'
import { LessonHomeworkPanel } from './editor/LessonHomeworkPanel'
import { PanelTransition } from './editor/PanelTransition'
import { editLayout } from '@/lib/course-edit/edit-layout'

type CourseLessonWorkspaceProps = {
  activeLesson: EditableLesson | null
  moduleLabel?: string
  editorTab: CourseEditorTab
  onEditorTabChange: (tab: CourseEditorTab) => void
  editorReady: boolean
  isLoadingDetail: boolean
  isAssignmentLoading?: boolean
  isCompact?: boolean
  onRenameLesson: (lessonId: string, title: string) => void | Promise<void>
  onChangeLessonType: (lessonId: string, type: LessonDeliveryType) => void
  onPatchLesson: (
    lessonId: string,
    updater: (lesson: EditableLesson) => EditableLesson,
  ) => void
  onPatchAssignment: (
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
  isAssignmentLoading = false,
  isCompact = false,
  onRenameLesson,
  onChangeLessonType,
  onPatchLesson,
  onPatchAssignment,
}: CourseLessonWorkspaceProps) {
  if (!activeLesson) {
    return isLoadingDetail ? <LoadingWorkspace /> : <EmptyWorkspace isCompact={isCompact} />
  }

  const lessonKey = getLessonKey(activeLesson)
  const showEditor = editorReady && !isLoadingDetail

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
        onEditorTabChange={onEditorTabChange}
        onRenameLesson={onRenameLesson}
      />

      <div className={cn(editorTab !== 'content' && 'hidden')}>
        <LessonContentPanel
          lesson={activeLesson}
          showEditor={showEditor}
          isLoadingDetail={isLoadingDetail}
          onChangeDeliveryType={(type) => onChangeLessonType(lessonKey, type)}
          onPatchLesson={onPatchLesson}
        />
      </div>

      {editorTab === 'homework' ? (
        <LessonHomeworkPanel
          lesson={activeLesson}
          isLoadingAssignment={isAssignmentLoading}
          onPatchAssignment={onPatchAssignment}
        />
      ) : null}
    </PanelTransition>
  )
}
