import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Loader2 } from 'lucide-react'
import { getSsoErrorMessage } from '@/lib/security/sso-errors'
import { resolveSafeRedirectPath } from '@/lib/security/safe-redirect'
import { ROUTES } from '@/lib/routes'
import { Message, resolveApiActionError } from '@/lib/Message'
import { parseOAuthCallbackParams } from '@/lib/validator/auth'
import { useAuth } from '@/providers/auth-provider'

/** Hapus token/error sensitif dari URL (query maupun fragment). */
function stripSensitiveLocation() {
  window.history.replaceState({}, document.title, window.location.pathname)
}

function readFragmentParams() {
  const raw = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  return new URLSearchParams(raw)
}

export default function SSOCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signInWithToken } = useAuth()

  useEffect(() => {
    // Backend mengirim token pada URL fragment (#token=...) supaya tidak
    // terekam di server log, sedangkan error dikirim pada query (?error=...).
    const fragmentParams = readFragmentParams()
    const error = searchParams.get('error') ?? fragmentParams.get('error')

    if (error) {
      stripSensitiveLocation()
      toast.error(getSsoErrorMessage(error))
      navigate(ROUTES.login)
      return
    }

    let callbackParams: ReturnType<typeof parseOAuthCallbackParams>
    try {
      callbackParams = parseOAuthCallbackParams({
        token: fragmentParams.get('token') ?? searchParams.get('token'),
        expires_at:
          fragmentParams.get('expires_at') ?? searchParams.get('expires_at'),
        error: null,
      })
    } catch (err) {
      stripSensitiveLocation()
      toast.error(
        resolveApiActionError(
          err instanceof Error ? err : new Error(Message.auth.ssoLoginFailed),
          Message.auth.ssoLoginFailed,
        ),
      )
      navigate(ROUTES.login)
      return
    }

    const token = callbackParams.token
    if (!token) {
      stripSensitiveLocation()
      toast.error(Message.auth.ssoLoginFailed)
      navigate(ROUTES.login)
      return
    }

    stripSensitiveLocation()
    const requestedRedirect = sessionStorage.getItem('auth-redirect-path')
    sessionStorage.removeItem('auth-redirect-path')

    void signInWithToken(token, callbackParams.expires_at)
      .then(({ redirectPath }) => {
        navigate(
          resolveSafeRedirectPath(requestedRedirect, redirectPath || ROUTES.dashboard),
          { replace: true },
        )
        toast.success(Message.auth.loginSuccess)
      })
      .catch((err) => {
        toast.error(
          resolveApiActionError(
            err instanceof Error ? err : new Error(Message.auth.ssoLoginFailed),
            Message.auth.ssoLoginFailed,
          ),
        )
        navigate(ROUTES.login)
      })
  }, [navigate, searchParams, signInWithToken])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-6">
      <div className="flex size-32 items-center justify-center rounded-[28px] border border-border/70 bg-card shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:size-36">
        <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
      </div>
      <p
        className="text-sm font-medium text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        Memverifikasi akun DOSCOM...
      </p>
    </main>
  )
}
