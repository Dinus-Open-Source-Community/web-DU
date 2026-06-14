import { z } from 'zod'
import { emailSchema, passwordSchema, requiredStringSchema } from './common'

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password wajib diisi'),
})

export const registerPayloadSchema = z.object({
  name: requiredStringSchema('Nama').min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
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

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterPayloadValues = z.infer<typeof registerPayloadSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>
