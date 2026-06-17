import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { HomeworkRulesDraft } from '@/lib/types/lesson'
import { formatHomeworkRulesSummary } from '@/lib/course-edit/homework-rules'
import type { HomeworkTaskType, LessonAssignmentStatus } from '@/lib/types/lesson'
import { cn } from '@/lib/utils'

import { editLayout } from '@/lib/course-edit/edit-layout'
import { ASSIGNMENT_STATUS_META } from '@/lib/course-edit/homework-panel.constants'
import { AssignmentDeadlinePicker } from './homework/AssignmentDeadlinePicker'

const STATUS_OPTIONS: { value: LessonAssignmentStatus; label: string; hint: string }[] = [
  { value: 'DRAFT', label: 'Draft', hint: 'Belum terlihat oleh peserta' },
  { value: 'TERBIT', label: 'Terbit', hint: 'Peserta bisa mengerjakan' },
  { value: 'DITUTUP', label: 'Ditutup', hint: 'Pengumpulan ditutup' },
]

type AssignmentRulesSectionProps = {
  rules: HomeworkRulesDraft
  taskType: HomeworkTaskType
  onChange: (patch: Partial<HomeworkRulesDraft>) => void
}

function FieldGroup({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-4 border-t border-slate-200 pt-5 first:border-t-0 first:pt-0', className)}>
      <div className="flex items-start gap-2">
        {icon ? (
          <span className="mt-0.5 text-slate-400" aria-hidden>
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 space-y-0.5">
          <h4 className={editLayout.panelTitle}>{title}</h4>
          {description ? <p className={editLayout.meta}>{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}

function RuleToggleRow({
  id,
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
  className,
}: {
  id: string
  label: string
  description?: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex min-h-11 cursor-pointer items-start gap-3 py-2.5',
        'has-disabled:cursor-not-allowed has-disabled:opacity-50',
        className,
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}

function RulesSummaryLine({
  rules,
  taskType,
}: {
  rules: HomeworkRulesDraft
  taskType: HomeworkTaskType
}) {
  const { methodsLabel, resubmitLabel, attachmentLabel } = formatHomeworkRulesSummary(
    rules,
    taskType,
  )
  const deadlineLabel = rules.deadlineAt
    ? new Date(rules.deadlineAt).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Belum diatur'

  return (
    <p className={editLayout.meta}>
      {ASSIGNMENT_STATUS_META[rules.status].label}
      {' · '}
      Tenggat {deadlineLabel}
      {' · '}
      {taskType === 'text' ? methodsLabel : 'Kuis otomatis'}
      {' · '}
      {resubmitLabel}
      {' · '}
      {attachmentLabel}
    </p>
  )
}

export function AssignmentRulesSection({
  rules,
  taskType,
  onChange,
}: AssignmentRulesSectionProps) {
  const { maxAttempts } = formatHomeworkRulesSummary(rules, taskType)
  const showSubmissionMethods = taskType === 'text'

  return (
    <div aria-labelledby="assignment-rules-heading" className="space-y-5 py-5">
      <div className="space-y-2">
        <h3 id="assignment-rules-heading" className={editLayout.sectionTitle}>
          Aturan pengumpulan
        </h3>
        <p className={editLayout.body}>
          Atur kapan tugas terbuka, bagaimana peserta mengumpulkan, dan batas waktunya.
        </p>
        <RulesSummaryLine rules={rules} taskType={taskType} />
      </div>

      <FieldGroup title="Status dan tenggat">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="assignment-status" className={editLayout.fieldLabel}>
              Status tugas
            </label>
            <Select
              value={rules.status}
              onValueChange={(value) =>
                onChange({ status: value as LessonAssignmentStatus })
              }
            >
              <SelectTrigger id="assignment-status" className="w-full">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className={editLayout.meta}>
              {STATUS_OPTIONS.find((option) => option.value === rules.status)?.hint}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="assignment-deadline" className={editLayout.fieldLabel}>
              Tenggat waktu
            </label>
            <AssignmentDeadlinePicker
              id="assignment-deadline"
              value={rules.deadlineAt}
              onChange={(deadlineAt) => onChange({ deadlineAt })}
            />
          </div>
        </div>

        <RuleToggleRow
          id="auto-close-deadline"
          label="Tutup otomatis setelah tenggat"
          description="Status berubah ditutup saat melewati deadline."
          checked={rules.autoCloseAfterDeadline}
          onCheckedChange={(checked) => onChange({ autoCloseAfterDeadline: checked })}
        />
      </FieldGroup>

      {showSubmissionMethods ? (
        <FieldGroup
          title="Metode jawaban"
          description="Pilih minimal satu cara peserta mengirim jawaban."
        >
          <div className="divide-y divide-slate-200">
            <RuleToggleRow
              id="allow-rich-text"
              label="Rich text"
              description="Editor teks dengan format."
              checked={rules.allowRichTextSubmission}
              onCheckedChange={(checked) =>
                onChange({ allowRichTextSubmission: checked })
              }
            />
            <RuleToggleRow
              id="allow-file"
              label="Unggah file"
              description="Lampiran dokumen atau media."
              checked={rules.allowFileSubmission}
              onCheckedChange={(checked) =>
                onChange({
                  allowFileSubmission: checked,
                  requireFileDescription: checked
                    ? rules.requireFileDescription
                    : false,
                })
              }
            />
            <RuleToggleRow
              id="allow-plain-text"
              label="Teks biasa"
              description="Jawaban singkat tanpa format."
              checked={rules.allowPlainTextSubmission}
              onCheckedChange={(checked) =>
                onChange({ allowPlainTextSubmission: checked })
              }
            />
            <RuleToggleRow
              id="require-file-description"
              label="Deskripsi file wajib"
              description="Peserta harus menjelaskan lampiran."
              checked={rules.requireFileDescription}
              disabled={!rules.allowFileSubmission}
              onCheckedChange={(checked) =>
                onChange({ requireFileDescription: checked })
              }
            />
          </div>
        </FieldGroup>
      ) : (
        <p className={editLayout.body}>
          Kuis dinilai otomatis dari jawaban pilihan ganda. Metode unggah file tidak
          digunakan untuk tipe ini.
        </p>
      )}

      <FieldGroup
        title="Kebijakan ulang"
        description="Atur apakah peserta boleh mengirim ulang sebelum tenggat."
        icon={<RefreshCw className="size-4" />}
      >
        <div className="space-y-2">
          <RuleToggleRow
            id="allow-resubmit"
            label="Izinkan pengumpulan ulang"
            checked={rules.allowResubmit}
            className="py-1.5"
            onCheckedChange={(checked) =>
              onChange({
                allowResubmit: checked,
                maxResubmitCount: checked ? rules.maxResubmitCount ?? 1 : null,
              })
            }
          />

          {rules.allowResubmit ? (
            <div className="space-y-2 pl-7">
              <label htmlFor="max-resubmit-count" className={editLayout.fieldLabel}>
                Maks. pengumpulan ulang
              </label>
              <Input
                id="max-resubmit-count"
                type="number"
                min={1}
                max={20}
                value={rules.maxResubmitCount ?? ''}
                onChange={(event) => {
                  const parsed = Number.parseInt(event.target.value, 10)
                  onChange({
                    maxResubmitCount: Number.isNaN(parsed) ? null : Math.max(1, parsed),
                  })
                }}
                className="max-w-[8rem] rounded-lg"
              />
              <p className={editLayout.meta}>
                Total percobaan maksimal: {maxAttempts}x (1 awal + ulang).
              </p>
            </div>
          ) : null}
        </div>
      </FieldGroup>
    </div>
  )
}
