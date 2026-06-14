import { format } from "date-fns";
import { id } from "date-fns/locale";
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
import type { ICourseAssignmentRosterRow } from "@/lib/types/features/course-detail-assignments";
import { cn } from "@/lib/utils";

type CourseAssignmentRosterTableProps = {
  rows: ICourseAssignmentRosterRow[];
  buildSubmissionDetailHref: (submissionUid: string) => string;
};

function SubmissionStatusBadge({
  status,
}: {
  status: ICourseAssignmentRosterRow["status"];
}) {
  const isSubmitted = status === "submitted";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        isSubmitted
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-600",
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
}: {
  row: ICourseAssignmentRosterRow;
}) {
  const submission = row.submission;
  if (!submission) {
    return <span className="text-sm text-slate-400">-</span>;
  }

  if (submission.taskType === "quiz") {
    if (submission.isAutoGraded) {
      return (
        <span className="text-sm font-medium text-slate-700">
          {submission.quizCorrectCount ?? 0}/{submission.quizQuestionCount ?? 0}{" "}
          benar
        </span>
      );
    }
    return <span className="text-sm text-slate-500">Kuis otomatis</span>;
  }

  if (submission.gradingStatus === "graded") {
    const score =
      submission.scorePercent !== null
        ? `${Math.round(submission.scorePercent)}%`
        : "-";
    const passedLabel = submission.passed ? "Lulus" : "Tidak lulus";

    return (
      <span className="text-sm font-medium text-slate-700">
        {score} · {passedLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      Menunggu penilaian
    </span>
  );
}

export function CourseAssignmentRosterTable({
  rows,
  buildSubmissionDetailHref,
}: CourseAssignmentRosterTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-200 hover:bg-transparent">
          <TableHead className="h-10 px-0 text-xs font-semibold text-slate-500">
            Siswa
          </TableHead>
          <TableHead className="h-10 px-0 text-xs font-semibold text-slate-500">
            Status
          </TableHead>
          <TableHead className="h-10 px-0 text-xs font-semibold text-slate-500">
            Waktu kumpul
          </TableHead>
          <TableHead className="h-10 px-0 text-xs font-semibold text-slate-500">
            Nilai
          </TableHead>
          <TableHead className="h-10 px-0 text-right text-xs font-semibold text-slate-500">
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
              className="border-slate-200"
            >
              <TableCell className="px-0 py-4">
                <div className="flex items-center gap-3">
                  {row.student.student_avatar_url ? (
                    <img
                      src={row.student.student_avatar_url}
                      alt={row.student.student_name}
                      className="size-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {Initials(row.student.student_name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {row.student.student_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Progress {Math.round(row.student.progress)}%
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-0 py-4">
                <SubmissionStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="px-0 py-4 text-sm text-slate-600">
                {submission?.submittedAt
                  ? format(
                      new Date(submission.submittedAt),
                      "d MMM yyyy HH:mm",
                      { locale: id },
                    )
                  : "-"}
              </TableCell>
              <TableCell className="px-0 py-4">
                <GradingStatusBadge row={row} />
              </TableCell>
              <TableCell className="px-0 py-4 text-right">
                {submission ? (
                  <Button
                    asChild
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-lg"
                  >
                    <Link to={buildSubmissionDetailHref(submission.uid)}>
                      Lihat jawaban
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">Belum ada jawaban</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
