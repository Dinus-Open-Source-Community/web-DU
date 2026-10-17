import { useMemo, useState } from "react";
import { toast } from "sonner";

import { TiptapEditor } from "@/components/shared/TipTapEditor";
import { Button } from "@/components/ui/button";
import {
  getAssignmentDeadlineAt,
  getAssignmentSubmissionCapabilities,
} from "@/lib/lesson-assignment/assignment-rules";
import type { NormalizedQuiz } from "@/lib/lesson-assignment/quiz-payload";
import {
  validateAssignmentSubmissionDraft,
  type SubmitLessonAssignmentPayload,
} from "@/lib/lesson-assignment/submission-draft";
import type {
  LessonAssignmentSubmissionRecord,
  QuizAnswersMap,
} from "@/lib/lesson-assignment/types";
import type {
  LessonDetailAssignment,
  LessonDetailItem,
} from "@/lib/types/lesson";
import { cn } from "@/lib/utils";

import { AssignmentDeadlineTimer } from "./AssignmentDeadlineTimer";
import { AssignmentFileUploadField } from "./AssignmentFileUploadField";
import { AssignmentQuizPrompt } from "./AssignmentQuizPrompt";
import { AssignmentWorkInstructions } from "./AssignmentWorkInstructions";
import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type LessonAssignmentWorkProps = {
  lesson: LessonDetailItem;
  assignment: LessonDetailAssignment;
  submission: LessonAssignmentSubmissionRecord | null;
  quiz: NormalizedQuiz | null;
  theme: LessonThemeMode;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: SubmitLessonAssignmentPayload) => Promise<void>;
};

export function LessonAssignmentWork({
  assignment,
  submission,
  quiz,
  theme,
  isSubmitting,
  onCancel,
  onSubmit,
}: LessonAssignmentWorkProps) {
  const isDark = theme === "dark";
  const deadlineAt = getAssignmentDeadlineAt(assignment);
  const [plainText, setPlainText] = useState("");
  const [richTextHtml, setRichTextHtml] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswersMap>({});

  const submissionCapabilities = useMemo(
    () => getAssignmentSubmissionCapabilities(assignment),
    [assignment],
  );
  const showPlainTextInput = submissionCapabilities.allowPlainText;
  const showRichTextInput = submissionCapabilities.allowRichText;
  const showFileInput = submissionCapabilities.allowFile;
  const isQuiz = assignment.task_type === "quiz";
  const hasSubmissionMethods = submissionCapabilities.hasAnyMethod;

  const quizQuestionIds = useMemo(
    () => quiz?.questions.map((question) => question.id) ?? [],
    [quiz],
  );

  const canSubmitTextAssignment =
    hasSubmissionMethods &&
    (showPlainTextInput || showRichTextInput || showFileInput);

  async function handleSubmit() {
    const validation = validateAssignmentSubmissionDraft(
      assignment,
      {
        plainText,
        richTextHtml,
        file,
        fileDescription,
        quizAnswers,
      },
      quizQuestionIds,
      submission,
    );

    if (validation.ok === false) {
      toast.error(validation.message);
      return;
    }

    await onSubmit(validation.payload);
  }

  return (
    <main className="min-h-dvh px-4 pt-20 pb-28 sm:px-6 sm:pt-24 md:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p
                className={cn(
                  "text-xs font-semibold tracking-wide uppercase",
                  isDark ? "text-zinc-400" : "text-muted-foreground",
                )}
              >
                Pengerjaan {isQuiz ? "kuis" : "tugas"}
              </p>
              <h1
                className={cn(
                  "mt-1 text-2xl font-bold tracking-tight",
                  isDark ? "text-zinc-50" : "text-foreground",
                )}
              >
                {assignment.title}
              </h1>
            </div>
            <AssignmentDeadlineTimer
              deadlineAt={deadlineAt}
              status={assignment.status}
              theme={theme}
              className="shrink-0"
            />
          </div>
        </header>

        <AssignmentWorkInstructions assignment={assignment} theme={theme} />

        {isQuiz ? (
          <section className="space-y-8 border-t border-input pt-6">
            <h2
              className={cn(
                "text-sm font-semibold",
                isDark ? "text-zinc-200" : "text-foreground",
              )}
            >
              Soal
            </h2>

            {quiz?.questions.length ? (
              <div className="space-y-8">
                {quiz.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="space-y-4 border-b border-input pb-8 last:border-b-0 last:pb-0"
                  >
                    <AssignmentQuizPrompt
                      index={index}
                      promptHtml={question.promptHtml}
                      theme={theme}
                    />
                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const selected = quizAnswers[question.id] === option.id;
                        return (
                          <label
                            key={option.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                              selected
                                ? isDark
                                  ? "bg-primary/10 ring-primary/40 text-zinc-50 ring-1"
                                  : "bg-primary/5 text-foreground ring-1 ring-ring/30"
                                : isDark
                                  ? "hover:bg-zinc-900/60"
                                  : "hover:bg-muted",
                            )}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={selected}
                              onChange={() =>
                                setQuizAnswers((current) => ({
                                  ...current,
                                  [question.id]: option.id,
                                }))
                              }
                              className="accent-primary h-4 w-4"
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-zinc-400" : "text-muted-foreground",
                )}
              >
                Soal kuis belum tersedia. Silakan hubungi mentor atau coba lagi
                nanti.
              </p>
            )}
          </section>
        ) : !hasSubmissionMethods ? (
          <section className="border-t border-input pt-6">
            <p
              className={cn(
                "text-sm",
                isDark ? "text-zinc-400" : "text-muted-foreground",
              )}
            >
              Tugas ini belum memiliki metode pengumpulan yang aktif. Silakan
              hubungi mentor.
            </p>
          </section>
        ) : (
          <section className="space-y-6 border-t border-input pt-6">
            {showPlainTextInput ? (
              <div className="space-y-2">
                <label
                  htmlFor="assignment-answer"
                  className={cn(
                    "text-sm font-medium",
                    isDark ? "text-zinc-200" : "text-foreground",
                  )}
                >
                  Teks jawaban
                </label>
                <textarea
                  id="assignment-answer"
                  value={plainText}
                  onChange={(event) => setPlainText(event.target.value)}
                  rows={8}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-sm shadow-none outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-line-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
                    isDark
                      ? "border-zinc-800 bg-zinc-950 text-zinc-100"
                      : "border-input bg-card text-foreground",
                  )}
                  placeholder="Tulis jawaban tugas di sini..."
                />
              </div>
            ) : null}

            {showRichTextInput ? (
              <div className="space-y-2">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isDark ? "text-zinc-200" : "text-foreground",
                  )}
                >
                  {showPlainTextInput ? "Jawaban format rich text" : "Jawaban"}
                </p>
                <TiptapEditor
                  initialContent={richTextHtml}
                  onChange={setRichTextHtml}
                  placeholder="Tulis jawaban tugas di sini..."
                  variant="compact"
                  theme={theme}
                />
              </div>
            ) : null}

            {showFileInput ? (
              <AssignmentFileUploadField
                file={file}
                fileDescription={fileDescription}
                requireDescription={assignment.require_file_description}
                theme={theme}
                onFileChange={setFile}
                onDescriptionChange={setFileDescription}
              />
            ) : null}
          </section>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-input pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className={cn(
              'rounded-sm px-5',
              isDark &&
                'border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900 hover:text-zinc-50',
            )}
          >
            Kembali
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={
              isSubmitting ||
              (isQuiz && !quiz?.questions.length) ||
              (!isQuiz && !canSubmitTextAssignment)
            }
            className="rounded-sm px-5"
          >
            {isSubmitting ? "Mengumpulkan..." : "Kumpulkan"}
          </Button>
        </div>
      </div>
    </main>
  );
}
