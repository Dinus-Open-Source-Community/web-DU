import { ClipboardList, FileText, HelpCircle, Search } from "lucide-react";

import { AdminUnderlineTabs } from "@/components/admin/AdminUnderlineTabs";
import { isAdminStaffRole } from "@/lib/admin/staff-shell";
import { CourseAssignmentOverviewRow } from "@/components/shared/course-detail-manage/CourseAssignmentOverviewRow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { manageDetailLayout } from "@/lib/course-detail/manage-detail-layout";
import type { CourseDetailAssignmentsViewModel } from "@/lib/course-detail/course-detail-assignments-view-model";
import type { CourseAssignmentTaskFilter } from "@/lib/types/features/course-detail-assignments";
import { CourseDetailLottieEmpty } from "@/components/shared/course-detail-manage/CourseDetailLottieEmpty";
import { CourseDetailTabSectionIntro } from "@/components/shared/course-detail-manage/CourseDetailTabSectionIntro";
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
    role,
    isLoading,
    isHydratingSubmissions,
    isError,
    errorMessage,
    taskFilter,
    onTaskFilterChange,
    searchQuery,
    onSearchQueryChange,
    assignmentItems,
    itemsForTaskType,
    prefetchSubmissionRoster,
  } = view;

  const taskTypeLabel = taskFilter === "quiz" ? "kuis" : "teks";

  const showInitialSkeleton = isLoading
  const useAdminChrome = isAdminStaffRole(role)

  const taskFilterTabs = (
    <AdminUnderlineTabs
      value={taskFilter}
      items={TASK_FILTER_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        icon: <option.icon className="size-4" aria-hidden />,
      }))}
      onChange={onTaskFilterChange}
      ariaLabel="Filter jenis tugas"
      className="w-full min-w-0"
    />
  )

  return (
    <div className={cn(manageDetailLayout.sectionCard, manageDetailLayout.sectionPadding)}>
      <div className="mb-5 space-y-4">
        <CourseDetailTabSectionIntro
          icon={ClipboardList}
          title="Tugas kursus"
          description="Lihat lesson yang memiliki tugas, filter jenis, dan kelola pengumpulan siswa."
        />

        <div className="w-full space-y-1.5">
          <Label htmlFor="assignment-overview-search" className="sr-only">
            Cari tugas
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="assignment-overview-search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Judul tugas, lesson, atau modul..."
              className="h-10 border-ink-900/10 bg-paper-white pl-9 shadow-none"
            />
          </div>
        </div>

        {taskFilterTabs}
      </div>

      {showInitialSkeleton ? (
        <div className={cn(manageDetailLayout.tableSurface, 'space-y-3 p-4')}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage ?? "Gagal memuat data tugas."}
        </p>
      ) : itemsForTaskType.length === 0 ? (
        <CourseDetailLottieEmpty
          className={manageDetailLayout.tableSurface}
          title={`Belum ada tugas ${taskTypeLabel} pada kursus ini.`}
        />
      ) : assignmentItems.length === 0 ? (
        <CourseDetailLottieEmpty
          className={manageDetailLayout.tableSurface}
          title="Tidak ada tugas yang cocok dengan pencarian."
        />
      ) : (
        <div className={manageDetailLayout.tableSurface}>
          {isHydratingSubmissions ? (
            <p className="border-b border-border px-5 py-3 text-xs font-medium text-muted-foreground" aria-live="polite">
              Memuat ringkasan pengumpulan...
            </p>
          ) : null}
          <ul className="divide-y divide-border">
            {assignmentItems.map((item) => (
              <CourseAssignmentOverviewRow
                key={item.lessonUid}
                item={item}
                adminStatusLabels={useAdminChrome}
                onPrefetchRoster={() => prefetchSubmissionRoster(item.lessonUid)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
