import { useCallback, useEffect, useState } from 'react'

import { GALLERY_IMAGES } from '@/lib/landing/gallery'

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
  alt: string
  caption: string
  variant: DummyGalleryVariant | null
}

export const EMPTY_GALLERY_FORM: DummyGalleryFormValues = {
  src: '',
  alt: '',
  caption: '',
  variant: null,
}

const STORAGE_KEY = 'du.dummy-gallery.v1'

function seedItems(): DummyGalleryItem[] {
  const now = new Date().toISOString()
  return GALLERY_IMAGES.map((img, index) => ({
    uid: `seed-${index}`,
    src: img.src,
    alt: img.alt,
    caption: img.caption,
    variant: img.variant ?? null,
    createdAt: now,
    updatedAt: now,
  }))
}

function loadItems(): DummyGalleryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedItems()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return seedItems()
    return parsed as DummyGalleryItem[]
  } catch {
    return seedItems()
  }
}

function newUid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `local-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
}

export function validateDummyGalleryForm(values: DummyGalleryFormValues): string | null {
  if (!values.caption.trim()) return 'Caption wajib diisi.'
  if (!values.alt.trim()) return 'Alt text wajib diisi (untuk aksesibilitas).'
  if (!values.src.trim()) return 'Gambar wajib ada — unggah file atau isi URL gambar.'
  return null
}

/**
 * Store dummy galeri (localStorage) — pengganti sementara sampai backend tersedia.
 * API dibuat semirip mungkin dengan mutasi server (create/update/remove) agar
 * mudah diganti ke react-query + service API nantinya.
 */
export function useDummyGallery() {
  const [items, setItems] = useState<DummyGalleryItem[]>(loadItems)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage penuh / diblokir — abaikan, state in-memory tetap jalan.
    }
  }, [items])

  const create = useCallback((values: DummyGalleryFormValues) => {
    const now = new Date().toISOString()
    setItems((current) => [
      {
        uid: newUid(),
        src: values.src.trim(),
        alt: values.alt.trim(),
        caption: values.caption.trim(),
        variant: values.variant,
        createdAt: now,
        updatedAt: now,
      },
      ...current,
    ])
  }, [])

  const update = useCallback((uid: string, values: DummyGalleryFormValues) => {
    setItems((current) =>
      current.map((item) =>
        item.uid === uid
          ? {
              ...item,
              src: values.src.trim(),
              alt: values.alt.trim(),
              caption: values.caption.trim(),
              variant: values.variant,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    )
  }, [])

  const remove = useCallback((uid: string) => {
    setItems((current) => current.filter((item) => item.uid !== uid))
  }, [])

  const resetToSeed = useCallback(() => {
    setItems(seedItems())
  }, [])

  return { items, create, update, remove, resetToSeed }
}
