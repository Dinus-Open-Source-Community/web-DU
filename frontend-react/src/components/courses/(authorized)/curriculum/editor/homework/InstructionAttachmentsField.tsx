import { ExternalLink, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isValidInstructionAttachmentUrl } from '@/lib/course-edit/instruction-attachments'
import type { LessonAssignmentInstructionAttachment } from '@/lib/types/lesson'

import { editLayout } from '../../edit-layout'

type InstructionAttachmentsFieldProps = {
  attachments: LessonAssignmentInstructionAttachment[]
  onChange: (attachments: LessonAssignmentInstructionAttachment[]) => void
}

function createEmptyAttachment(): LessonAssignmentInstructionAttachment {
  return { name: '', url: '' }
}

export function InstructionAttachmentsField({
  attachments,
  onChange,
}: InstructionAttachmentsFieldProps) {
  const addAttachment = () => {
    onChange([...attachments, createEmptyAttachment()])
  }

  const updateAttachment = (
    index: number,
    patch: Partial<LessonAssignmentInstructionAttachment>,
  ) => {
    onChange(
      attachments.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    )
  }

  const removeAttachment = (index: number) => {
    onChange(attachments.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div className="space-y-4 border-t border-slate-200 pt-5">
      <div className="space-y-1">
        <h4 className={editLayout.panelTitle}>Lampiran instruksi</h4>
        <p className={editLayout.meta}>
          Opsional. File pendukung seperti PDF atau ZIP diakses peserta lewat URL
          publik atau path `/files/...`.
        </p>
      </div>

      {attachments.length === 0 ? (
        <p className={editLayout.body}>Belum ada lampiran.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {attachments.map((attachment, index) => {
            const urlIsValid = isValidInstructionAttachmentUrl(attachment.url)
            const previewHref = urlIsValid ? attachment.url.trim() : null

            return (
              <li key={`instruction-attachment-${index}`} className="space-y-3 py-4 first:pt-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800">
                    Lampiran {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`${editLayout.control} shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700`}
                    onClick={() => removeAttachment(index)}
                    aria-label={`Hapus lampiran ${index + 1}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Hapus
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <label
                      htmlFor={`instruction-attachment-name-${index}`}
                      className={editLayout.fieldLabel}
                    >
                      Nama file
                    </label>
                    <Input
                      id={`instruction-attachment-name-${index}`}
                      value={attachment.name}
                      onChange={(event) =>
                        updateAttachment(index, { name: event.target.value })
                      }
                      placeholder="Contoh: Panduan tugas.pdf"
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`instruction-attachment-url-${index}`}
                      className={editLayout.fieldLabel}
                    >
                      URL file
                    </label>
                    <Input
                      id={`instruction-attachment-url-${index}`}
                      value={attachment.url}
                      onChange={(event) =>
                        updateAttachment(index, { url: event.target.value })
                      }
                      placeholder="https://... atau /files/bucket/object"
                      className="rounded-lg"
                    />
                  </div>

                  {previewHref ? (
                    <a
                      href={previewHref}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5" aria-hidden />
                      Pratinjau link
                    </a>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`${editLayout.control} gap-1.5`}
        onClick={addAttachment}
      >
        <Plus className="size-3.5" aria-hidden />
        Tambah lampiran
      </Button>
    </div>
  )
}
