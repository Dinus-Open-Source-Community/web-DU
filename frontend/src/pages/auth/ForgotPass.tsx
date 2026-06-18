import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { AuthFormPanel } from '@/components/auth/AuthFormPanel'
import { AuthPageHeader } from '@/components/auth/AuthPageHeader'
import { authInputClassName, authSubmitButtonClassName } from '@/components/auth/constants'
import { GlobalInput } from '@/components/shared/Input'
import { Button } from '@/components/ui/button'
import AuthLayout from '@/components/layouts/AuthLayouts'
import { Message, resolveActionError } from '@/lib/Message'
import { parseForgotPasswordForm } from '@/lib/validator/auth'

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
      toast.error(
        resolveActionError(
          err instanceof Error ? err : null,
          Message.auth.forgotPasswordInvalidEmail,
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      heading="Lupa password?"
      subheading="Jangan khawatir. Kami akan mengirimkan tautan reset password ke email kamu."
    >
      <AuthFormPanel>
        <AuthPageHeader
          title="Reset password"
          description="Masukkan email yang terdaftar. Reset password akan aktif setelah endpoint backend tersedia."
          backHref="/auth/login"
          backLabel="Kembali ke login"
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          <GlobalInput
            label="Email"
            placeholder="nama@email.com"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
            className={authInputClassName}
          />

          <Button
            type="submit"
            className={authSubmitButtonClassName}
            disabled={!email.trim() || isSubmitting}
            aria-busy={isSubmitting}
          >
            Kirim link reset
          </Button>
        </form>
      </AuthFormPanel>
    </AuthLayout>
  )
}
