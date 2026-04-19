'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react'
import { LogoDu } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { GlobalInput } from '@/components/ui/GlobalInput'
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator'

export function FormResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50">
          <AlertTriangle className="size-8 text-amber-500" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Link Tidak Valid</h1>
          <p className="text-sm leading-relaxed text-slate-500">
            Link reset password ini tidak valid atau sudah kadaluarsa. Silakan minta link baru.
          </p>
        </div>
        <Button asChild className="h-11 rounded-xl text-sm font-bold">
          <Link href="/auth/forgot-password">Minta Link Baru</Link>
        </Button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-50">
          <CheckCircle2 className="size-8 text-emerald-500" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Password Berhasil Direset</h1>
          <p className="text-sm leading-relaxed text-slate-500">
            Password kamu telah berhasil diubah. Silakan masuk dengan password baru.
          </p>
        </div>
        <Button asChild className="h-11 rounded-xl text-sm font-bold">
          <Link href="/auth/login">Masuk Sekarang</Link>
        </Button>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordMismatch || !password) return
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 lg:items-start">
        <Link href="/" className="mb-2 flex items-center gap-2 lg:hidden">
          <LogoDu className="size-8 text-primary" />
          <span className="text-lg font-bold tracking-tight text-primary">Doscom University</span>
        </Link>
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <ShieldCheck className="size-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buat Password Baru</h1>
        <p className="text-sm leading-relaxed text-slate-500">
          Password baru harus berbeda dari password sebelumnya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <GlobalInput
            label="Password Baru"
            placeholder="Masukkan password baru"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-slate-400 transition-colors hover:text-slate-600">
                {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
              </button>
            }
          />
          <PasswordStrengthIndicator password={password} className="mt-3" />
        </div>

        <div>
          <GlobalInput
            label="Konfirmasi Password"
            placeholder="Ulangi password baru"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            rightIcon={
              <button type="button" onClick={() => setShowConfirm((p) => !p)} className="text-slate-400 transition-colors hover:text-slate-600">
                {showConfirm ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
              </button>
            }
          />
          {passwordMismatch && (
            <p className="mt-1.5 text-xs font-medium text-rose-500">Password tidak cocok</p>
          )}
        </div>

        <Button type="submit" className="h-12 rounded-xl text-sm font-bold" disabled={passwordMismatch || !password}>
          Reset Password
        </Button>
      </form>
    </div>
  )
}
