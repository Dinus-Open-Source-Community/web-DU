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

import { editLayout } from "./edit-layout";
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
  activeModuleId: string | null;
  activeLessonId: string | null;
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
        isActive
          ? cn(editLayout.lessonRowActive, "translate-x-0.5")
          : editLayout.lessonRowIdle,
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
              className="size-8 shrink-0"
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

      {lessons.length > 0 ? (
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
  activeModuleId,
  activeLessonId,
  onSelectModule,
  onSelectLesson,
  onOpenCreateModule,
  onAddLesson,
  onRenameModule,
  onDeleteModule,
}: CurriculumOutlineProps) {
  const resolvedModuleId = activeModuleId ?? modules[0]?.uid ?? null;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeLessonId || !scrollContainerRef.current) return;
    const activeRow = scrollContainerRef.current.querySelector(
      `[data-lesson-active="true"]`,
    );
    activeRow?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeLessonId]);

  return (
    <aside aria-label="Daftar kurikulum" className={editLayout.outlinePanel}>
      <div
        className={`flex items-center justify-between pb-3 ${editLayout.divider}`}
      >
        <h2 className={editLayout.panelTitle}>Kurikulum</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`${editLayout.control} gap-1.5 px-2.5`}
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
        <ScrollArea className="max-h-[min(40dvh,20rem)] flex-1 lg:max-h-[calc(100dvh-10rem)]">
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
