import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { courseMasterToFormValues } from '@/lib/course-master/mappers'
import type {
  CourseMasterFormMode,
  CourseMasterFormValues,
  CourseMasterItem,
  CourseMasterKind,
} from '@/lib/course-master/types'
import { COURSE_MASTER_LABELS, EMPTY_COURSE_MASTER_FORM } from '@/lib/course-master/types'
import { validateCourseMasterForm } from '@/lib/course-master/validation'
import { courseMasterLayout } from './course-master-layout'

type CourseMasterFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: CourseMasterKind
  mode: CourseMasterFormMode
  item?: CourseMasterItem | null
  submitting?: boolean
  onSubmitCreate: (values: CourseMasterFormValues) => Promise<void>
  onSubmitEdit: (values: CourseMasterFormValues) => Promise<void>
}

export function CourseMasterFormDialog({
  open,
  onOpenChange,
  kind,
  mode,
  item,
  submitting = false,
  onSubmitCreate,
  onSubmitEdit,
}: CourseMasterFormDialogProps) {
  const labels = COURSE_MASTER_LABELS[kind]
  const isEdit = mode === 'edit'
  const [values, setValues] = useState<CourseMasterFormValues>(EMPTY_COURSE_MASTER_FORM)

  const resetForm = useCallback(() => {
    setValues(courseMasterToFormValues(item))
  }, [item])

  useEffect(() => {
    if (!open) return
    resetForm()
  }, [open, resetForm])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validateCourseMasterForm(values)
    if (validationError) {
      toast.error(validationError)
      return
    }

    if (isEdit) {
      await onSubmitEdit(values)
      return
    }

    await onSubmitCreate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-slate-200 p-0">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {isEdit ? labels.editDialogTitle : labels.createDialogTitle}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-500">
              {labels.dialogDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div className={courseMasterLayout.fieldStack}>
              <Label htmlFor="course-master-name" className={courseMasterLayout.fieldLabel}>
                Nama {labels.singular}
              </Label>
              <Input
                id="course-master-name"
                value={values.name}
                onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                placeholder={`Contoh: ${kind === 'category' ? 'Web Development' : 'Bootcamp'}`}
                className={courseMasterLayout.input}
                maxLength={120}
                required
              />
            </div>

            <div className={courseMasterLayout.fieldStack}>
              <Label htmlFor="course-master-description" className={courseMasterLayout.fieldLabel}>
                Deskripsi
              </Label>
              <Textarea
                id="course-master-description"
                value={values.description}
                onChange={(event) =>
                  setValues((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Opsional. Jelaskan singkat penggunaan item ini."
                className={courseMasterLayout.textarea}
              />
              <p className={courseMasterLayout.fieldHint}>Tidak ditampilkan ke peserta, hanya untuk referensi admin.</p>
            </div>

            <div className={courseMasterLayout.activeRow}>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-900">Status aktif</p>
                <p className="text-xs leading-5 text-slate-500">
                  Nonaktifkan agar tidak muncul di form pembuatan kursus.
                </p>
              </div>
              <Checkbox
                checked={values.isActive}
                onCheckedChange={(checked) =>
                  setValues((current) => ({ ...current, isActive: checked === true }))
                }
                aria-label={`${labels.singular} aktif`}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-slate-200"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" className="rounded-xl px-5" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Menyimpan...
                </>
              ) : isEdit ? (
                'Simpan Perubahan'
              ) : (
                labels.createButton
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
