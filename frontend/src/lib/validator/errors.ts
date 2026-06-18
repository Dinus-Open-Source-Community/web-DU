import { z } from 'zod'

export function getValidationMessage(error: z.ZodError, fallback = 'Data tidak valid') {
  return error.issues[0]?.message ?? fallback
}

export function parseWithValidationMessage<Output, Input>(
  schema: z.ZodType<Output, Input>,
  data: Input,
  fallback?: string,
): Output {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw new Error(getValidationMessage(result.error, fallback))
  }

  return result.data
}
