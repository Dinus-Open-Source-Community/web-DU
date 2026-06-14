import { ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { CourseAssignmentRosterTable } from "@/components/shared/course-detail-manage/CourseAssignmentRosterTable";
import { CourseDetailSectionHeader } from "@/components/shared/course-detail-manage/CourseDetailSectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { CourseAssignmentRosterPageViewModel } from "@/lib/course-detail/course-assignment-roster-view-model";
import { manageDetailLayout } from "@/lib/course-detail/manage-detail-layout";
import type { AssignmentRosterStatusFilter } from "@/lib/types/features/course-detail-assignments";
import { cn } from "@/lib/utils";

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
    filteredRosterRows,
    backHref,
    buildSubmissionDetailHref,
  } = view;

  return (
    <div className={manageDetailLayout.flatPage}>
      <Button
        asChild
        type="button"
        variant="ghost"
        className="-ml-2 h-9 w-fit rounded-lg px-3 text-slate-600 hover:text-slate-900"
      >
        <Link to={backHref}>
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke daftar tugas
        </Link>
      </Button>

      <CourseDetailSectionHeader
        title={assignment?.title ?? lessonTitle}
        description={`${moduleTitle} · Pantau status pengumpulan seluruh peserta kursus.`}
      />

      <div className={manageDetailLayout.flatToolbar}>
        <div
          className={manageDetailLayout.segmentedControl}
          role="group"
          aria-label="Filter status pengumpulan"
        >
          {STATUS_FILTER_OPTIONS.map((option) => {
            const isActive = statusFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onStatusFilterChange(option.value)}
                className={cn(
                  manageDetailLayout.segmentedButton,
                  isActive
                    ? manageDetailLayout.segmentedButtonActive
                    : manageDetailLayout.segmentedButtonInactive,
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="w-full space-y-2 lg:max-w-sm">
          <Label htmlFor="roster-search">Cari siswa</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              id="roster-search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Nama siswa..."
              className="h-10 pl-9"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className={manageDetailLayout.flatError} role="alert">
          {errorMessage ?? "Gagal memuat data pengumpulan tugas."}
        </p>
      ) : !assignment ? (
        <div className={manageDetailLayout.flatEmpty}>
          <p className="font-medium text-slate-700">
            Tugas tidak ditemukan untuk lesson ini.
          </p>
        </div>
      ) : rosterRows.length === 0 ? (
        <div className={manageDetailLayout.flatEmpty}>
          <p className="font-medium text-slate-700">Belum ada peserta terdaftar.</p>
          <p className="mt-1">
            Daftar pengumpulan akan muncul setelah ada siswa yang enroll ke kursus
            ini.
          </p>
        </div>
      ) : filteredRosterRows.length === 0 ? (
        <div className={manageDetailLayout.flatEmpty}>
          <p className="font-medium text-slate-700">
            Tidak ada siswa yang cocok dengan filter.
          </p>
          <p className="mt-1">Coba ubah kata kunci atau status filter.</p>
        </div>
      ) : (
        <CourseAssignmentRosterTable
          rows={filteredRosterRows}
          buildSubmissionDetailHref={buildSubmissionDetailHref}
        />
      )}
    </div>
  );
}
