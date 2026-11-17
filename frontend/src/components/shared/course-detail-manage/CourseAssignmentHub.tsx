import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { AssignmentFormDialog } from '@/components/admin/assignments/AssignmentFormDialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { CourseDetailAssignmentsTab } from '@/components/shared/course-detail-manage/CourseDetailAssignmentsTab'
import { Button } from '@/components/ui/button'
import { useCourseDetailAssignmentsView } from '@/hooks/course-detail/use-course-detail-assignments-view'
import { useRegisterCourseNavbarBreadcrumb } from '@/hooks/layout/use-register-course-navbar-breadcrumb'
import { courseKeys, lessonAssignmentKeys } from '@/hooks/query-keys'
import { useLessonAssignmentAdmin } from '@/hooks/use-lesson-assignment-admin'
import type { LessonAssignmentUpsertPayload } from '@/lib/course-edit/homework-rules'
import type { StaffAssignmentRole } from '@/lib/course-detail/course-assignment-navigation'
import type { CourseAssignmentOverviewItem } from '@/lib/course-detail/course-assignment-overview-presenter'
import { deriveLessonsFromModules } from '@/lib/course-detail/derive-lessons-from-modules'
import { Message } from '@/lib/Message'
import type { IModulesData, IMentorCourseStudent } from '@/lib/types/course'
import {
  createLessonAssignment,
  deleteLessonAssignment,
  updateLessonAssignment,
} from '@/services/lesson-assignment-admin'
import { fetchCourseAssignments } from '@/services/course-assignments'

type CourseAssignmentHubProps = {
  courseUid: string
  courseTitle: string
  role: StaffAssignmentRole
  modules: IModulesData[]
  students: IMentorCourseStudent[]
}

/**
 * Halaman standalone Kelola Tugas: daftar tugas kursus + aksi Buat/Edit/Hapus.
 * Daftar, filter, dan pagination memakai view tab Tugas yang sudah ada.
 */
export function CourseAssignmentHub({
  courseUid,
  courseTitle,
  role,
  modules,
  students,
}: CourseAssignmentHubProps) {
  useRegisterCourseNavbarBreadcrumb(courseUid, courseTitle)

  const queryClient = useQueryClient()
  const view = useCourseDetailAssignmentsView({ courseUid, role, students })

  const lessonOptions = useMemo(() => deriveLessonsFromModules(modules), [modules])

  const [createOpen, setCreateOpen] = useState(false)
  const [editLessonUid, setEditLessonUid] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CourseAssignmentOverviewItem | null>(null)

  const editQuery = useLessonAssignmentAdmin(editLessonUid, editLessonUid !== null)

  const existingAssignmentsQuery = useQuery({
    queryKey: courseKeys.assignments(courseUid, { page: 1, per_page: 100 }),
    queryFn: () => fetchCourseAssignments(courseUid, { page: 1, per_page: 100 }),
    enabled: createOpen && Boolean(courseUid),
    staleTime: 30_000,
    retry: false,
  })

  const existingLessonUids = useMemo(() => {
    const set = new Set<string>()
    existingAssignmentsQuery.data?.assignments.forEach((assignment) => {
      if (assignment.lessonUid) set.add(assignment.lessonUid)
    })
    return set
  }, [existingAssignmentsQuery.data])

  const invalidateAssignments = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['courses', courseUid, 'assignments'] }),
      queryClient.invalidateQueries({ queryKey: lessonAssignmentKeys.all }),
    ])
  }

  const createMutation = useMutation({
    mutationFn: ({
      lessonUid,
      payload,
    }: {
      lessonUid: string
      payload: LessonAssignmentUpsertPayload
    }) => createLessonAssignment(lessonUid, payload),
    onSuccess: () => void invalidateAssignments(),
    onError: (error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({
      lessonUid,
      payload,
    }: {
      lessonUid: string
      payload: LessonAssignmentUpsertPayload
    }) => updateLessonAssignment(lessonUid, payload),
    onSuccess: () => void invalidateAssignments(),
    onError: (error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (lessonUid: string) => deleteLessonAssignment(lessonUid),
    onSuccess: () => void invalidateAssignments(),
    onError: (error) => toast.error(error.message),
  })

  const handleCreate = async (input: {
    lessonUid: string
    payload: LessonAssignmentUpsertPayload
  }) => {
    try {
      await createMutation.mutateAsync(input)
      toast.success(Message.assignment.created)
      setCreateOpen(false)
    } catch {
      // Galat sudah ditampilkan lewat onError mutasi.
    }
  }

  const handleUpdate = async (input: {
    lessonUid: string
    payload: LessonAssignmentUpsertPayload
  }) => {
    try {
      await updateMutation.mutateAsync(input)
      toast.success(Message.assignment.updated)
      setEditLessonUid(null)
    } catch {
      // Galat sudah ditampilkan lewat onError mutasi.
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.lessonUid)
      toast.success(Message.assignment.removedFromServer)
      setDeleteTarget(null)
    } catch {
      // Galat sudah ditampilkan lewat onError mutasi.
    }
  }

  return (
    <>
      <CourseDetailAssignmentsTab
        view={view}
        actions={
          <Button
            type="button"
            className="shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" aria-hidden />
            Buat Tugas
          </Button>
        }
        renderRowActions={(item) => (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 shrink-0 rounded-sm"
              aria-label={`Edit tugas ${item.assignmentTitle}`}
              title="Edit tugas"
              onClick={() => setEditLessonUid(item.lessonUid)}
            >
              <Pencil className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 shrink-0 rounded-sm border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/5"
              aria-label={`Hapus tugas ${item.assignmentTitle}`}
              title="Hapus tugas"
              onClick={() => setDeleteTarget(item)}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </>
        )}
      />

      <AssignmentFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        lessonOptions={lessonOptions}
        existingLessonUids={existingLessonUids}
        submitting={createMutation.isPending}
        onSubmit={handleCreate}
      />

      <AssignmentFormDialog
        open={editLessonUid !== null}
        onOpenChange={(open) => {
          if (!open) setEditLessonUid(null)
        }}
        mode="edit"
        lessonOptions={lessonOptions}
        editingLessonUid={editLessonUid}
        editingAssignment={editQuery.data ?? null}
        loadingAssignment={editQuery.isLoading}
        submitting={updateMutation.isPending}
        onSubmit={handleUpdate}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Hapus tugas?"
        description={`Tugas "${deleteTarget?.assignmentTitle ?? ''}" akan dihapus dari lesson "${deleteTarget?.lessonTitle ?? ''}". Data pengumpulan siswa ikut terpengaruh.`}
        confirmLabel="Hapus tugas"
        cancelLabel="Batal"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
