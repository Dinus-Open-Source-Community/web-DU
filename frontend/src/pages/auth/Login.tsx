import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AuthDivider } from '@/components/auth/AuthDivider'
import { AuthFormPanel } from '@/components/auth/AuthFormPanel'
import { AuthPageHeader } from '@/components/auth/AuthPageHeader'
import { AuthPasswordToggleButton } from '@/components/auth/AuthPasswordToggleButton'
import {
  authInputClassName,
  authSubmitButtonClassName,
} from '@/components/auth/constants'
import { GlobalInput } from '@/components/shared/Input'
import OauthButton from '@/components/shared/OauthButton'
import { Button } from '@/components/ui/button'
import AuthLayout from '@/components/layouts/AuthLayouts'
import { Message, resolveActionError } from '@/lib/Message'
import { resolveSafeRedirectPath } from '@/lib/security/safe-redirect'
import { parseLoginPayload } from '@/lib/validator/auth'
import { useAuth } from '@/providers/auth-provider'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, startGoogleOAuth } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const payload = parseLoginPayload(
        { email, password },
        Message.common.validationFailed,
      )
      const { redirectPath } = await signIn(payload)
      navigate(resolveSafeRedirectPath(location.state?.from, redirectPath), {
        replace: true,
      })
      toast.success(Message.auth.loginSuccess)
    } catch (err) {
      toast.error(
        resolveActionError(
          err instanceof Error ? err : null,
          Message.auth.loginFailed,
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      heading="Selamat datang kembali"
      subheading="Masuk ke akunmu dan lanjutkan perjalanan belajar bersama Doscom University."
    >
      <AuthFormPanel>
        <AuthPageHeader
          title="Masuk"
          description="Gunakan email kampus atau akun yang sudah terdaftar."
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <GlobalInput
              label="Alamat email"
              placeholder="nama@contoh.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
              className={authInputClassName}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="login-password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Lupa password?
                </Link>
              </div>
              <GlobalInput
                id="login-password"
                placeholder="Masukkan password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link
              to="/auth/register"
              className="font-semibold text-primary hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>

          <Button
            type="submit"
            className={authSubmitButtonClassName}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Memproses...
              </>
            ) : (
              'Masuk ke akun'
            )}
          </Button>
        </form>

        <AuthDivider label="Atau masuk dengan" />

        <OauthButton
          isSubmitting={isSubmitting}
          onGoogleSignIn={startGoogleOAuth}
        />
      </AuthFormPanel>
    </AuthLayout>
  )
}
