import { useEffect, useRef } from "react";
import {
  FileText,
  Film,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getModuleLessons } from "@/lib/course-curriculum";
import type { CourseEditNavigationActions } from "@/lib/course-edit/types";
import type { IModulesData } from "@/lib/types/module";
import { cn } from "@/lib/utils";

import { editLayout, type CurriculumOutlineLayout } from '@/lib/course-edit/edit-layout'
import { editMotion } from '@/lib/course-edit/edit-motion'

type CurriculumOutlineProps = Pick<
  CourseEditNavigationActions,
  | "onSelectModule"
  | "onSelectLesson"
  | "onOpenCreateModule"
  | "onAddLesson"
  | "onRenameModule"
  | "onDeleteModule"
> & {
  modules: IModulesData[];
  loadedModuleIds: Set<string>;
  loadingModuleId: string | null;
  activeModuleId: string | null;
  activeLessonId: string | null;
  layout?: CurriculumOutlineLayout;
};

function LessonTypeIcon({ type }: { type: string | undefined }) {
  if (type === "video") {
    return <Film className="mt-0.5 size-3.5 shrink-0 text-ink-400" aria-hidden />;
  }
  return <FileText className="mt-0.5 size-3.5 shrink-0 text-ink-400" aria-hidden />;
}

type LessonRowProps = {
  index: number;
  title: string;
  contentType: string | undefined;
  isActive: boolean;
  onSelect: () => void;
};

function LessonRow({
  index,
  title,
  contentType,
  isActive,
  onSelect,
}: LessonRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "true" : undefined}
      data-lesson-active={isActive ? "true" : undefined}
      className={cn(
        editLayout.lessonRow,
        editMotion.rowSelect,
        editMotion.reducedMotion,
        isActive ? editLayout.lessonRowActive : editLayout.lessonRowIdle,
      )}
    >
      <span className={cn(editLayout.meta, "pt-0.5")}>{index + 1}</span>
      <LessonTypeIcon type={contentType} />
      <span className="min-w-0 break-words text-pretty">{title}</span>
    </button>
  );
}

type ModuleGroupProps = {
  module: IModulesData;
  moduleIndex: number;
  activeLessonId: string | null;
  isLoaded: boolean;
  isLoading: boolean;
  onSelectModule: (moduleId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  onAddLesson: (moduleId: string) => void;
  onRenameModule: (moduleId: string) => void;
  onDeleteModule: (moduleId: string) => void;
  isActiveModule: boolean;
};

function ModuleGroup({
  module,
  moduleIndex,
  activeLessonId,
  isLoaded,
  isLoading,
  onSelectModule,
  onSelectLesson,
  onAddLesson,
  onRenameModule,
  onDeleteModule,
  isActiveModule,
}: ModuleGroupProps) {
  const lessons = getModuleLessons(module);

  return (
    <section
      aria-label={`Modul ${module.title}`}
      className={cn(
        editLayout.outlineSection,
        editMotion.outlineItem,
        editMotion.reducedMotion,
      )}
      style={{ animationDelay: `${Math.min(moduleIndex, 6) * 40}ms` }}
    >
      <div
        className={cn(
          editLayout.moduleRow,
          editMotion.reducedMotion,
          isActiveModule ? editLayout.moduleRowActive : editLayout.moduleRowIdle,
        )}
      >
        <button
          type="button"
          onClick={() => onSelectModule(module.uid)}
          className="min-w-0 flex-1 rounded-md px-1.5 py-1.5 text-left"
        >
          <p className={editLayout.moduleTitle}>Modul {moduleIndex + 1}</p>
          <p className={editLayout.moduleTitleText}>
            {module.title}
          </p>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={`${editLayout.iconButton} shrink-0 self-center`}
              aria-label={`Kelola modul ${module.title}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onRenameModule(module.uid)}>
              <Pencil className="size-4" />
              Ubah nama
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteModule(module.uid)}
            >
              <Trash2 className="size-4" />
              Hapus modul
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="space-y-2 px-3 py-2">
          <div className={cn(editLayout.skeleton, 'h-8')} />
          <div className={cn(editLayout.skeleton, 'h-8')} />
        </div>
      ) : isLoaded ? (
        lessons.length > 0 ? (
          <div className="space-y-0.5">
            {lessons.map((lesson, lessonIndex) => (
              <div
                key={lesson.uid}
                className={cn(editMotion.outlineItem, editMotion.reducedMotion)}
                style={{ animationDelay: `${Math.min(lessonIndex, 8) * 30}ms` }}
              >
                <LessonRow
                  index={lessonIndex}
                  title={lesson.title}
                  contentType={lesson.content_type}
                  isActive={lesson.uid === activeLessonId}
                  onSelect={() => onSelectLesson(lesson.uid)}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className={`px-3 py-2 ${editLayout.body}`}>Belum ada lesson.</p>
        )
      ) : (
        <p className={`px-3 py-2 ${editLayout.body}`}>
          Klik judul modul di atas untuk menampilkan daftar lesson di sini.
        </p>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-1 h-auto min-h-8 w-full justify-start gap-1.5 whitespace-normal px-3 py-2 text-left text-ink-600"
        onClick={() => onAddLesson(module.uid)}
      >
        <Plus className="size-3.5" />
        Tambah lesson
      </Button>
    </section>
  );
}

export function CurriculumOutline({
  modules,
  loadedModuleIds,
  loadingModuleId,
  activeModuleId,
  activeLessonId,
  layout = "sidebar",
  onSelectModule,
  onSelectLesson,
  onOpenCreateModule,
  onAddLesson,
  onRenameModule,
  onDeleteModule,
}: CurriculumOutlineProps) {
  const resolvedModuleId = activeModuleId ?? modules[0]?.uid ?? null;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFullLayout = layout === "full";

  useEffect(() => {
    if (!activeLessonId || !scrollContainerRef.current) return;
    const activeRow = scrollContainerRef.current.querySelector(
      `[data-lesson-active="true"]`,
    );
    activeRow?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeLessonId]);

  return (
    <aside
      aria-label="Daftar kurikulum"
      className={cn(
        isFullLayout ? editLayout.outlinePanelFull : editLayout.outlinePanel,
      )}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-3 ${editLayout.divider}`}
      >
        <div className="min-w-0 flex-1">
          <h2 className={editLayout.panelTitle}>Kurikulum</h2>
          {isFullLayout && (
            <p className={`mt-0.5 ${editLayout.body}`}>
              {modules.length} modul · ketuk lesson untuk mengedit
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`${editLayout.control} shrink-0 gap-1.5 px-2.5`}
          onClick={onOpenCreateModule}
        >
          <Plus className="size-3.5" />
          Modul
        </Button>
      </div>

      {modules.length === 0 ? (
        <div className="py-8 text-center">
          <p className={editLayout.body}>Belum ada modul.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`${editLayout.control} mt-4 gap-1.5`}
            onClick={onOpenCreateModule}
          >
            <Plus className="size-4" />
            Buat modul pertama
          </Button>
        </div>
      ) : (
        <ScrollArea
          className={cn(
            "min-h-0 min-w-0 flex-1",
            "[&_[data-slot=scroll-area-viewport]]:min-w-0 [&_[data-slot=scroll-area-viewport]>div]:!block [&_[data-slot=scroll-area-viewport]>div]:min-w-0",
            isFullLayout
              ? "min-h-[12rem]"
              : "max-h-[min(40dvh,20rem)] lg:max-h-[calc(100dvh-10rem)]",
          )}
        >
          <div
            ref={scrollContainerRef}
            className="min-w-0 pr-2"
          >
            {modules.map((module, index) => (
              <ModuleGroup
                key={module.uid}
                module={module}
                moduleIndex={index}
                activeLessonId={activeLessonId}
                isLoaded={loadedModuleIds.has(module.uid)}
                isLoading={loadingModuleId === module.uid}
                isActiveModule={module.uid === resolvedModuleId}
                onSelectModule={onSelectModule}
                onSelectLesson={onSelectLesson}
                onAddLesson={onAddLesson}
                onRenameModule={onRenameModule}
                onDeleteModule={onDeleteModule}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </aside>
  );
}
