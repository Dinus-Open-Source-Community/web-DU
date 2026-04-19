'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { GitHubIcon, GoogleIcon, LogoDu } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { GlobalInput } from '@/components/ui/GlobalInput'
import { GlobalSelect } from '@/components/ui/GlobalSelect'
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator'
import { setGuestSession } from '@/lib/auth/guest-session'
import { getActiveUser, ROLE_DASHBOARD_PATH } from '@/lib/data/dummyUsers'

export default function FormRegister() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordMismatch) return
    setGuestSession()
    const u = getActiveUser()
    router.push(ROLE_DASHBOARD_PATH[u.role])
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
        <Button type="button" variant="outline" className="h-11 rounded-xl border-slate-200 text-sm font-medium shadow-none hover:bg-slate-50">
          <GoogleIcon className="mr-2 size-5" />
          Google
        </Button>
        <Button type="button" variant="outline" className="h-11 rounded-xl border-slate-200 text-sm font-medium shadow-none hover:bg-slate-50">
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
          <GlobalInput label="Nama Lengkap" placeholder="Nama lengkap" type="text" />
          <GlobalSelect
            label="Jenis Kelamin"
            placeholder="Pilih"
            options={[
              { label: 'Laki-laki', value: 'male' },
              { label: 'Perempuan', value: 'female' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <GlobalInput label="Email" placeholder="nama@email.com" type="email" />
          <GlobalInput label="Tanggal Lahir" placeholder="DD/MM/YYYY" type="date" />
        </div>

        <div>
          <GlobalInput
            label="Password"
            placeholder="Buat password"
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
            placeholder="Ulangi password"
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

        <div className="flex items-start gap-2">
          <Checkbox id="terms" className="mt-0.5 size-4 border-slate-300" />
          <label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed text-slate-600">
            Saya menyetujui{' '}
            <Link href="#" className="font-semibold text-primary hover:underline">Syarat & Ketentuan</Link>
            {' '}dan{' '}
            <Link href="#" className="font-semibold text-primary hover:underline">Kebijakan Privasi</Link>
          </label>
        </div>

        <Button type="submit" className="h-12 rounded-xl text-sm font-bold" disabled={passwordMismatch}>
          Buat Akun
        </Button>
      </form>
    </div>
  )
}
