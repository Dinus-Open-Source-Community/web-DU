import type { ILessonResponse } from '@/lib/types/lesson'

type LessonStubInput = Pick<
  ILessonResponse,
  'uid' | 'module_uid' | 'title' | 'order_index' | 'created_at' | 'updated_at'
>

/** Membangun stub lesson lengkap untuk mock data halaman mentor. */
export function buildLessonResponseStub(input: LessonStubInput): ILessonResponse {
  return {
    ...input,
    content_type: 'text',
    content: null,
    video_url: '',
    start_time: '',
    end_time: '',
  }
}
