import { useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Link } from 'react-router-dom'
import { GlobalInput } from '../../components/shared/Input'
import { LogoDu } from '../../components/shared/icon'
import AuthLayout from '../../components/layouts/AuthLayouts'
import { forgotPasswordFormSchema, getValidationMessage } from '../../lib/validator'

export function ForgotPasswordPages() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validation = forgotPasswordFormSchema.safeParse({ email })
    if (!validation.success) {
      toast.error(getValidationMessage(validation.error, 'Email tidak valid'))
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-50">
            <CheckCircle2 className="size-8 text-emerald-500" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cek Email Kamu</h1>
            <p className="text-sm leading-relaxed text-slate-500">
              Kami telah mengirimkan link reset password ke <span className="font-semibold text-slate-700">{email}</span>. Silakan cek inbox atau folder spam kamu.
            </p>
          </div>
          <Button asChild variant="outline" className="h-11 rounded-xl border-slate-200 text-sm font-semibold shadow-none">
            <Link to="/auth/login" className="gap-2">
              <ArrowLeft className="size-4" />
              Kembali ke Login
            </Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout heading="Lupa Password?" subheading="Jangan khawatir. Kami akan mengirimkan link reset password ke email kamu.">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3 lg:items-start">
          <Link to="/" className="mb-2 flex items-center gap-2 lg:hidden">
            <LogoDu className="size-8 text-primary" />
            <span className="text-lg font-bold tracking-tight text-primary">Doscom University</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lupa Password</h1>
          <p className="text-sm leading-relaxed text-slate-500">Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mereset password kamu.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <GlobalInput label="Email" placeholder="nama@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="h-12 rounded-xl text-sm font-bold" disabled={!email.trim()}>
            Kirim Link Reset
          </Button>
        </form>

        <div className="text-center">
          <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="size-4" />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
