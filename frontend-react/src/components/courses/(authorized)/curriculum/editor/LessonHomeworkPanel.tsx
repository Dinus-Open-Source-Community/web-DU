import { FileText, ListChecks } from "lucide-react";

import { LessonQuizEditor } from "@/components/shared/LessonQuizEditor";
import { TiptapEditor } from "@/components/shared/TipTapEditor";
import {
  applyHomeworkPatch,
  ensureHomeworkDefaults,
} from "@/lib/course-edit/homework";
import { getLessonKey } from "@/lib/course-edit/mappers";
import type { EditableLesson } from "@/lib/course-edit/types";
import type { HomeworkTaskType } from "@/lib/types/lesson";

import { editLayout } from "../edit-layout";
import { PanelTransition } from "./PanelTransition";
import { SegmentedControl } from "./SegmentedControl";

const HOMEWORK_TYPE_OPTIONS = [
  {
    value: "text" as const,
    label: "Teks",
    icon: <FileText className="size-3.5" aria-hidden />,
  },
  {
    value: "quiz" as const,
    label: "Quiz",
    icon: <ListChecks className="size-3.5" aria-hidden />,
  },
];

type LessonHomeworkPanelProps = {
  lesson: EditableLesson;
  onPatchLesson: (
    lessonId: string,
    updater: (lesson: EditableLesson) => EditableLesson,
  ) => void;
};

export function LessonHomeworkPanel({
  lesson,
  onPatchLesson,
}: LessonHomeworkPanelProps) {
  const lessonKey = getLessonKey(lesson);
  const homeworkLesson = ensureHomeworkDefaults(lesson);
  const homeworkType = homeworkLesson.homeworkType ?? "text";

  const patchHomework = (patch: Parameters<typeof applyHomeworkPatch>[1]) => {
    onPatchLesson(lessonKey, (current) => applyHomeworkPatch(current, patch));
  };

  const setHomeworkType = (type: HomeworkTaskType) => {
    patchHomework({ homeworkType: type });
  };

  return (
    <section aria-label="Tugas lesson" className="space-y-5 py-6">
      <div className="space-y-1.5">
        <p className={editLayout.fieldLabel}>Tipe tugas</p>
        <SegmentedControl
          value={homeworkType}
          options={HOMEWORK_TYPE_OPTIONS}
          onChange={setHomeworkType}
          ariaLabel="Pilih tipe tugas lesson"
        />
      </div>

      <PanelTransition
        panelKey={`${lessonKey}-${homeworkType}`}
        direction="bottom"
      >
        {homeworkType === "text" ? (
          <div className="space-y-2">
            <TiptapEditor
              key={`${lessonKey}-homework-text`}
              variant="compact"
              initialContent={
                homeworkLesson.homeworkDescriptionHtml ?? "<p></p>"
              }
              onChange={(html: string) => {
                patchHomework({ homeworkDescriptionHtml: html });
              }}
              placeholder="Contoh: Buat ringkasan 200 kata dari materi lesson ini."
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className={editLayout.fieldLabel}>Soal quiz</p>
            <LessonQuizEditor
              key={`${lessonKey}-homework-quiz`}
              quiz={homeworkLesson.homeworkQuiz!}
              onChange={(quiz) => {
                patchHomework({ homeworkQuiz: quiz });
              }}
            />
          </div>
        )}
      </PanelTransition>
    </section>
  );
}
