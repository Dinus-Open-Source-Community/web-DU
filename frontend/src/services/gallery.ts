import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES, type IQueryParamsPayload } from './api-path'
import type { IResponse } from '@/lib/types/api'

export type GalleryVariantValue = 0 | 1 | 2 | 3 | 4 | 5

export interface IGalleryApiItem {
  uid: string
  image_url: string
  caption: string
  variant: GalleryVariantValue | null
  created_at: string
  updated_at: string
}

export interface IGalleryListResponse {
  galleries: IGalleryApiItem[]
  meta: {
    total: number
    per_page: number
    current_page: number
    total_pages: number
  }
}

export interface UpsertGalleryPayload {
  file?: File | null
  src?: string
  caption: string
  variant: GalleryVariantValue | null
}

function dataUrlToFile(dataUrl: string, defaultName = 'gallery-upload.webp'): File | null {
  if (!dataUrl.startsWith('data:')) return null
  const [header, base64Data] = dataUrl.split(',', 2)
  if (!header || !base64Data) return null
  const mimeMatch = header.match(/data:([^;]+);base64/)
  const mime = mimeMatch?.[1] || 'image/webp'
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'webp'
  try {
    const binary = atob(base64Data)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    const baseName = defaultName.replace(/\.[^.]+$/, '')
    return new File([bytes], `${baseName}.${ext}`, { type: mime })
  } catch {
    return null
  }
}

function buildGalleryFormData(payload: UpsertGalleryPayload): FormData {
  const formData = new FormData()
  formData.append('caption', payload.caption.trim())
  formData.append('variant', payload.variant === null ? 'auto' : String(payload.variant))

  const uploadFile = payload.file ?? (payload.src ? dataUrlToFile(payload.src) : null)
  if (uploadFile) {
    formData.append('image', uploadFile)
  } else if (payload.src && !payload.src.startsWith('data:')) {
    formData.append('image_url', payload.src.trim())
  }

  return formData
}

export async function fetchGalleries(params?: IQueryParamsPayload): Promise<IGalleryListResponse> {
  const response = await api.get<IResponse<IGalleryListResponse>>(
    API_ROUTES.galleries.getAll(params),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil data galeri')
}

export async function fetchGalleryByUid(uid: string): Promise<IGalleryApiItem> {
  const response = await api.get<IResponse<IGalleryApiItem>>(
    API_ROUTES.galleries.getByUid(uid),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil detail foto galeri')
}

export async function createGalleryItem(payload: UpsertGalleryPayload): Promise<IGalleryApiItem> {
  const formData = buildGalleryFormData(payload)
  const response = await api.post<IResponse<IGalleryApiItem>>(
    API_ROUTES.galleries.create,
    formData,
  )
  return unwrapApiResponse(response.data, 'Gagal menambahkan foto dokumentasi galeri')
}

export async function updateGalleryItem(uid: string, payload: UpsertGalleryPayload): Promise<IGalleryApiItem> {
  const formData = buildGalleryFormData(payload)
  const response = await api.put<IResponse<IGalleryApiItem>>(
    API_ROUTES.galleries.updateByUid(uid),
    formData,
  )
  return unwrapApiResponse(response.data, 'Gagal memperbarui foto dokumentasi galeri')
}

export async function deleteGalleryItem(uid: string): Promise<null> {
  const response = await api.delete<IResponse<null>>(
    API_ROUTES.galleries.deleteByUid(uid),
  )
  return unwrapApiResponse(response.data, 'Gagal menghapus foto dokumentasi galeri')
}
