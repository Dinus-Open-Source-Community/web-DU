import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

type RenameModuleDialogProps = {
  open: boolean
  currentTitle: string
  onOpenChange: (open: boolean) => void
  onRename: (title: string) => void
}

export function RenameModuleDialog({
  open,
  currentTitle,
  onOpenChange,
  onRename,
}: RenameModuleDialogProps) {
  const [title, setTitle] = useState(currentTitle)

  useEffect(() => {
    if (open) {
      setTitle(currentTitle)
    }
  }, [open, currentTitle])

  const handleSubmit = () => {
    onRename(title.trim() || currentTitle)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Pencil className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900">
                Ubah nama modul
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Nama modul akan tampil di tab kurikulum.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="rename-module-title" className="text-slate-700">
            Nama modul
          </Label>
          <Input
            id="rename-module-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSubmit()
              }
            }}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button type="button" className="rounded-xl" onClick={handleSubmit}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
