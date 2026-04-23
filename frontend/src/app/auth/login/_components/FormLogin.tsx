'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { GitHubIcon, GoogleIcon, LogoDu } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { GlobalInput } from '@/components/ui/GlobalInput'
import { useAuth } from '@/providers/auth-provider'

export default function FormLogin() {
  const router = useRouter()
  const { signIn, startGoogleOAuth } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const { redirectPath } = await signIn(email, password)
      router.push(redirectPath)
      toast.success('Login berhasil')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login gagal')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 lg:items-start">
        <Link href="/" className="mb-2 flex items-center gap-2 lg:hidden">
          <LogoDu className="size-8 text-primary" />
          <span className="text-lg font-bold tracking-tight text-primary">Doscom University</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Masuk ke Akunmu</h1>
        <p className="text-sm text-slate-500">
          Belum punya akun?{' '}
          <Link href="/auth/register" className="font-semibold text-primary hover:underline">
            Daftar gratis
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl border-slate-200 text-sm font-medium shadow-none hover:bg-slate-50"
          onClick={startGoogleOAuth}
          disabled={isSubmitting}>
          <GoogleIcon className="mr-2 size-5" />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl border-slate-200 text-sm font-medium shadow-none hover:bg-slate-50"
          disabled={isSubmitting}>
          <GitHubIcon className="mr-2 size-5" />
          GitHub
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">atau dengan email</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <GlobalInput
          label="Email"
          placeholder="nama@email.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <div>
          <GlobalInput
            label="Password"
            placeholder="Masukkan password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="text-slate-400 transition-colors hover:text-slate-600"
                disabled={isSubmitting}>
                {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
              </button>
            }
          />
          <div className="mt-1.5 text-right">
            <Link href="/auth/forgot-password" className="text-xs font-semibold text-primary hover:underline">
              Lupa password?
            </Link>
          </div>
        </div>
        <Button
          type="submit"
          className="h-12 rounded-xl text-sm font-bold"
          disabled={isSubmitting}
          aria-busy={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </Button>
      </form>
    </div>
  )
}
