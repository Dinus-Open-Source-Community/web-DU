import type { LessonAssignmentStatus } from "@/lib/types/lesson";

import { editLayout } from '@/lib/course-edit/edit-layout'

type HomeworkPanelActionBarProps = {
  status: LessonAssignmentStatus;
  canSaveAssignment: boolean;
};

export function HomeworkPanelActionBar({
  canSaveAssignment,
}: HomeworkPanelActionBarProps) {
  return (
    <div className="sticky top-0 z-10 -mx-1 bg-white/95 px-1 py-3 backdrop-blur-sm supports-backdrop-filter:bg-white/90">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {!canSaveAssignment ? (
          <span
            className={`${editLayout.body} text-xs font-medium text-amber-700`}
          >
            Simpan lesson dulu
          </span>
        ) : null}
      </div>
    </div>
  );
}
