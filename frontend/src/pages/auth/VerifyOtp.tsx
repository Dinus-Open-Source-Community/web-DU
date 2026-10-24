import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react'
import { Loader2, Mail, RefreshCw, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AuthFormPanel } from '@/components/auth/AuthFormPanel'
import { AuthPageHeader } from '@/components/auth/AuthPageHeader'
import { authSubmitButtonClassName } from '@/components/auth/constants'
import { GlobalInput } from '@/components/shared/Input'
import { Button } from '@/components/ui/button'
import AuthLayout from '@/components/layouts/AuthLayouts'
import { ROUTES } from '@/lib/routes'
import { resendOtp } from '@/services/auth'
import { getApiErrorMessage, resolveAppErrorSource } from '@/services/api-error'
import { useAuth } from '@/providers/auth-provider'

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOtp } = useAuth()

  // Ambil email dari location.state atau query parameter ?email=...
  const searchParams = new URLSearchParams(location.search)
  const initialEmail = (location.state?.email as string) || searchParams.get('email') || ''

  const [email, setEmail] = useState(initialEmail)
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail)
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Timer cooldown pengiriman ulang OTP
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // Auto-focus pada kotak pertama saat dimuat
  useEffect(() => {
    if (!isEditingEmail) {
      inputRefs.current[0]?.focus()
    }
  }, [isEditingEmail])

  const otpCode = digits.join('')
  const isComplete = otpCode.length === 6 && digits.every((d) => d !== '')

  const handleDigitChange = (index: number, value: string) => {
    // Hanya izinkan angka
    const char = value.replace(/\D/g, '').slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = char
    setDigits(nextDigits)

    // Jika karakter diinput dan bukan kotak terakhir, pindah ke kotak berikutnya
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Jika kotak saat ini sudah kosong, hapus kotak sebelumnya dan fokus ke sana
        const nextDigits = [...digits]
        nextDigits[index - 1] = ''
        setDigits(nextDigits)
        inputRefs.current[index - 1]?.focus()
      } else {
        const nextDigits = [...digits]
        nextDigits[index] = ''
        setDigits(nextDigits)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const nextDigits = [...digits]
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasted[i] || ''
    }
    setDigits(nextDigits)

    const nextFocusIndex = Math.min(pasted.length, 5)
    inputRefs.current[nextFocusIndex]?.focus()
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isComplete || isSubmitting) return

    if (!email.trim()) {
      toast.error('Masukkan alamat email kamu terlebih dahulu.')
      setIsEditingEmail(true)
      return
    }

    setIsSubmitting(true)
    try {
      const { redirectPath } = await verifyOtp({
        email: email.trim(),
        otp: otpCode,
      })
      toast.success('Akun kamu berhasil diverifikasi! Selamat belajar.')
      navigate(redirectPath || ROUTES.dashboard, { replace: true })
    } catch (err) {
      const appErr = resolveAppErrorSource(err instanceof Error ? err : null)
      const errorMsg = appErr
        ? getApiErrorMessage(appErr, 'Verifikasi OTP gagal. Silakan coba lagi.')
        : 'Verifikasi OTP gagal.'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || isResending) return
    if (!email.trim()) {
      toast.error('Masukkan alamat email kamu terlebih dahulu.')
      setIsEditingEmail(true)
      return
    }

    setIsResending(true)
    try {
      await resendOtp({ email: email.trim() })
      toast.success('Kode OTP baru telah dikirim ke email kamu.')
      setCountdown(60)
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      const appErr = resolveAppErrorSource(err instanceof Error ? err : null)
      const errorMsg = appErr
        ? getApiErrorMessage(appErr, 'Gagal mengirim ulang kode OTP.')
        : 'Gagal mengirim ulang kode OTP.'
      toast.error(errorMsg)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout
      heading="Verifikasi Akun Kamu"
      subheading="Masukkan kode OTP 6 digit yang dikirimkan ke email untuk mengaktifkan akun DOSCOM University."
    >
      <AuthFormPanel>
        <AuthPageHeader
          title="Verifikasi OTP"
          description="Masukkan 6-digit kode OTP untuk memastikan kepemilikan email."
          backHref="/auth/login"
          backLabel="Kembali ke masuk"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tampilan / Edit Email */}
          <div className="rounded-xl border border-line-light bg-paper-paper p-3.5">
            {isEditingEmail ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink-600">Alamat Email</label>
                <div className="flex items-center gap-2">
                  <GlobalInput
                    type="email"
                    value={email}
                    placeholder="nama@email.com"
                    onChange={(e) => setEmail(e.target.value)}
                    variant="auth"
                    className="flex-1 text-sm"
                    required
                  />
                  {email.trim() && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingEmail(false)}
                      className="border-line-medium text-xs font-semibold"
                    >
                      Selesai
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-ink-500">Kode dikirim ke</p>
                    <p className="truncate text-sm font-semibold text-ink-900">{email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="shrink-0 text-xs font-semibold text-primary hover:underline"
                >
                  Ubah
                </button>
              </div>
            )}
          </div>

          {/* Input 6 Kotak Digit OTP */}
          <div className="space-y-3">
            <label className="block text-center text-xs font-bold uppercase tracking-wider text-ink-500">
              Kode OTP 6 Digit
            </label>
            <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isSubmitting}
                  className="h-14 w-11 sm:h-16 sm:w-13 rounded-xl border-2 border-ink-900/15 bg-paper-white text-center font-mono text-2xl font-extrabold text-ink-900 shadow-[0_2px_0_#050914] transition-all hover:border-ink-900/30 focus:border-brand-blue focus:shadow-[0_4px_0_#050914] focus:outline-none disabled:opacity-50"
                  aria-label={`Digit ke ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button
            type="submit"
            variant="neobrutalism"
            className={authSubmitButtonClassName}
            disabled={!isComplete || isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Memverifikasi...
              </>
            ) : (
              'Verifikasi & Masuk'
            )}
          </Button>

          {/* Resend Cooldown Section */}
          <div className="flex flex-col items-center justify-center gap-1.5 text-center text-xs text-ink-500">
            {countdown > 0 ? (
              <p>
                Tidak menerima kode? Kirim ulang dalam{' '}
                <span className="font-bold text-brand-ink">{countdown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    Mengirim ulang...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-3.5" />
                    Kirim ulang kode OTP
                  </>
                )}
              </button>
            )}
          </div>

          <div className="border-t border-line-light pt-4 text-center">
            <Link
              to={ROUTES.login}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Kembali ke halaman masuk
            </Link>
          </div>
        </form>
      </AuthFormPanel>
    </AuthLayout>
  )
}
