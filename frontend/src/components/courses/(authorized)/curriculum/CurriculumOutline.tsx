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

import { editLayout, type CurriculumOutlineLayout } from "./edit-layout";
import { editMotion } from "./editor/edit-motion";

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
    return <Film className="size-3.5 shrink-0 text-slate-400" aria-hidden />;
  }
  return <FileText className="size-3.5 shrink-0 text-slate-400" aria-hidden />;
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
        "w-full",
        isActive ? editLayout.lessonRowActive : editLayout.lessonRowIdle,
      )}
    >
      <span className={editLayout.meta}>{index + 1}</span>
      <LessonTypeIcon type={contentType} />
      <span className="min-w-0 truncate">{title}</span>
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
        "py-3 first:pt-0",
        editMotion.outlineItem,
        editMotion.reducedMotion,
      )}
      style={{ animationDelay: `${Math.min(moduleIndex, 6) * 40}ms` }}
    >
      <div className="mb-1 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onSelectModule(module.uid)}
          className={cn(
            "min-w-0 flex-1 rounded-md px-2 py-1.5 text-left transition-[background-color,color,transform] duration-200 ease-out",
            editMotion.reducedMotion,
            isActiveModule ? "bg-slate-50" : "hover:bg-slate-50",
          )}
        >
          <p className={editLayout.moduleTitle}>Modul {moduleIndex + 1}</p>
          <p className="truncate text-sm font-medium text-slate-800">
            {module.title}
          </p>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={`${editLayout.iconButton} shrink-0`}
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
          <div className="h-8 animate-pulse rounded-md bg-slate-100" />
          <div className="h-8 animate-pulse rounded-md bg-slate-100" />
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
          Pilih modul untuk memuat daftar lesson.
        </p>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-1 h-8 w-full justify-start gap-1.5 px-3 text-slate-600"
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
        className={`flex items-center justify-between gap-3 pb-3 ${editLayout.divider}`}
      >
        <div className="min-w-0">
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
            isFullLayout
              ? "min-h-[12rem] flex-1"
              : "max-h-[min(40dvh,20rem)] flex-1 lg:max-h-[calc(100dvh-10rem)]",
          )}
        >
          <div
            ref={scrollContainerRef}
            className={`divide-y divide-slate-100 ${editLayout.divider}`}
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
