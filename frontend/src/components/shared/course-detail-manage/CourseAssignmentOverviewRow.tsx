import { memo } from 'react'
import { ArrowRight, FileText, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AssignmentSubmitterAvatarGroup } from '@/components/shared/course-detail-manage/AssignmentSubmitterAvatarGroup'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { CourseAssignmentOverviewItem } from '@/lib/course-detail/course-assignment-overview-presenter'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { cn } from '@/lib/utils'

type CourseAssignmentOverviewRowProps = {
  item: CourseAssignmentOverviewItem
  onPrefetchRoster?: () => void
}

function TaskTypeBadge({ taskType }: { taskType: CourseAssignmentOverviewItem['taskType'] }) {
  const isQuiz = taskType === 'quiz'
  const Icon = isQuiz ? HelpCircle : FileText

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
        isQuiz
          ? 'border-sky-200 bg-sky-50 text-sky-700'
          : 'border-violet-200 bg-violet-50 text-violet-700',
      )}
    >
      <Icon className="size-3" aria-hidden />
      {isQuiz ? 'Kuis' : 'Teks'}
    </span>
  )
}

function CourseAssignmentOverviewRowBase({
  item,
  onPrefetchRoster,
}: CourseAssignmentOverviewRowProps) {
  return (
    <li className={manageDetailLayout.flatListItem}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <TaskTypeBadge taskType={item.taskType} />
            {item.pendingGradingCount > 0 ? (
              <span className="text-xs font-medium text-amber-700">
                {item.pendingGradingCount} belum dinilai
              </span>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">{item.assignmentTitle}</p>
            <p className="mt-0.5 text-sm text-slate-500">
              {item.moduleTitle} - {item.lessonTitle}
            </p>
          </div>

          <p className="text-xs text-slate-400">
            {item.submissionCount}/{item.totalStudents} pengumpulan
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          {item.isParticipantsLoading ? (
            <div className="space-y-2" aria-hidden>
              <div className="flex -space-x-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="size-8 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-3 w-28" />
            </div>
          ) : (
            <AssignmentSubmitterAvatarGroup participants={item.participants} />
          )}
          <Button
            asChild
            type="button"
            size="sm"
            variant="outline"
            className="h-9 shrink-0 rounded-lg"
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
