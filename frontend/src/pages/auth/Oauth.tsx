'use client'

import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getOAuthErrorMessage } from '@/lib/security/oauth-errors'
import { Message, resolveApiActionError } from '@/lib/Message'
import { parseOAuthCallbackParams } from '@/lib/validator/auth'
import { SafeLottie } from '../../components/ui/lottie'
import { useAuth } from '../../providers/auth-provider'

function stripSensitiveQueryParams() {
  window.history.replaceState({}, document.title, window.location.pathname)
}

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signInWithToken } = useAuth()

  useEffect(() => {
    const error = searchParams.get('error')

    if (error) {
      stripSensitiveQueryParams()
      toast.error(getOAuthErrorMessage(error))
      navigate('/auth/login')
      return
    }

    let callbackParams: ReturnType<typeof parseOAuthCallbackParams>
    try {
      callbackParams = parseOAuthCallbackParams({
        token: searchParams.get('token'),
        expires_at: searchParams.get('expires_at'),
        error: searchParams.get('error'),
      })
    } catch (err) {
      stripSensitiveQueryParams()
      toast.error(
        resolveApiActionError(
          err instanceof Error ? err : new Error(Message.auth.googleLoginFailed),
          Message.auth.googleLoginFailed,
        ),
      )
      navigate('/auth/login')
      return
    }

    const token = callbackParams.token
    if (!token) {
      stripSensitiveQueryParams()
      toast.error(Message.auth.googleLoginFailed)
      navigate('/auth/login')
      return
    }

    stripSensitiveQueryParams()

    void signInWithToken(token, callbackParams.expires_at)
      .then(({ redirectPath }) => {
        navigate(redirectPath)
        toast.success(Message.auth.loginSuccess)
      })
      .catch((err) => {
        toast.error(
          resolveApiActionError(
            err instanceof Error ? err : new Error(Message.auth.googleLoginFailed),
            Message.auth.googleLoginFailed,
          ),
        )
        navigate('/auth/login')
      })
  }, [navigate, searchParams, signInWithToken])

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <SafeLottie src="/Book-loading.lottie" className="size-36" />
    </main>
  )
}
