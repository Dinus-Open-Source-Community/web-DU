'use client'

import { useEffect, useState } from 'react'
import { KeyRound, Mail, AlertTriangle } from 'lucide-react'

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
import { cn } from '@/lib/utils'

interface ResetCredentialsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Nama pengguna yang dipilih — ditampilkan di deskripsi */
  userName?: string
  /** Email awal pengguna */
  initialEmail?: string
  onSubmit?: (payload: { email: string; password: string }) => void
}

export function ResetCredentialsDialog({
  open,
  onOpenChange,
  userName,
  initialEmail = '',
  onSubmit,
}: ResetCredentialsDialogProps) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setEmail(initialEmail)
      setPassword('')
      setSubmitted(false)
    }
  }, [open, initialEmail])

  const emailValid = /.+@.+\..+/.test(email)
  const passwordValid = password.length === 0 || password.length >= 8
  const canSubmit = emailValid && password.length >= 8

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (!canSubmit) return
    onSubmit?.({ email, password })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Email & Password</DialogTitle>
          <DialogDescription>
            {userName
              ? `Perbarui kredensial untuk ${userName}.`
              : 'Perbarui kredensial pengguna ini.'}{' '}
            Pengguna akan keluar dari semua sesi aktif.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden /> Email baru
            </Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className={cn(
                'h-10',
                submitted && !emailValid && 'border-rose-300 focus-visible:ring-rose-200'
              )}
            />
            {submitted && !emailValid && (
              <p className="text-xs text-rose-600">Format email tidak valid.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-password" className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-slate-400" aria-hidden /> Password baru
            </Label>
            <Input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className={cn(
                'h-10',
                ((submitted && password.length < 8) || !passwordValid) &&
                  'border-rose-300 focus-visible:ring-rose-200'
              )}
            />
            {submitted && password.length < 8 && (
              <p className="text-xs text-rose-600">Password minimal 8 karakter.</p>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-2.5 text-[12px] leading-relaxed text-amber-900">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              Perubahan ini akan tercatat di audit log dan pengguna akan menerima notifikasi email.
            </span>
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
              Simpan perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
