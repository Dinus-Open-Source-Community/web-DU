import { memo } from 'react'
import { ArrowRight, FileText, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import type { CourseAssignmentOverviewItem } from '@/lib/course-detail/course-assignment-overview-presenter'
import { AdminTaskTypeLabel } from '@/lib/admin/status-label'
import { cn } from '@/lib/utils'

type CourseAssignmentOverviewRowProps = {
  item: CourseAssignmentOverviewItem
  adminStatusLabels?: boolean
  onPrefetchRoster?: () => void
}

function TaskTypeBadge({ taskType }: { taskType: CourseAssignmentOverviewItem['taskType'] }) {
  const isQuiz = taskType === 'quiz'
  const Icon = isQuiz ? HelpCircle : FileText

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
        isQuiz
          ? 'border-sky-500/30 bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800/40 dark:text-sky-300'
          : 'border-purple-500/30 bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:border-purple-800/40 dark:text-purple-300',
      )}
    >
      <Icon className="size-3" aria-hidden />
      {isQuiz ? 'Kuis' : 'Teks'}
    </span>
  )
}

function CourseAssignmentOverviewRowBase({
  item,
  adminStatusLabels = false,
  onPrefetchRoster,
}: CourseAssignmentOverviewRowProps) {
  return (
    <li className="px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {adminStatusLabels ? (
              <AdminTaskTypeLabel taskType={item.taskType} />
            ) : (
              <TaskTypeBadge taskType={item.taskType} />
            )}
            {item.pendingGradingCount > 0 ? (
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {item.pendingGradingCount} belum dinilai
              </span>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">{item.assignmentTitle}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Modul: {item.moduleTitle} · Lesson: {item.lessonTitle}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            {item.submissionCount} dari {item.totalStudents} siswa sudah mengumpulkan
          </p>
        </div>

        <div className="flex items-center">
          <Button
            asChild
            type="button"
            size="sm"
            variant="outline"
            className="h-9 shrink-0 rounded-sm"
            onMouseEnter={onPrefetchRoster}
            onFocus={onPrefetchRoster}
          >
            <Link to={item.submissionsHref}>
              Lihat pengumpulan
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </li>
  )
}

export const CourseAssignmentOverviewRow = memo(CourseAssignmentOverviewRowBase)
