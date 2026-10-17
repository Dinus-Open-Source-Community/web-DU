import { ArrowLeft, ClipboardList, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { AdminUnderlineTabs } from "@/components/admin/AdminUnderlineTabs";
import { PageHeader } from "@/components/shared/Header";
import { CourseAssignmentRosterTable } from "@/components/shared/course-detail-manage/CourseAssignmentRosterTable";
import { CourseDetailLottieEmpty } from "@/components/shared/course-detail-manage/CourseDetailLottieEmpty";
import { CourseDetailTabSectionIntro } from "@/components/shared/course-detail-manage/CourseDetailTabSectionIntro";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { CourseAssignmentRosterPageViewModel } from "@/lib/course-detail/course-assignment-roster-view-model";
import { isAdminStaffRole } from "@/lib/admin/staff-shell";
import { manageDetailLayout } from "@/lib/course-detail/manage-detail-layout";
import { dashboardPageStackClassName } from "@/lib/layout/page-layout";
import type { AssignmentRosterStatusFilter } from "@/lib/types/features/course-detail-assignments";
import { cn } from "@/lib/utils";

function rosterStatusEmptyTitle(filter: AssignmentRosterStatusFilter): string {
  switch (filter) {
    case "submitted":
      return "Belum ada siswa yang mengumpulkan tugas ini.";
    case "not_submitted":
      return "Semua siswa sudah mengumpulkan tugas ini.";
    default:
      return "Tidak ada data pengumpulan.";
  }
}

type CourseAssignmentRosterViewProps = {
  view: CourseAssignmentRosterPageViewModel;
};

const STATUS_FILTER_OPTIONS: Array<{
  value: AssignmentRosterStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Semua" },
  { value: "submitted", label: "Sudah kumpul" },
  { value: "not_submitted", label: "Belum kumpul" },
];

export function CourseAssignmentRosterView({
  view,
}: CourseAssignmentRosterViewProps) {
  const {
    role,
    lessonTitle,
    moduleTitle,
    assignment,
    isLoading,
    isError,
    errorMessage,
    searchQuery,
    onSearchQueryChange,
    statusFilter,
    onStatusFilterChange,
    rosterRows,
    rosterRowsForStatus,
    filteredRosterRows,
    backHref,
    buildSubmissionDetailHref,
  } = view;

  const submittedCount = rosterRows.filter(
    (row) => row.status === "submitted",
  ).length;
  const notSubmittedCount = rosterRows.length - submittedCount;
  const useAdminChrome = isAdminStaffRole(role);

  return (
    <div
      className={cn(
        dashboardPageStackClassName,
        "animate-in fade-in duration-500",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          className="mb-0 space-y-1.5"
          title={assignment?.title ?? lessonTitle}
          subtitle={`${moduleTitle} · Pantau status pengumpulan seluruh peserta kursus.`}
        />
        <Button
          asChild
          variant="outline"
          className={cn(manageDetailLayout.actionButton, "shrink-0 self-start sm:mt-1")}
        >
          <Link to={backHref}>
            <ArrowLeft className="mr-2 size-4 opacity-70" aria-hidden />
            Kembali
          </Link>
        </Button>
      </div>

      <div className={manageDetailLayout.statGrid}>
        <StatCard
          variant="kpi"
          label="Total peserta"
          value={isLoading ? "…" : rosterRows.length}
          className="h-full"
        />
        <StatCard
          variant="kpi"
          label="Sudah kumpul"
          value={isLoading ? "…" : submittedCount}
          accentClassName="border-l-emerald-500"
          className="h-full"
        />
        <StatCard
          variant="kpi"
          label="Belum kumpul"
          value={isLoading ? "…" : notSubmittedCount}
          accentClassName="border-l-amber-500"
          className="h-full"
        />
      </div>

      <section
        className={cn(
          manageDetailLayout.sectionCard,
          manageDetailLayout.sectionPadding,
        )}
      >
        <div className="mb-5 space-y-4">
          <CourseDetailTabSectionIntro
            icon={ClipboardList}
            title="Daftar pengumpulan"
            description="Filter berdasarkan status, cari nama siswa, lalu buka jawaban untuk dinilai."
          />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <AdminUnderlineTabs
              value={statusFilter}
              items={STATUS_FILTER_OPTIONS}
              onChange={onStatusFilterChange}
              ariaLabel="Filter status pengumpulan"
              className="w-full min-w-0 lg:w-auto"
            />

            <div className="w-full space-y-1.5 lg:max-w-sm">
              <Label htmlFor="roster-search" className="sr-only">
                Cari siswa
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="roster-search"
                  value={searchQuery}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                  placeholder="Nama siswa..."
                  className="h-10 border-ink-900/10 bg-paper-white pl-9 shadow-none"
                />
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={cn(manageDetailLayout.tableSurface, "space-y-3 p-4")}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage ?? "Gagal memuat data pengumpulan tugas."}
          </p>
        ) : !assignment ? (
          <CourseDetailLottieEmpty
            className={manageDetailLayout.tableSurface}
            title="Tugas tidak ditemukan untuk lesson ini."
          />
        ) : rosterRows.length === 0 ? (
          <CourseDetailLottieEmpty
            className={manageDetailLayout.tableSurface}
            title="Belum ada peserta terdaftar di kursus ini."
          />
        ) : rosterRowsForStatus.length === 0 ? (
          <CourseDetailLottieEmpty
            className={manageDetailLayout.tableSurface}
            title={rosterStatusEmptyTitle(statusFilter)}
          />
        ) : filteredRosterRows.length === 0 ? (
          <CourseDetailLottieEmpty
            className={manageDetailLayout.tableSurface}
            title="Tidak ada siswa yang cocok dengan pencarian."
          />
        ) : (
          <div className={cn(manageDetailLayout.tableSurface, "overflow-x-auto")}>
            <CourseAssignmentRosterTable
              rows={filteredRosterRows}
              buildSubmissionDetailHref={buildSubmissionDetailHref}
              adminStatusLabels={useAdminChrome}
            />
          </div>
        )}
      </section>
    </div>
  );
}
