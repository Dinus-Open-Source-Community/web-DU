import { Link } from 'react-router-dom'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import type { CourseEditClientProps } from '@/lib/course-edit/types'
import { useCourseEditController } from '@/hooks/use-course-edit-controller'

import { CourseEditShell } from './curriculum/CourseEditShell'
import { CreateModuleDialog } from './curriculum/CreateModuleDialog'
import { RenameModuleDialog } from './curriculum/RenameModuleDialog'

export function CourseEditClient({
  initialModuleId,
  routeBasePath = '/mentor',
  role = 'mentor',
  courseData,
  modules: sourceModules,
  lessonsByModule,
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
    modifiedLessons,
    isSaving,
    isConfirmOpen,
    isCreateModuleOpen,
    renameModuleId,
    renameModuleTitle,
    isLessonDetailLoading,
    setActiveLessonId,
    setIsConfirmOpen,
    setIsCreateModuleOpen,
    setRenameModuleId,
    handleSelectModule,
    handleCreateModule,
    handleRenameModule,
    handleDeleteModule,
    handleAddLesson,
    handleRenameLesson,
    handleDeleteLesson,
    handleChangeLessonType,
    handlePublish,
    confirmSave,
    patchLocalLesson,
  } = useCourseEditController({
    initialModuleId,
    routeBasePath,
    role,
    courseData,
    modules: sourceModules,
    lessonsByModule,
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
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Simpan perubahan kurikulum?"
        description="Semua modul dan lesson akan divalidasi lalu disinkronkan ke backend. Lesson video membutuhkan URL YouTube yang valid; lesson teks membutuhkan konten yang tidak kosong."
        confirmLabel={isSaving ? 'Menyimpan...' : 'Simpan'}
        onConfirm={confirmSave}
      />

      <CourseEditShell
        course={course}
        isAdmin={isAdmin}
        isSaving={isSaving}
        modifiedCount={modifiedLessons.size}
        modules={outlineModules}
        activeModuleId={activeModuleId ?? activeOutlineModule?.uid ?? null}
        activeLessonId={activeLessonId}
        activeLesson={activeLesson}
        activeModuleTitle={activeOutlineModule?.title ?? null}
        activeModuleIndex={activeModuleIndex >= 0 ? activeModuleIndex : null}
        editorReady={editorReady}
        isLoadingDetail={isLessonDetailLoading}
        onPublish={() => void handlePublish()}
        onSave={() => setIsConfirmOpen(true)}
        onPatchLesson={patchLocalLesson}
        onSelectModule={handleSelectModule}
        onSelectLesson={setActiveLessonId}
        onOpenCreateModule={() => setIsCreateModuleOpen(true)}
        onRenameModule={setRenameModuleId}
        onDeleteModule={handleDeleteModule}
        onAddLesson={handleAddLesson}
        onRenameLesson={handleRenameLesson}
        onDeleteLesson={handleDeleteLesson}
        onChangeLessonType={handleChangeLessonType}
      />

      <CreateModuleDialog
        open={isCreateModuleOpen}
        onOpenChange={setIsCreateModuleOpen}
        onCreateModule={handleCreateModule}
        nextOrder={outlineModules.length + 1}
      />

      <RenameModuleDialog
        open={Boolean(renameModuleId)}
        currentTitle={renameModuleTitle}
        onOpenChange={(open) => {
          if (!open) setRenameModuleId(null)
        }}
        onRename={(title) => {
          if (!renameModuleId) return
          handleRenameModule(renameModuleId, title)
          setRenameModuleId(null)
        }}
      />
    </>
  )
}
