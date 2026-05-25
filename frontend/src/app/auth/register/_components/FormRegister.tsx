'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { GitHubIcon, GoogleIcon, LogoDu } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { GlobalInput } from '@/components/ui/GlobalInput'
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator'
import { useAuth } from '@/providers/auth-provider'

export default function FormRegister() {
  const router = useRouter()
  const { signUp, startGoogleOAuth } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordMismatch || isSubmitting) return

    setIsSubmitting(true)
    try {
      const { redirectPath } = await signUp(name, email, password)
      router.replace(redirectPath)
      router.refresh()
      toast.success('Registrasi berhasil')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registrasi gagal')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 lg:items-start">
        <Link href="/" className="mb-2 flex items-center gap-2 lg:hidden">
          <LogoDu className="size-8 text-primary" />
          <span className="text-lg font-bold tracking-tight text-primary">Doscom University</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buat Akun Baru</h1>
        <p className="text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" className="h-11 rounded-xl border-slate-200 text-sm font-medium shadow-none hover:bg-slate-50" onClick={startGoogleOAuth} disabled={isSubmitting}>
          <GoogleIcon className="mr-2 size-5" />
          Google
        </Button>
        <Button type="button" variant="outline" className="h-11 rounded-xl border-slate-200 text-sm font-medium shadow-none hover:bg-slate-50" disabled={isSubmitting}>
          <GitHubIcon className="mr-2 size-5" />
          GitHub
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">atau daftar dengan email</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <GlobalInput label="Nama Lengkap" placeholder="Nama lengkap" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} required />
          <GlobalInput label="Email" placeholder="nama@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} required />
        </div>

        <div>
          <GlobalInput
            label="Password"
            placeholder="Buat password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-slate-400 transition-colors hover:text-slate-600" disabled={isSubmitting}>
                {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
              </button>
            }
          />
          <PasswordStrengthIndicator password={password} className="mt-3" />
        </div>

        <div>
          <GlobalInput
            label="Konfirmasi Password"
            placeholder="Ulangi password"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            rightIcon={
              <button type="button" onClick={() => setShowConfirm((p) => !p)} className="text-slate-400 transition-colors hover:text-slate-600" disabled={isSubmitting}>
                {showConfirm ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
              </button>
            }
          />
          {passwordMismatch && <p className="mt-1.5 text-xs font-medium text-rose-500">Password tidak cocok</p>}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox id="terms" className="mt-0.5 size-4 border-slate-300" disabled={isSubmitting} />
          <label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed text-slate-600">
            Saya menyetujui{' '}
            <Link href="#" className="font-semibold text-primary hover:underline">
              Syarat & Ketentuan
            </Link>{' '}
            dan{' '}
            <Link href="#" className="font-semibold text-primary hover:underline">
              Kebijakan Privasi
            </Link>
          </label>
        </div>

        <Button type="submit" className="h-12 rounded-xl text-sm font-bold" disabled={passwordMismatch || isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Memproses...
            </>
          ) : (
            'Buat Akun'
          )}
        </Button>
      </form>
    </div>
  )
}
