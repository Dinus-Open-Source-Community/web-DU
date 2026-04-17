'use client'

import { useState } from 'react'
import { UserPlus, Mail, User, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const roleOptions = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Content Moderator', label: 'Content Moderator' },
  { value: 'Support', label: 'Support' },
] as const

type RoleOption = (typeof roleOptions)[number]['value']

export function InviteAdminDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<RoleOption>('Admin')
  const [submitted, setSubmitted] = useState(false)

  const emailValid = /.+@.+\..+/.test(email)
  const nameValid = name.trim().length >= 2
  const canSubmit = emailValid && nameValid

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!canSubmit) return
    setOpen(false)
    setName('')
    setEmail('')
    setRole('Admin')
    setSubmitted(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-xl px-4">
          <UserPlus className="mr-1.5 h-4 w-4" aria-hidden />
          Undang Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Undang Administrator Baru</DialogTitle>
          <DialogDescription>
            Admin baru akan menerima tautan aktivasi melalui email untuk mengatur password-nya.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-name" className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" aria-hidden /> Nama lengkap
            </Label>
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Jane Doe"
              className={submitted && !nameValid ? 'border-rose-300 focus-visible:ring-rose-200' : ''}
            />
            {submitted && !nameValid && (
              <p className="text-xs text-rose-600">Nama minimal 2 karakter.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden /> Email
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@doscom.id"
              className={
                submitted && !emailValid ? 'border-rose-300 focus-visible:ring-rose-200' : ''
              }
            />
            {submitted && !emailValid && (
              <p className="text-xs text-rose-600">Format email tidak valid.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role" className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-slate-400" aria-hidden /> Role
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as RoleOption)}>
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Role menentukan akses modul yang dapat dibuka administrator ini.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" className="h-10 rounded-xl">
              Kirim undangan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
