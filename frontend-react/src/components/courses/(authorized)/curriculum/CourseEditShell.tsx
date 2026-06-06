import { useEffect, useState } from 'react'

import type {
  CourseEditNavigationActions,
  CourseEditorTab,
  EditableLesson,
} from '@/lib/course-edit/types'
import type { ICourseDetailItem } from '@/lib/types/course'
import type { IModulesData } from '@/lib/types/module'

import { CourseEditToolbar } from './CourseEditChrome'
import { CourseLessonWorkspace } from './CourseLessonWorkspace'
import { CurriculumOutline } from './CurriculumOutline'
import { editLayout } from './edit-layout'

type CourseEditShellProps = CourseEditNavigationActions & {
  course: Partial<ICourseDetailItem>
  isAdmin: boolean
  isSaving: boolean
  modifiedCount: number
  modules: IModulesData[]
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
  course,
  isAdmin,
  isSaving,
  modifiedCount,
  modules,
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

  useEffect(() => {
    setEditorTab('content')
  }, [activeLessonId])

  const moduleLabel =
    activeModuleTitle && activeModuleIndex != null
      ? `Modul ${activeModuleIndex + 1} · ${activeModuleTitle}`
      : undefined

  return (
    <div className={editLayout.page}>
      <CourseEditToolbar
        course={course}
        isAdmin={isAdmin}
        isSaving={isSaving}
        modifiedCount={modifiedCount}
        onPublish={onPublish}
        onSave={onSave}
      />

      <div className={editLayout.shell}>
        <CurriculumOutline
          modules={modules}
          activeModuleId={activeModuleId}
          activeLessonId={activeLessonId}
          onSelectModule={onSelectModule}
          onSelectLesson={onSelectLesson}
          onOpenCreateModule={onOpenCreateModule}
          onAddLesson={onAddLesson}
          onRenameModule={onRenameModule}
          onDeleteModule={onDeleteModule}
        />

        <main className={editLayout.editorPanel}>
          <CourseLessonWorkspace
            activeLesson={activeLesson}
            moduleLabel={moduleLabel}
            editorTab={editorTab}
            onEditorTabChange={setEditorTab}
            editorReady={editorReady}
            isLoadingDetail={isLoadingDetail}
            onRenameLesson={onRenameLesson}
            onDeleteLesson={onDeleteLesson}
            onChangeLessonType={onChangeLessonType}
            onPatchLesson={onPatchLesson}
          />
        </main>
      </div>
    </div>
  )
}
