import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AdminStatusLabel } from "@/lib/admin/status-label";
import { ArrowRight, CheckCircle2, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Initials } from "@/lib/func/func";
import { manageDetailLayout } from "@/lib/course-detail/manage-detail-layout";
import type { ICourseAssignmentRosterRow } from "@/lib/types/features/course-detail-assignments";
import { cn } from "@/lib/utils";

type CourseAssignmentRosterTableProps = {
  rows: ICourseAssignmentRosterRow[];
  buildSubmissionDetailHref: (submissionUid: string) => string;
  adminStatusLabels?: boolean;
};

function SubmissionStatusBadge({
  status,
  adminStatusLabels = false,
}: {
  status: ICourseAssignmentRosterRow["status"];
  adminStatusLabels?: boolean;
}) {
  const isSubmitted = status === "submitted";

  if (adminStatusLabels) {
    return (
      <AdminStatusLabel tone={isSubmitted ? "success" : "neutral"}>
        {isSubmitted ? "Sudah kumpul" : "Belum kumpul"}
      </AdminStatusLabel>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        isSubmitted
          ? "border-emerald-200/80 bg-emerald-50 text-emerald-800"
          : "border-line-light bg-paper-paper text-ink-600",
      )}
    >
      {isSubmitted ? (
        <CheckCircle2 className="size-3.5" aria-hidden />
      ) : (
        <UserX className="size-3.5" aria-hidden />
      )}
      {isSubmitted ? "Sudah kumpul" : "Belum kumpul"}
    </span>
  );
}

function GradingStatusBadge({
  row,
  adminStatusLabels = false,
}: {
  row: ICourseAssignmentRosterRow;
  adminStatusLabels?: boolean;
}) {
  const submission = row.submission;
  if (!submission) {
    return <span className="text-sm text-ink-400">-</span>;
  }

  if (submission.taskType === "quiz") {
    if (submission.isAutoGraded) {
      return (
        <span className="text-sm font-medium text-ink-900">
          {submission.quizCorrectCount ?? 0}/{submission.quizQuestionCount ?? 0}{" "}
          benar
        </span>
      );
    }
    return <span className="text-sm text-ink-500">Kuis otomatis</span>;
  }

  if (submission.gradingStatus === "graded") {
    const score =
      submission.scorePercent !== null
        ? `${Math.round(submission.scorePercent)}%`
        : "-";
    const passedLabel = submission.passed ? "Lulus" : "Tidak lulus";

    return (
      <span className="text-sm font-medium text-ink-900">
        {score} · {passedLabel}
      </span>
    );
  }

  if (adminStatusLabels) {
    return <AdminStatusLabel tone="warning">Menunggu penilaian</AdminStatusLabel>;
  }

  return (
    <span className="inline-flex items-center rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
      Menunggu penilaian
    </span>
  );
}

export function CourseAssignmentRosterTable({
  rows,
  buildSubmissionDetailHref,
  adminStatusLabels = false,
}: CourseAssignmentRosterTableProps) {
  return (
    <Table className="min-w-[760px] text-left text-sm">
      <TableHeader>
        <TableRow className={manageDetailLayout.tableHeaderRow}>
          <TableHead className={cn("h-10 px-5 py-3", manageDetailLayout.tableHead)}>
            Siswa
          </TableHead>
          <TableHead className={cn("h-10 px-5 py-3", manageDetailLayout.tableHead)}>
            Status
          </TableHead>
          <TableHead className={cn("h-10 px-5 py-3", manageDetailLayout.tableHead)}>
            Waktu kumpul
          </TableHead>
          <TableHead className={cn("h-10 px-5 py-3", manageDetailLayout.tableHead)}>
            Nilai
          </TableHead>
          <TableHead
            className={cn("h-10 px-5 py-3 text-right", manageDetailLayout.tableHead)}
          >
            Aksi
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const submission = row.submission;

          return (
            <TableRow
              key={row.student.enrollment_uid}
              className={manageDetailLayout.tableBodyRow}
            >
              <TableCell className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {row.student.student_avatar_url ? (
                    <img
                      src={row.student.student_avatar_url}
                      alt={row.student.student_name}
                      className="size-9 rounded-full border border-ink-900/10 object-cover"
                    />
                  ) : (
                    <div className="flex size-9 items-center justify-center rounded-full border border-ink-900/10 bg-paper-paper text-xs font-semibold text-ink-600">
                      {Initials(row.student.student_name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {row.student.student_name}
                    </p>
                    <p className="text-xs text-ink-500">
                      Progress {Math.round(row.student.progress)}%
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-5 py-4">
                <SubmissionStatusBadge status={row.status} adminStatusLabels={adminStatusLabels} />
              </TableCell>
              <TableCell className="px-5 py-4 text-sm text-ink-600">
                {submission?.submittedAt
                  ? format(
                      new Date(submission.submittedAt),
                      "d MMM yyyy HH:mm",
                      { locale: id },
                    )
                  : "-"}
              </TableCell>
              <TableCell className="px-5 py-4">
                <GradingStatusBadge row={row} adminStatusLabels={adminStatusLabels} />
              </TableCell>
              <TableCell className="px-5 py-4 text-right">
                {submission ? (
                  <Button
                    asChild
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 shrink-0 rounded-sm border-ink-900/10 shadow-none"
                  >
                    <Link to={buildSubmissionDetailHref(submission.uid)}>
                      Lihat jawaban
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </Button>
                ) : (
                  <span className="text-xs text-ink-400">Belum ada jawaban</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
