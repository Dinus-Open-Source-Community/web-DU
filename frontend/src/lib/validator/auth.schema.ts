import { z } from 'zod'
import { emailSchema, passwordSchema, userNameSchema } from './common'

/** Selaras `dto.LoginRequest`. */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password wajib diisi'),
})

/** Payload registrasi — selaras `dto.RegisterRequest`. */
export const registerPayloadSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const registerFormSchema = registerPayloadSchema
  .extend({
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  })

/** Form forgot password — siap wire ke BE saat endpoint tersedia. */
export const forgotPasswordFormSchema = z.object({
  email: emailSchema,
})

/** Form reset password — siap wire ke BE; token dari query. */
export const resetPasswordFormSchema = z
  .object({
    token: z.string().trim().min(1, 'Token reset tidak valid'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  })

/** Query OAuth callback — selaras redirect BE ke `/auth/oauth/callback`. */
export const oauthCallbackParamsSchema = z
  .object({
    token: z.string().trim().min(1).optional(),
    expires_at: z.string().trim().optional(),
    error: z.string().trim().optional(),
  })
  .refine((data) => Boolean(data.token) || Boolean(data.error), {
    message: 'Token OAuth atau error wajib ada',
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterPayloadValues = z.infer<typeof registerPayloadSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>
