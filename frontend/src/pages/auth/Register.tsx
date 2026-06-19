import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'

import { AuthDivider } from '@/components/auth/AuthDivider'
import { AuthFormPanel } from '@/components/auth/AuthFormPanel'
import { AuthPageHeader } from '@/components/auth/AuthPageHeader'
import { AuthPasswordToggleButton } from '@/components/auth/AuthPasswordToggleButton'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrength'
import {
  authInputClassName,
  authSubmitButtonClassName,
} from '@/components/auth/constants'
import { GlobalInput } from '@/components/shared/Input'
import OauthButton from '@/components/shared/OauthButton'
import { Button } from '@/components/ui/button'
import AuthLayout from '@/components/layouts/AuthLayouts'
import { Message, resolveActionError } from '@/lib/Message'
import { parseRegisterFormValues } from '@/lib/validator/auth'
import { useAuth } from '@/providers/auth-provider'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, startGoogleOAuth } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (passwordMismatch || isSubmitting) return

    setIsSubmitting(true)
    try {
      const payload = parseRegisterFormValues(
        { name, email, password, confirmPassword },
        Message.common.validationFailed,
      )
      const { redirectPath } = await signUp(payload)
      navigate(redirectPath)
      toast.success(Message.auth.registerSuccess)
    } catch (err) {
      toast.error(
        resolveActionError(
          err instanceof Error ? err : null,
          Message.auth.registerFailed,
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      heading="Buat akun baru"
      subheading="Daftar sekarang dan mulai perjalanan belajar Anda dengan Doscom University."
    >
      <AuthFormPanel>
        <AuthPageHeader
          title="Daftar"
          description="Lengkapi data di bawah untuk membuat akun baru."
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <GlobalInput
              label="Nama lengkap"
              placeholder="Nama lengkap"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
              className={authInputClassName}
            />
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
          </div>

          <div className="space-y-3">
            <GlobalInput
              label="Password"
              placeholder="Buat password"
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
              placeholder="Ulangi password"
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

          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link
              to="/auth/login"
              className="font-semibold text-primary hover:underline"
            >
              Masuk
            </Link>
          </p>

          <Button
            type="submit"
            className={authSubmitButtonClassName}
            disabled={passwordMismatch || isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Memproses...
              </>
            ) : (
              'Buat akun'
            )}
          </Button>

          <AuthDivider label="Atau daftar dengan" />

          <OauthButton
            isSubmitting={isSubmitting}
            onGoogleSignIn={startGoogleOAuth}
          />
        </form>
      </AuthFormPanel>
    </AuthLayout>
  )
}
