import { FileText, ListChecks } from 'lucide-react'

import { LessonQuizEditor } from '@/components/shared/LessonQuizEditor'
import { TiptapEditor } from '@/components/shared/TipTapEditor'
import { Input } from '@/components/ui/input'
import type { EditableLesson } from '@/lib/course-edit/types'
import type {
  HomeworkTaskType,
  LessonAssignmentInstructionAttachment,
} from '@/lib/types/lesson'

import { editLayout } from '@/lib/course-edit/edit-layout'
import { InstructionAttachmentsField } from './InstructionAttachmentsField'
import { PanelTransition } from '../PanelTransition'
import { SegmentedControl } from '../SegmentedControl'

const HOMEWORK_TYPE_OPTIONS = [
  {
    value: 'text' as const,
    label: 'Teks',
    icon: <FileText className="size-3.5" aria-hidden />,
  },
  {
    value: 'quiz' as const,
    label: 'Quiz',
    icon: <ListChecks className="size-3.5" aria-hidden />,
  },
]

type HomeworkInstructionSectionProps = {
  lessonKey: string
  homeworkTitle: string
  homeworkType: HomeworkTaskType
  homeworkDescriptionHtml: string
  homeworkQuiz: NonNullable<EditableLesson['homeworkQuiz']>
  instructionAttachments: LessonAssignmentInstructionAttachment[]
  onTitleChange: (title: string) => void
  onTypeChange: (type: HomeworkTaskType) => void
  onDescriptionChange: (html: string) => void
  onQuizChange: (quiz: NonNullable<EditableLesson['homeworkQuiz']>) => void
  onInstructionAttachmentsChange: (
    attachments: LessonAssignmentInstructionAttachment[],
  ) => void
}

export function HomeworkInstructionSection({
  lessonKey,
  homeworkTitle,
  homeworkType,
  homeworkDescriptionHtml,
  homeworkQuiz,
  instructionAttachments,
  onTitleChange,
  onTypeChange,
  onDescriptionChange,
  onQuizChange,
  onInstructionAttachmentsChange,
}: HomeworkInstructionSectionProps) {
  return (
    <div className="space-y-5 py-5">
      <div className="space-y-2">
        <label htmlFor="homework-title" className={editLayout.fieldLabel}>
          Judul tugas
        </label>
        <Input
          id="homework-title"
          value={homeworkTitle}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Contoh: Refleksi modul 1"
          className="rounded-lg"
        />
        <p className={editLayout.meta}>
          Judul ini ditampilkan ke peserta di halaman tugas.
        </p>
      </div>

      <div className="space-y-2">
        <p className={editLayout.fieldLabel}>Tipe tugas</p>
        <SegmentedControl
          value={homeworkType}
          options={HOMEWORK_TYPE_OPTIONS}
          onChange={onTypeChange}
          ariaLabel="Pilih tipe tugas lesson"
        />
      </div>

      <PanelTransition panelKey={`${lessonKey}-${homeworkType}-content`} direction="bottom">
        <div className="space-y-2">
          <p className={editLayout.fieldLabel}>
            {homeworkType === 'text' ? 'Instruksi tugas' : 'Soal quiz'}
          </p>
          {homeworkType === 'text' ? (
            <TiptapEditor
              key={`${lessonKey}-homework-text`}
              variant="compact"
              initialContent={homeworkDescriptionHtml}
              onChange={onDescriptionChange}
              placeholder="Contoh: Buat ringkasan 200 kata dari materi lesson ini."
            />
          ) : (
            <LessonQuizEditor
              key={`${lessonKey}-homework-quiz`}
              quiz={homeworkQuiz}
              onChange={onQuizChange}
            />
          )}
        </div>
      </PanelTransition>

      <InstructionAttachmentsField
        attachments={instructionAttachments}
        onChange={onInstructionAttachmentsChange}
      />
    </div>
  )
}
