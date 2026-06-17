import { FileText, Film } from "lucide-react";

import { TiptapEditor } from "@/components/shared/TipTapEditor";
import { LessonVideoEditor } from "@/components/shared/LessonVideoEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { getLessonKey } from "@/lib/course-edit/mappers";
import type { EditableLesson } from "@/lib/course-edit/types";
import type { LessonDeliveryType } from "@/lib/types/lesson";

import { editLayout } from '@/lib/course-edit/edit-layout'
import { PanelTransition } from "./PanelTransition";
import { SegmentedControl } from "./SegmentedControl";

const DELIVERY_OPTIONS = [
  {
    value: "text" as const,
    label: "Teks",
    icon: <FileText className="size-3.5" aria-hidden />,
  },
  {
    value: "video" as const,
    label: "Video",
    icon: <Film className="size-3.5" aria-hidden />,
  },
];

type LessonContentPanelProps = {
  lesson: EditableLesson;
  showEditor: boolean;
  isLoadingDetail: boolean;
  onChangeDeliveryType: (type: LessonDeliveryType) => void;
  onPatchLesson: (
    lessonId: string,
    updater: (lesson: EditableLesson) => EditableLesson,
  ) => void;
};

function LessonEditorSkeleton() {
  return (
    <div
      className="space-y-3 py-2"
      aria-busy="true"
      aria-label="Memuat konten lesson"
    >
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export function LessonContentPanel({
  lesson,
  showEditor,
  isLoadingDetail,
  onChangeDeliveryType,
  onPatchLesson,
}: LessonContentPanelProps) {
  const lessonKey = getLessonKey(lesson);

  return (
    <section aria-label="Konten lesson" className="space-y-4 py-4 sm:py-5">
      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
        <p className={editLayout.fieldLabel}>Tipe konten lesson</p>
        <SegmentedControl
          value={lesson.contentType}
          options={DELIVERY_OPTIONS}
          onChange={(type) => onChangeDeliveryType(type)}
          ariaLabel="Pilih tipe konten lesson"
        />
      </div>

      {lesson.contentFormat && lesson.contentFormat !== "tiptap" && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Konten dari HTML mentah backend. Setelah diedit, format disimpan
          sebagai tiptap.
        </p>
      )}

      {isLoadingDetail && <LessonEditorSkeleton />}

      {(showEditor || !isLoadingDetail) && (
        <PanelTransition
          panelKey={`${lessonKey}-${lesson.contentType}`}
          direction="bottom"
        >
          {showEditor && lesson.contentType === "text" && (
            <TiptapEditor
              key={`${lessonKey}-text`}
              initialContent={lesson.contentHtml || "<p></p>"}
              onChange={(html: string) => {
                onPatchLesson(lessonKey, (current) => {
                  if (current.contentType !== "text") return current;
                  return {
                    ...current,
                    contentHtml: html,
                    contentFormat: "tiptap",
                  };
                });
              }}
            />
          )}

          {showEditor && lesson.contentType === "video" && (
            <LessonVideoEditor
              key={`${lessonKey}-video`}
              videoUrl={lesson.videoUrl}
              description={lesson.contentHtml ?? ""}
              onVideoUrlChange={(url: string) => {
                onPatchLesson(lessonKey, (current) => {
                  if (current.contentType !== "video") return current;
                  return { ...current, videoUrl: url };
                });
              }}
              onDescriptionChange={(html: string) => {
                onPatchLesson(lessonKey, (current) => {
                  if (current.contentType !== "video") return current;
                  return {
                    ...current,
                    contentHtml: html,
                    contentFormat: "tiptap",
                  };
                });
              }}
            />
          )}
        </PanelTransition>
      )}
    </section>
  );
}
