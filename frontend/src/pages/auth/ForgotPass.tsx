import { useState, type FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Message, resolveActionError } from '@/lib/Message'
import { Button } from '../../components/ui/button'
import { Link } from 'react-router-dom'
import { GlobalInput } from '../../components/shared/Input'
import { LogoDu } from '../../components/shared/icon'
import AuthLayout from '../../components/layouts/AuthLayouts'
import { parseForgotPasswordForm } from '../../lib/validator/auth'

export function ForgotPasswordPages() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      parseForgotPasswordForm({ email })
      toast.error(Message.auth.resetPasswordUnavailable)
    } catch (err) {
      toast.error(resolveActionError(err instanceof Error ? err : null, Message.auth.forgotPasswordInvalidEmail))
    } finally {
      setIsSubmitting(false)
    }
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
          <p className="text-sm leading-relaxed text-slate-500">
            Masukkan email yang terdaftar. Reset password akan aktif setelah endpoint backend tersedia.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <GlobalInput
            label="Email"
            placeholder="nama@email.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <Button type="submit" className="h-12 rounded-xl text-sm font-bold" disabled={!email.trim() || isSubmitting}>
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
