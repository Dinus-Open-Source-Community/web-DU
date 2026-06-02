import { z } from 'zod'

export function getValidationMessage(error: unknown, fallback = 'Data tidak valid') {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? fallback
  }

  return fallback
}

export function parseWithValidationMessage<TSchema extends z.ZodType>(schema: TSchema, data: unknown, fallback?: string): z.infer<TSchema> {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw new Error(getValidationMessage(result.error, fallback))
  }

  return result.data
}
