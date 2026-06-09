import { FileText, HelpCircle, Search } from "lucide-react";

import { CourseAssignmentOverviewRow } from "@/components/shared/course-detail-manage/CourseAssignmentOverviewRow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { manageDetailLayout } from "@/lib/course-detail/manage-detail-layout";
import type { CourseDetailAssignmentsViewModel } from "@/lib/course-detail/course-detail-assignments-view-model";
import type { CourseAssignmentTaskFilter } from "@/lib/types/features/course-detail-assignments";
import { cn } from "@/lib/utils";

type CourseDetailAssignmentsTabProps = {
  view: CourseDetailAssignmentsViewModel;
};

const TASK_FILTER_OPTIONS: Array<{
  value: CourseAssignmentTaskFilter;
  label: string;
  icon: typeof HelpCircle;
}> = [
  { value: "quiz", label: "Kuis", icon: HelpCircle },
  { value: "text", label: "Teks", icon: FileText },
];

export function CourseDetailAssignmentsTab({
  view,
}: CourseDetailAssignmentsTabProps) {
  const {
    isLoading,
    isHydratingSubmissions,
    isError,
    errorMessage,
    taskFilter,
    onTaskFilterChange,
    searchQuery,
    onSearchQueryChange,
    assignmentItems,
    prefetchSubmissionRoster,
  } = view;

  const showInitialSkeleton = isLoading

  return (
    <div className={manageDetailLayout.flatPage}>
      <div className={manageDetailLayout.flatToolbar}>
        <div
          className={manageDetailLayout.segmentedControl}
          role="group"
          aria-label="Filter jenis tugas"
        >
          {TASK_FILTER_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = taskFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onTaskFilterChange(option.value)}
                className={cn(
                  manageDetailLayout.segmentedButton,
                  isActive
                    ? manageDetailLayout.segmentedButtonActive
                    : manageDetailLayout.segmentedButtonInactive,
                )}
              >
                <Icon className="size-4" aria-hidden />
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="w-full space-y-2 lg:max-w-sm">
          <Label htmlFor="assignment-overview-search">
            Cari tugas atau lesson
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              id="assignment-overview-search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Judul tugas, lesson, modul..."
              className="h-10 pl-9"
            />
          </div>
        </div>
      </div>

      {showInitialSkeleton ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className={manageDetailLayout.flatError} role="alert">
          {errorMessage ?? "Gagal memuat data tugas."}
        </p>
      ) : assignmentItems.length === 0 ? (
        <div className={manageDetailLayout.flatEmpty}>
          <p className="font-medium text-slate-700">
            Belum ada tugas {taskFilter === "quiz" ? "kuis" : "teks"} untuk
            filter ini.
          </p>
          <p className="mt-1">
            Tugas akan muncul setelah lesson memiliki assignment dan siswa mulai
            mengumpulkan.
          </p>
        </div>
      ) : (
        <>
          {isHydratingSubmissions ? (
            <p className="mb-3 text-xs text-slate-400" aria-live="polite">
              Memuat ringkasan pengumpulan...
            </p>
          ) : null}
          <ul className={manageDetailLayout.flatList}>
            {assignmentItems.map((item) => (
              <CourseAssignmentOverviewRow
                key={item.lessonUid}
                item={item}
                onPrefetchRoster={() => prefetchSubmissionRoster(item.lessonUid)}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
