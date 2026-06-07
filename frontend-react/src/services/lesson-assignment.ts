import { mapLessonAssignmentSubmissionResponse } from '@/lib/lesson-assignment/mappers'
import type { LessonAssignmentSubmissionRecord } from '@/lib/lesson-assignment/types'
import type { SubmitLessonAssignmentPayload } from '@/lib/lesson-assignment/submission-draft'
import { API_ROUTES } from './api-path'
import { api } from './axios'
import { getApiErrorMessage, unwrapApiResponse, withApiErrorHandling } from './api-error'
import type { IResponse } from '@/lib/types/api'
import type { AxiosError } from 'axios'

export type SubmitLessonAssignmentInput = SubmitLessonAssignmentPayload

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
): Promise<LessonAssignmentSubmissionRecord | null> {
  return withApiErrorHandling(async () => {
    try {
      const response = await api.get<IResponse<unknown>>(
        API_ROUTES.lessons.assignment.submission.getByLessonUid(lessonUid),
      )
      const data = unwrapApiResponse(response.data, 'Gagal mengambil submission tugas')
      return mapLessonAssignmentSubmissionResponse(data)
    } catch (error) {
      if (isNotFoundError(error)) return null
      throw error
    }
  }, 'Gagal mengambil submission tugas')
}

function buildSubmissionFormData(input: SubmitLessonAssignmentInput) {
  const formData = new FormData()

  if (input.plainText != null) formData.append('plain_text', input.plainText)
  if (input.richText != null) formData.append('rich_text', JSON.stringify(input.richText))
  if (input.fileDescription != null) formData.append('file_description', input.fileDescription)
  if (input.quizAnswers != null) formData.append('quiz_answers', JSON.stringify(input.quizAnswers))
  if (input.file) formData.append('file', input.file)

  return formData
}

function buildSubmissionJsonBody(input: SubmitLessonAssignmentInput) {
  return {
    plain_text: input.plainText,
    rich_text: input.richText,
    file_description: input.fileDescription,
    quiz_answers: input.quizAnswers,
    remove_file: false,
  }
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
  hasExistingSubmission: boolean,
) {
  return withApiErrorHandling(async () => {
    if (hasExistingSubmission) {
      return putSubmission(lessonUid, input)
    }

    try {
      return await postSubmission(lessonUid, input)
    } catch (error) {
      if (isAlreadySubmittedError(error)) {
        return putSubmission(lessonUid, input)
      }
      throw error
    }
  }, 'Gagal mengumpulkan tugas')
}
