import type { LessonCreateRequest, LessonPayloadInput, LessonUpdateRequest } from '@/lib/types/lesson'
import { getValidationMessage, parseWithValidationMessage } from '../errors'
import {
  lessonCreateRequestSchema,
  lessonPayloadInputSchema,
  lessonUpdateRequestSchema,
  type LessonCreateRequestValidated,
  type LessonPayloadInputValidated,
  type LessonUpdateRequestValidated,
} from './lesson.schema'

export * from './lesson.schema'
export * from './rich-text.schema'

export function parseLessonPayloadInput(
  input: LessonPayloadInput,
  fallback = 'Data lesson tidak valid',
): LessonPayloadInputValidated {
  return parseWithValidationMessage(lessonPayloadInputSchema, input, fallback)
}

export function parseLessonCreateRequest(
  payload: LessonCreateRequest,
  fallback = 'Payload create lesson tidak valid',
): LessonCreateRequestValidated {
  return parseWithValidationMessage(lessonCreateRequestSchema, payload, fallback)
}

export function parseLessonUpdateRequest(
  payload: LessonUpdateRequest,
  fallback = 'Payload update lesson tidak valid',
): LessonUpdateRequestValidated {
  return parseWithValidationMessage(lessonUpdateRequestSchema, payload, fallback)
}

export function validateLessonPayloadInputs(inputs: LessonPayloadInput[]): LessonPayloadInputValidated[] {
  const issues: string[] = []

  const validated = inputs.map((input, index) => {
    const result = lessonPayloadInputSchema.safeParse(input)
    if (!result.success) {
      issues.push(`Lesson ${index + 1}: ${getValidationMessage(result.error)}`)
      return null
    }
    return result.data
  })

  if (issues.length > 0) {
    throw new Error(issues.join('\n'))
  }

  return validated as LessonPayloadInputValidated[]
}
