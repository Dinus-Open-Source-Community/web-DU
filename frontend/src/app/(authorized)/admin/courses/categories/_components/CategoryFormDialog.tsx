'use client'

import { useEffect, useState } from 'react'

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
import { Textarea } from '@/components/ui/textarea'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialName?: string
  initialDescription?: string
  onSubmit?: (payload: { name: string; description: string }) => void
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  initialName = '',
  initialDescription = '',
  onSubmit,
}: CategoryFormDialogProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setName(initialName)
      setDescription(initialDescription)
      setSubmitted(false)
    }
  }, [open, initialName, initialDescription])

  const nameValid = name.trim().length >= 2
  const canSubmit = nameValid

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!canSubmit) return
    onSubmit?.({ name, description })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
          </DialogTitle>
          <DialogDescription>
            Kategori membantu siswa menemukan kursus berdasarkan bidang minat mereka.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nama kategori</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Product Management"
              className={submitted && !nameValid ? 'border-rose-300 focus-visible:ring-rose-200' : ''}
            />
            {submitted && !nameValid && (
              <p className="text-xs text-rose-600">Nama kategori minimal 2 karakter.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-desc">Deskripsi singkat (opsional)</Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan fokus kategori ini secara singkat."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="h-10 rounded-xl">
              {mode === 'create' ? 'Tambah kategori' : 'Simpan perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
