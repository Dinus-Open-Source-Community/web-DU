import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import type { CourseEditClientProps } from '@/lib/course-edit/types'
import { useCourseEditController } from '@/hooks/use-course-edit-controller'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { CourseEditShell } from './curriculum/CourseEditShell'
import { CreateModuleDialog } from './curriculum/CreateModuleDialog'
import { RenameModuleDialog } from './curriculum/RenameModuleDialog'
import { UnsavedLessonDialog } from './curriculum/UnsavedLessonDialog'

export function CourseEditClient({
  initialModuleId,
  routeBasePath = '/mentor',
  role = 'mentor',
  courseData,
  modules: sourceModules,
}: CourseEditClientProps) {
  const isAdmin = role === 'admin'

  const {
    course,
    outlineModules,
    activeModuleId,
    activeLessonId,
    activeLesson,
    activeOutlineModule,
    editorReady,
    activeLessonModified,
    isSaving,
    isCreateModuleOpen,
    renameModuleId,
    renameModuleTitle,
    deleteModuleId,
    deleteModuleTitle,
    isModuleMutating,
    loadedModuleIds,
    isModuleLessonsLoading,
    isLessonDetailLoading,
    unsavedDialogOpen,
    pendingNavigation,
    setUnsavedDialogOpen,
    setIsCreateModuleOpen,
    setRenameModuleId,
    setDeleteModuleId,
    handleSelectModule,
    handleSelectLesson,
    handleCreateModule,
    handleRenameModule,
    handleRequestDeleteModule,
    handleConfirmDeleteModule,
    handleAddLesson,
    handleRenameLesson,
    handleDeleteLesson,
    handleChangeLessonType,
    handlePublish,
    handleSaveCurrentLesson,
    handleSaveAndContinue,
    patchLocalLesson,
  } = useCourseEditController({
    initialModuleId,
    routeBasePath,
    role,
    courseData,
    modules: sourceModules,
  })

  if (!course) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-sm text-slate-600">
          Kursus tidak ditemukan. Akses editor hanya dari daftar kursus atau setelah
          membuat kursus baru.
        </p>
        <Button asChild variant="outline" className="w-fit rounded-lg">
          <Link to={ROUTES.courses}>Kembali ke daftar</Link>
        </Button>
      </section>
    )
  }

  const activeModuleIndex = activeOutlineModule
    ? outlineModules.findIndex((module) => module.uid === activeOutlineModule.uid)
    : -1

  return (
    <>
      <CourseEditShell
        routeBasePath={routeBasePath}
        course={course}
        isAdmin={isAdmin}
        isSaving={isSaving}
        hasUnsavedLesson={activeLessonModified}
        modules={outlineModules}
        loadedModuleIds={loadedModuleIds}
        loadingModuleId={isModuleLessonsLoading ? activeModuleId : null}
        activeModuleId={activeModuleId ?? activeOutlineModule?.uid ?? null}
        activeLessonId={activeLessonId}
        activeLesson={activeLesson}
        activeModuleTitle={activeOutlineModule?.title ?? null}
        activeModuleIndex={activeModuleIndex >= 0 ? activeModuleIndex : null}
        editorReady={editorReady}
        isLoadingDetail={isLessonDetailLoading || isModuleLessonsLoading}
        onPublish={() => void handlePublish()}
        onSave={() => void handleSaveCurrentLesson()}
        onPatchLesson={patchLocalLesson}
        onSelectModule={handleSelectModule}
        onSelectLesson={handleSelectLesson}
        onOpenCreateModule={() => setIsCreateModuleOpen(true)}
        onRenameModule={setRenameModuleId}
        onDeleteModule={handleRequestDeleteModule}
        onAddLesson={handleAddLesson}
        onRenameLesson={handleRenameLesson}
        onDeleteLesson={handleDeleteLesson}
        onChangeLessonType={handleChangeLessonType}
      />

      <UnsavedLessonDialog
        open={unsavedDialogOpen}
        onOpenChange={setUnsavedDialogOpen}
        lessonTitle={activeLesson?.title ?? 'Lesson ini'}
        targetLabel={pendingNavigation?.label ?? 'melanjutkan'}
        isSaving={isSaving}
        onSaveAndContinue={() => void handleSaveAndContinue()}
      />

      <CreateModuleDialog
        open={isCreateModuleOpen}
        onOpenChange={setIsCreateModuleOpen}
        onCreateModule={handleCreateModule}
        nextOrder={outlineModules.length + 1}
        isSubmitting={isModuleMutating}
      />

      <RenameModuleDialog
        open={Boolean(renameModuleId)}
        currentTitle={renameModuleTitle}
        onOpenChange={(open) => {
          if (!open) setRenameModuleId(null)
        }}
        onRename={(title) => {
          if (!renameModuleId) return Promise.resolve()
          return handleRenameModule(renameModuleId, title)
        }}
        isSubmitting={isModuleMutating}
      />

      <ConfirmDialog
        open={Boolean(deleteModuleId)}
        onOpenChange={(open) => {
          if (!open) setDeleteModuleId(null)
        }}
        title="Hapus modul?"
        description={
          deleteModuleTitle
            ? `Modul "${deleteModuleTitle}" dan semua lesson di dalamnya akan dihapus permanen.`
            : 'Modul dan semua lesson di dalamnya akan dihapus permanen.'
        }
        confirmLabel={isModuleMutating ? 'Menghapus...' : 'Hapus modul'}
        cancelLabel="Batal"
        variant="destructive"
        onConfirm={() => void handleConfirmDeleteModule()}
      />
    </>
  )
}
