import { z } from 'zod'

export function getValidationMessage(error: z.ZodError, fallback = 'Data tidak valid') {
  return error.issues[0]?.message ?? fallback
}

export function parseWithValidationMessage<S extends z.ZodType>(
  schema: S,
  data: z.input<S>,
  fallback?: string,
): z.output<S> {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw new Error(getValidationMessage(result.error, fallback))
  }

  return result.data
}
