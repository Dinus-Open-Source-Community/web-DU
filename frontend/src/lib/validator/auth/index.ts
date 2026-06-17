import { parseWithValidationMessage } from '../errors'
import {
  forgotPasswordFormSchema,
  loginSchema,
  oauthCallbackParamsSchema,
  registerFormSchema,
  registerPayloadSchema,
  resetPasswordFormSchema,
  type ForgotPasswordFormValues,
  type LoginFormValues,
  type RegisterFormValues,
  type RegisterPayloadValues,
  type ResetPasswordFormValues,
} from '../auth.schema'

export * from '../auth.schema'

export function parseLoginPayload(payload: LoginFormValues, fallback = 'Data login tidak valid') {
  return parseWithValidationMessage(loginSchema, payload, fallback)
}

export function parseRegisterPayload(
  payload: RegisterPayloadValues,
  fallback = 'Data registrasi tidak valid',
) {
  return parseWithValidationMessage(registerPayloadSchema, payload, fallback)
}

export function parseRegisterFormValues(
  payload: RegisterFormValues,
  fallback = 'Form registrasi tidak valid',
) {
  return parseWithValidationMessage(registerFormSchema, payload, fallback)
}

export function parseForgotPasswordForm(
  payload: ForgotPasswordFormValues,
  fallback = 'Email tidak valid',
) {
  return parseWithValidationMessage(forgotPasswordFormSchema, payload, fallback)
}

export function parseResetPasswordForm(
  payload: ResetPasswordFormValues,
  fallback = 'Data reset password tidak valid',
) {
  return parseWithValidationMessage(resetPasswordFormSchema, payload, fallback)
}

export function parseOAuthCallbackParams(
  params: Record<string, string | null | undefined>,
  fallback = 'Callback OAuth tidak valid',
) {
  return parseWithValidationMessage(
    oauthCallbackParamsSchema,
    {
      token: params.token ?? undefined,
      expires_at: params.expires_at ?? undefined,
      error: params.error ?? undefined,
    },
    fallback,
  )
}
