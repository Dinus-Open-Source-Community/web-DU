import {
  mapLessonAssignmentSubmissionBundle,
  mapLessonAssignmentSubmissionResponse,
} from '@/lib/lesson-assignment/mappers'
import type { LessonAssignmentSubmissionBundle } from '@/lib/lesson-assignment/types'
import type { SubmitLessonAssignmentPayload } from '@/lib/lesson-assignment/submission-draft'
import type { LessonDetailAssignment } from '@/lib/types/lesson'
import {
  buildSubmissionValidationContext,
  parseLessonAssignmentSubmissionInput,
  parseLessonUidParam,
} from '@/lib/validator/lesson-assignment'
import { API_ROUTES } from './api-path'
import { api } from './axios'
import { getApiErrorMessage, unwrapApiResponse, withApiErrorHandling } from './api-error'
import type { IResponse } from '@/lib/types/api'
import type { AxiosError } from 'axios'

export type SubmitLessonAssignmentInput = SubmitLessonAssignmentPayload

export type SubmitLessonAssignmentOptions = {
  assignment: LessonDetailAssignment
  priorFileUrl?: string | null
  hasExistingSubmission: boolean
}

function isNotFoundError(error: unknown) {
  const axiosError = error as AxiosError
  return axiosError.response?.status === 404
}

function isAlreadySubmittedError(error: unknown) {
  const message = getApiErrorMessage(error, '').toLowerCase()
  return message.includes('already submitted')
}

export async function fetchMyLessonAssignmentSubmission(
  lessonUid: string,
): Promise<LessonAssignmentSubmissionBundle | null> {
  return withApiErrorHandling(async () => {
    const validatedLessonUid = parseLessonUidParam(lessonUid)
    try {
      const response = await api.get<IResponse<unknown>>(
        API_ROUTES.lessons.assignment.submission.getByLessonUid(validatedLessonUid),
      )
      const data = unwrapApiResponse(response.data, 'Gagal mengambil submission tugas')
      return mapLessonAssignmentSubmissionBundle(data)
    } catch (error) {
      if (isNotFoundError(error)) return null
      throw error
    }
  }, 'Gagal mengambil submission tugas')
}

function buildSubmissionFormData(input: SubmitLessonAssignmentInput) {
  const formData = new FormData()

  if (input.plainText !== undefined) formData.append('plain_text', input.plainText)
  if (input.richText !== undefined) formData.append('rich_text', JSON.stringify(input.richText))
  if (input.fileDescription !== undefined) {
    formData.append('file_description', input.fileDescription)
  }
  if (input.quizAnswers !== undefined) {
    formData.append('quiz_answers', JSON.stringify(input.quizAnswers))
  }
  if (input.file) formData.append('file', input.file)

  return formData
}

function buildSubmissionJsonBody(input: SubmitLessonAssignmentInput) {
  const body: Record<string, unknown> = { remove_file: false }

  if (input.plainText !== undefined) body.plain_text = input.plainText
  if (input.richText !== undefined) body.rich_text = input.richText
  if (input.fileDescription !== undefined) body.file_description = input.fileDescription
  if (input.quizAnswers !== undefined) body.quiz_answers = input.quizAnswers

  return body
}

async function postSubmission(lessonUid: string, input: SubmitLessonAssignmentInput) {
  const useMultipart = Boolean(input.file)

  if (useMultipart) {
    const response = await api.post<IResponse<unknown>>(
      API_ROUTES.lessons.assignment.submission.createByLessonUid(lessonUid),
      buildSubmissionFormData(input),
    )
    const data = unwrapApiResponse(response.data, 'Gagal mengumpulkan tugas')
    return mapLessonAssignmentSubmissionResponse(data)
  }

  const response = await api.post<IResponse<unknown>>(
    API_ROUTES.lessons.assignment.submission.createByLessonUid(lessonUid),
    buildSubmissionJsonBody(input),
  )
  const data = unwrapApiResponse(response.data, 'Gagal mengumpulkan tugas')
  return mapLessonAssignmentSubmissionResponse(data)
}

async function putSubmission(lessonUid: string, input: SubmitLessonAssignmentInput) {
  const useMultipart = Boolean(input.file)

  if (useMultipart) {
    const response = await api.put<IResponse<unknown>>(
      API_ROUTES.lessons.assignment.submission.updateByLessonUid(lessonUid),
      buildSubmissionFormData(input),
    )
    const data = unwrapApiResponse(response.data, 'Gagal memperbarui tugas')
    return mapLessonAssignmentSubmissionResponse(data)
  }

  const response = await api.put<IResponse<unknown>>(
    API_ROUTES.lessons.assignment.submission.updateByLessonUid(lessonUid),
    buildSubmissionJsonBody(input),
  )
  const data = unwrapApiResponse(response.data, 'Gagal memperbarui tugas')
  return mapLessonAssignmentSubmissionResponse(data)
}

export async function submitLessonAssignment(
  lessonUid: string,
  input: SubmitLessonAssignmentInput,
  options: SubmitLessonAssignmentOptions,
) {
  return withApiErrorHandling(async () => {
    const validatedLessonUid = parseLessonUidParam(lessonUid)
    const validatedInput = parseLessonAssignmentSubmissionInput(
      input,
      buildSubmissionValidationContext(options.assignment, options.priorFileUrl),
    )

    if (options.hasExistingSubmission) {
      return putSubmission(validatedLessonUid, validatedInput)
    }

    try {
      return await postSubmission(validatedLessonUid, validatedInput)
    } catch (error) {
      if (isAlreadySubmittedError(error)) {
        return putSubmission(validatedLessonUid, validatedInput)
      }
      throw error
    }
  }, 'Gagal mengumpulkan tugas')
}
