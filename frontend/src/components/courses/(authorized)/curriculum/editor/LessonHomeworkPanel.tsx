import { useEffect, useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import type { EditableLesson } from '@/lib/course-edit/types'
import { useHomeworkPanelController } from '@/hooks/use-homework-panel-controller'

import { AssignmentRulesSection } from './AssignmentRulesSection'
import { HomeworkInstructionSection } from './homework/HomeworkInstructionSection'
import { HomeworkPanelActionBar } from './homework/HomeworkPanelActionBar'
import { HomeworkSectionNav } from './homework/HomeworkSectionNav'
import type { HomeworkPanelSection } from '@/lib/course-edit/homework-panel.constants'
import { PanelTransition } from './PanelTransition'

type LessonHomeworkPanelProps = {
  lesson: EditableLesson
  isLoadingAssignment?: boolean
  onPatchAssignment: (
    lessonId: string,
    updater: (lesson: EditableLesson) => EditableLesson,
  ) => void
}

function HomeworkPanelSkeleton() {
  return (
    <section aria-label="Tugas lesson" className="space-y-4 py-4">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </section>
  )
}

export function LessonHomeworkPanel({
  lesson,
  isLoadingAssignment = false,
  onPatchAssignment,
}: LessonHomeworkPanelProps) {
  const [activeSection, setActiveSection] = useState<HomeworkPanelSection>('instruction')

  const controller = useHomeworkPanelController(lesson, onPatchAssignment)

  useEffect(() => {
    setActiveSection('instruction')
  }, [controller.lessonKey])

  if (isLoadingAssignment) {
    return <HomeworkPanelSkeleton />
  }

  return (
    <section aria-label="Tugas lesson" className="min-w-0">
      <HomeworkPanelActionBar
        status={controller.rules.status}
        canSaveAssignment={controller.canSaveAssignment}
      />

      <HomeworkSectionNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <PanelTransition panelKey={`${controller.lessonKey}-${activeSection}`} direction="bottom">
        {activeSection === 'instruction' ? (
          <HomeworkInstructionSection
            lessonKey={controller.lessonKey}
            homeworkTitle={controller.homeworkLesson.homeworkTitle ?? ''}
            homeworkType={controller.homeworkType}
            homeworkDescriptionHtml={
              controller.homeworkLesson.homeworkDescriptionHtml ?? '<p></p>'
            }
            homeworkQuiz={controller.homeworkLesson.homeworkQuiz!}
            onTitleChange={(title) => controller.patchHomework({ homeworkTitle: title })}
            onTypeChange={controller.setHomeworkType}
            onDescriptionChange={(html) =>
              controller.patchHomework({ homeworkDescriptionHtml: html })
            }
            onQuizChange={(quiz) => controller.patchHomework({ homeworkQuiz: quiz })}
            instructionAttachments={controller.rules.instructionAttachments}
            onInstructionAttachmentsChange={(attachments) =>
              controller.patchRules({ instructionAttachments: attachments })
            }
          />
        ) : (
          <AssignmentRulesSection
            rules={controller.rules}
            taskType={controller.homeworkType}
            onChange={controller.patchRules}
          />
        )}
      </PanelTransition>
    </section>
  )
}
