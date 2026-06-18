import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { Message, resolveActionError } from '@/lib/Message'
import { LogoDu } from '../../components/shared/icon'
import { Button } from '../../components/ui/button'
import OauthButton from '../../components/shared/OauthButton'
import { GlobalInput } from '../../components/shared/Input'
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrength'
import AuthLayout from '../../components/layouts/AuthLayouts'
import { useAuth } from '../../providers/auth-provider'
import { parseWithValidationMessage, registerFormSchema } from '../../lib/validator'

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

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (passwordMismatch || isSubmitting) return

    setIsSubmitting(true)
    try {
      const payload = parseWithValidationMessage(registerFormSchema, { name, email, password, confirmPassword }, Message.common.validationFailed)
      const { redirectPath } = await signUp(payload)
      navigate(redirectPath)
      toast.success(Message.auth.registerSuccess)
    } catch (err) {
      toast.error(resolveActionError(err instanceof Error ? err : null, Message.auth.registerFailed))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout lottieUrl="/public/Secure Login.lottie" heading="Buat Akun Baru" subheading="Daftar sekarang dan mulai perjalanan belajar Anda dengan Doscom University!">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 lg:items-start">
          <Link to="/" className="mb-2 flex items-center gap-2 lg:hidden">
            <LogoDu className="size-8 text-primary" />
            <span className="text-lg font-bold tracking-tight text-primary">Doscom University</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buat Akun Baru</h1>
        </div>

        {/* Oauth Button */}

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
            <PasswordStrengthIndicator password={password} className="mt-3" />
          </div>

          <p className="text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/auth/login" className="font-semibold text-primary hover:underline">
              Masuk
            </Link>
          </p>

          <Button type="submit" className="h-12 rounded-xl  text-sm font-bold shadow-sm" disabled={passwordMismatch || isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Memproses...
              </>
            ) : (
              'Buat Akun'
            )}
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm font-medium text-slate-400">atau daftar dengan</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <OauthButton isSubmitting={isSubmitting} onGoogleSignIn={startGoogleOAuth} />
        </form>
      </div>
    </AuthLayout>
  )
}
