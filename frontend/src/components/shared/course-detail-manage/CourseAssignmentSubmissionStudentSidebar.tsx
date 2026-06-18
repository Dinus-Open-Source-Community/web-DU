import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Initials } from "@/lib/func/func";
import type { ICourseAssignmentRosterRow } from "@/lib/types/features/course-detail-assignments";
import { cn } from "@/lib/utils";

type CourseAssignmentSubmissionStudentSidebarProps = {
  rows: ICourseAssignmentRosterRow[];
  activeSubmissionUid: string | null;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  buildSubmissionDetailHref: (submissionUid: string) => string;
  isLoading?: boolean;
};

export function CourseAssignmentSubmissionStudentSidebar({
  rows,
  activeSubmissionUid,
  searchQuery,
  onSearchQueryChange,
  buildSubmissionDetailHref,
  isLoading = false,
}: CourseAssignmentSubmissionStudentSidebarProps) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col md:w-80 lg:w-96">
      <div className="space-y-2 border-b border-slate-200 px-4 py-4">
        <p className="text-sm font-semibold text-slate-900">Daftar siswa</p>
        <Label htmlFor="submission-sidebar-search" className="sr-only">
          Cari siswa
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            id="submission-sidebar-search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Cari siswa..."
            className="h-9 bg-white pl-9"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Tidak ada siswa yang cocok.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {rows.map((row) => {
              const submission = row.submission;
              const isActive = submission?.uid === activeSubmissionUid;
              const isClickable = row.status === "submitted" && submission;

              const content = (
                <>
                  {row.student.student_avatar_url ? (
                    <img
                      src={row.student.student_avatar_url}
                      alt={row.student.student_name}
                      className="size-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                      {Initials(row.student.student_name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {row.student.student_name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {submission
                        ? format(
                            new Date(submission.submittedAt),
                            "d MMM yyyy HH:mm",
                            { locale: id },
                          )
                        : "Belum mengumpulkan"}
                    </p>
                  </div>
                </>
              );

              if (!isClickable) {
                return (
                  <li key={row.student.enrollment_uid}>
                    <div className="flex items-center gap-3 px-4 py-3 text-slate-500">
                      {content}
                    </div>
                  </li>
                );
              }

              return (
                <li key={row.student.enrollment_uid}>
                  <Link
                    to={buildSubmissionDetailHref(submission.uid)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors",
                      isActive
                        ? "bg-slate-50 text-slate-900 shadow-[inset_3px_0_0_0_var(--color-primary)]"
                        : "hover:bg-slate-50/80",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {content}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
