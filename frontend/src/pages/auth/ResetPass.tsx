'use client'

import { useState, type FormEvent } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { AuthFormPanel } from '@/components/auth/AuthFormPanel'
import { AuthPageHeader } from '@/components/auth/AuthPageHeader'
import { AuthPasswordToggleButton } from '@/components/auth/AuthPasswordToggleButton'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrength'
import { authInputClassName, authSubmitButtonClassName } from '@/components/auth/constants'
import { GlobalInput } from '@/components/shared/Input'
import { Button } from '@/components/ui/button'
import AuthLayout from '@/components/layouts/AuthLayouts'
import { Message, resolveActionError } from '@/lib/Message'
import { parseResetPasswordForm } from '@/lib/validator/auth'

export function FormResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (passwordMismatch || !password || !token || isSubmitting) return

    setIsSubmitting(true)
    try {
      parseResetPasswordForm({
        token,
        password,
        confirmPassword,
      })
      toast.error(Message.auth.resetPasswordUnavailable)
    } catch (err) {
      toast.error(
        resolveActionError(
          err instanceof Error ? err : null,
          Message.auth.resetPasswordInvalid,
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <AuthFormPanel>
          <div className="flex flex-col items-center gap-6 py-2 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50">
              <AlertTriangle className="size-8 text-amber-500" aria-hidden />
            </div>
            <AuthPageHeader
              title="Link tidak valid"
              description="Link reset password ini tidak valid atau sudah kadaluarsa. Silakan minta link baru."
            />
            <Button asChild className={authSubmitButtonClassName}>
              <Link to="/auth/forgot-password">Minta link baru</Link>
            </Button>
          </div>
        </AuthFormPanel>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      heading="Password baru"
      subheading="Buat password baru yang kuat untuk melindungi akunmu."
    >
      <AuthFormPanel>
        <AuthPageHeader
          title="Buat password baru"
          description="Password baru harus berbeda dari password sebelumnya. Reset akan aktif setelah endpoint backend tersedia."
          backHref="/auth/login"
          backLabel="Kembali ke login"
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <GlobalInput
              label="Password baru"
              placeholder="Masukkan password baru"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
              className={`${authInputClassName} pr-12`}
              rightIcon={
                <AuthPasswordToggleButton
                  visible={showPassword}
                  disabled={isSubmitting}
                  onClick={() => setShowPassword((prev) => !prev)}
                />
              }
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <div>
            <GlobalInput
              label="Konfirmasi password"
              placeholder="Ulangi password baru"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              required
              className={`${authInputClassName} pr-12`}
              rightIcon={
                <AuthPasswordToggleButton
                  visible={showConfirm}
                  disabled={isSubmitting}
                  onClick={() => setShowConfirm((prev) => !prev)}
                />
              }
            />
            {passwordMismatch ? (
              <p className="mt-2 text-xs font-medium text-destructive">
                Password tidak cocok
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            className={authSubmitButtonClassName}
            disabled={passwordMismatch || !password || isSubmitting}
            aria-busy={isSubmitting}
          >
            Reset password
          </Button>
        </form>
      </AuthFormPanel>
    </AuthLayout>
  )
}
