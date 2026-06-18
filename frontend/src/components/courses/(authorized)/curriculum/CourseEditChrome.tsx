import { useState } from "react";
import { ChevronLeft } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isCoursePublished } from "@/lib/course-detail/publish-state";
import { resolveCourseProfiles } from "@/lib/course-detail/course-profile";
import type { CourseEditorTab } from "@/lib/course-edit/types";
import type { ICourseDetailItem } from "@/lib/types/course";
import type { CompactPane } from "@/lib/course-edit/viewport";

import { editLayout } from '@/lib/course-edit/edit-layout'

type CourseEditToolbarProps = {
  course: Partial<ICourseDetailItem>;
  isAdmin: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  editorTab: CourseEditorTab;
  showEditorActions: boolean;
  hasUnsavedLesson: boolean;
  hasUnsavedAssignment: boolean;
  canSaveAssignment: boolean;
  isCompact: boolean;
  compactPane: CompactPane;
  onBack: () => void;
  onPublish: () => void;
  onSaveLesson: () => void;
  onSaveAssignment: () => void;
  onDeleteLesson: () => void;
  onDeleteAssignment: () => void;
};

export function CourseEditToolbar({
  course,
  isAdmin,
  isSaving,
  isPublishing,
  editorTab,
  showEditorActions,
  hasUnsavedLesson,
  hasUnsavedAssignment,
  canSaveAssignment,
  isCompact,
  compactPane,
  onBack,
  onPublish,
  onSaveLesson,
  onSaveAssignment,
  onDeleteLesson,
  onDeleteAssignment,
}: CourseEditToolbarProps) {
  const published = isCoursePublished(course);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const hideActionsOnCompactEditor = isCompact && compactPane === "editor";
  const isHomeworkTab = editorTab === "homework";
  const hasUnsavedChanges = isHomeworkTab
    ? hasUnsavedAssignment
    : hasUnsavedLesson;
  const saveDisabled = isHomeworkTab
    ? isSaving || !hasUnsavedAssignment || !canSaveAssignment
    : isSaving || !hasUnsavedLesson;
  const hasMentor = resolveCourseProfiles(course).length > 0;

  const handleSave = () => {
    if (isHomeworkTab) {
      onSaveAssignment();
      return;
    }
    onSaveLesson();
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isHomeworkTab) {
      onDeleteAssignment();
    } else {
      onDeleteLesson();
    }
    setConfirmDeleteOpen(false);
  };

  return (
    <>
      <header
      className={`flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between ${editLayout.divider} pb-4 sm:pb-5`}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-ml-2 size-9 shrink-0 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={onBack}
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Button>
          <h1 className={editLayout.pageTitle}>{course.title}</h1>
          <Badge
            variant={published ? "coursePublished" : "courseDraft"}
            className="shrink-0"
          />
        </div>
        {course.subtitle && (
          <p className={`line-clamp-2 sm:truncate ${editLayout.body}`}>
            {course.subtitle}
          </p>
        )}
        {isCompact && compactPane === "outline" && (
          <p className={`pt-1 ${editLayout.body}`}>
            Pilih modul dan lesson untuk mulai mengedit konten kursus.
          </p>
        )}
      </div>

      {!hideActionsOnCompactEditor && showEditorActions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          {hasUnsavedChanges && (
            <span className="w-full text-sm font-medium text-amber-700 sm:w-auto">
              {isHomeworkTab ? "Tugas belum disimpan" : "Lesson belum disimpan"}
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`${editLayout.control} w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto`}
            disabled={isSaving}
            onClick={handleDelete}
          >
            {isHomeworkTab ? "Hapus tugas" : "Hapus lesson"}
          </Button>

          <Button
            type="button"
            size="sm"
            className={`${editLayout.control} w-full sm:w-auto`}
            disabled={saveDisabled}
            onClick={handleSave}
          >
            {isSaving
              ? "Menyimpan..."
              : isHomeworkTab
                ? "Simpan tugas"
                : "Simpan lesson"}
          </Button>

          {!published && isAdmin && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`${editLayout.control} w-full sm:w-auto`}
              disabled={isSaving || isPublishing || !hasMentor}
              onClick={onPublish}
              title={!hasMentor ? "Tambahkan mentor terlebih dahulu sebelum menerbitkan kursus" : undefined}
            >
              {isPublishing ? "Memproses..." : "Terbit"}
            </Button>
          )}
        </div>
      )}
    </header>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={isHomeworkTab ? "Hapus tugas lesson?" : "Hapus lesson ini?"}
        description={
          isHomeworkTab
            ? "Konfigurasi tugas dan aturan pengumpulan akan dihapus. Peserta tidak lagi bisa mengumpulkan."
            : "Konten dan tugas lesson akan dihapus dari kurikulum. Perubahan disimpan setelah Anda menekan Simpan."
        }
        confirmLabel={isHomeworkTab ? "Hapus tugas" : "Hapus"}
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
