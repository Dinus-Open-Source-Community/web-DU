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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CouponType } from '@/lib/types'

interface CouponFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialValue?: {
    code?: string
    type?: CouponType
    value?: number
    minPurchase?: number
    usageLimit?: number
    startsAt?: string
    endsAt?: string
  }
  onSubmit?: (payload: {
    code: string
    type: CouponType
    value: number
    minPurchase: number
    usageLimit: number
    startsAt: string
    endsAt: string
  }) => void
}

export function CouponFormDialog({
  open,
  onOpenChange,
  mode,
  initialValue,
  onSubmit,
}: CouponFormDialogProps) {
  const [code, setCode] = useState('')
  const [type, setType] = useState<CouponType>('percent')
  const [value, setValue] = useState('')
  const [minPurchase, setMinPurchase] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setCode(initialValue?.code ?? '')
      setType(initialValue?.type ?? 'percent')
      setValue(initialValue?.value ? String(initialValue.value) : '')
      setMinPurchase(initialValue?.minPurchase ? String(initialValue.minPurchase) : '')
      setUsageLimit(initialValue?.usageLimit ? String(initialValue.usageLimit) : '')
      setStartsAt(initialValue?.startsAt ?? '')
      setEndsAt(initialValue?.endsAt ?? '')
      setSubmitted(false)
    }
  }, [open, initialValue])

  const codeValid = code.trim().length >= 3
  const valueValid = Number(value) > 0
  const usageValid = Number(usageLimit) > 0
  const canSubmit = codeValid && valueValid && usageValid

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!canSubmit) return
    onSubmit?.({
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minPurchase: Number(minPurchase || 0),
      usageLimit: Number(usageLimit),
      startsAt,
      endsAt,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Buat Kupon Baru' : 'Edit Kupon'}</DialogTitle>
          <DialogDescription>
            Kupon memberi potongan otomatis saat checkout sesuai kriteria yang diatur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cpn-code">Kode kupon</Label>
              <Input
                id="cpn-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: BELAJAR25"
                className={submitted && !codeValid ? 'border-rose-300 focus-visible:ring-rose-200' : ''}
              />
              {submitted && !codeValid && (
                <p className="text-xs text-rose-600">Kode kupon minimal 3 karakter.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpn-type">Tipe diskon</Label>
              <Select value={type} onValueChange={(v) => setType(v as CouponType)}>
                <SelectTrigger id="cpn-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Persen (%)</SelectItem>
                  <SelectItem value="flat">Nominal (Rp)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpn-value">Nilai</Label>
              <Input
                id="cpn-value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'percent' ? '25' : '100000'}
                className={submitted && !valueValid ? 'border-rose-300 focus-visible:ring-rose-200' : ''}
              />
              {submitted && !valueValid && (
                <p className="text-xs text-rose-600">Nilai harus lebih besar dari 0.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpn-min">Minimal belanja</Label>
              <Input
                id="cpn-min"
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpn-limit">Batas penggunaan</Label>
              <Input
                id="cpn-limit"
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="1000"
                className={submitted && !usageValid ? 'border-rose-300 focus-visible:ring-rose-200' : ''}
              />
              {submitted && !usageValid && (
                <p className="text-xs text-rose-600">Batas penggunaan wajib diisi.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpn-start">Mulai</Label>
              <Input
                id="cpn-start"
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpn-end">Berakhir</Label>
              <Input
                id="cpn-end"
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
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
              {mode === 'create' ? 'Buat kupon' : 'Simpan perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
