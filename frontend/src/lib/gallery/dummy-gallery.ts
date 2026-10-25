import { useCallback, useEffect, useState } from 'react'

import {
  createGalleryItem,
  deleteGalleryItem,
  fetchGalleries,
  updateGalleryItem,
  type IGalleryApiItem,
} from '@/services/gallery'

export type DummyGalleryVariant = 0 | 1 | 2 | 3 | 4 | 5

export type DummyGalleryItem = {
  uid: string
  src: string
  alt: string
  caption: string
  /** null = otomatis (globalIdx % 6) seperti section landing. */
  variant: DummyGalleryVariant | null
  createdAt: string
  updatedAt: string
}

export type DummyGalleryFormValues = {
  src: string
  file?: File | null
  alt?: string
  caption: string
  variant: DummyGalleryVariant | null
}

export const EMPTY_GALLERY_FORM: DummyGalleryFormValues = {
  src: '',
  file: null,
  alt: '',
  caption: '',
  variant: null,
}

const CHANGE_EVENT = 'du:gallery-changed'

let cachedGalleryItems: DummyGalleryItem[] | null = null

function mapApiToGalleryItem(item: IGalleryApiItem): DummyGalleryItem {
  const validVariant =
    typeof item.variant === 'number' && item.variant >= 0 && item.variant <= 5
      ? (item.variant as DummyGalleryVariant)
      : null
  return {
    uid: item.uid,
    src: item.image_url,
    alt: item.caption,
    caption: item.caption,
    variant: validVariant,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

function broadcastGalleryChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
  }
}

export function validateDummyGalleryForm(values: DummyGalleryFormValues): string | null {
  if (!values.caption.trim()) return 'Caption wajib diisi.'
  if (!values.file && !values.src.trim()) return 'Gambar wajib dipilih atau diunggah.'
  return null
}

/**
 * Hook data galeri yang terhubung ke backend `/galleries` & Garage S3 Storage.
 */
type GalleryQueryOptions = {
  page?: number
  perPage?: number
  search?: string
  variant?: string
}

type GalleryMeta = {
  total: number
  total_pages: number
}

export function useDummyGallery(options: GalleryQueryOptions = {}) {
  const isPaginated = options.page !== undefined || options.perPage !== undefined || Boolean(options.search) || Boolean(options.variant && options.variant !== 'all')
  const [items, setItems] = useState<DummyGalleryItem[]>(() => !isPaginated ? (cachedGalleryItems ?? []) : [])
  const [isLoading, setIsLoading] = useState<boolean>(() => isPaginated || cachedGalleryItems === null)
  const [meta, setMeta] = useState<GalleryMeta | undefined>(undefined)

  const reload = useCallback(async () => {
    try {
      const res = await fetchGalleries({
        page: options.page,
        per_page: isPaginated ? options.perPage : 100,
        search: options.search || undefined,
        variant: options.variant && options.variant !== 'all' ? options.variant : undefined,
      })
      const mapped = (res.galleries ?? []).map(mapApiToGalleryItem)
      if (!isPaginated) cachedGalleryItems = mapped
      setItems(mapped)
      setMeta({ total: res.meta.total, total_pages: res.meta.total_pages })
    } catch {
      // Keep existing state if backend request fails temporarily
    } finally {
      setIsLoading(false)
    }
  }, [isPaginated, options.page, options.perPage, options.search, options.variant])

  useEffect(() => {
    void reload()

    const handleCustom = () => {
      if (cachedGalleryItems) {
        setItems(cachedGalleryItems)
      }
      void reload()
    }

    window.addEventListener(CHANGE_EVENT, handleCustom)
    return () => {
      window.removeEventListener(CHANGE_EVENT, handleCustom)
    }
  }, [reload])

  const create = useCallback(async (values: DummyGalleryFormValues) => {
    const created = await createGalleryItem({
      file: values.file,
      src: values.src,
      caption: values.caption,
      variant: values.variant,
    })
    const mapped = mapApiToGalleryItem(created)
    setItems((current) => {
      const next = [mapped, ...current]
      cachedGalleryItems = next
      return next
    })
    broadcastGalleryChange()
    return mapped
  }, [])

  const update = useCallback(async (uid: string, values: DummyGalleryFormValues) => {
    const updated = await updateGalleryItem(uid, {
      file: values.file,
      src: values.src,
      caption: values.caption,
      variant: values.variant,
    })
    const mapped = mapApiToGalleryItem(updated)
    setItems((current) => {
      const next = current.map((item) => (item.uid === mapped.uid || item.uid === uid ? mapped : item))
      cachedGalleryItems = next
      return next
    })
    broadcastGalleryChange()
    return mapped
  }, [])

  const remove = useCallback(async (uid: string) => {
    await deleteGalleryItem(uid)
    setItems((current) => {
      const next = current.filter((item) => item.uid !== uid)
      cachedGalleryItems = next
      return next
    })
    broadcastGalleryChange()
  }, [])

  const resetToSeed = useCallback(async () => {
    await reload()
  }, [reload])

  return { items, isLoading, meta, reload, create, update, remove, resetToSeed }
}
