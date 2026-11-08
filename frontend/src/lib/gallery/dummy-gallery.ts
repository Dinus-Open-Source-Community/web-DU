import { useCallback, useEffect, useRef, useState } from 'react'

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
const inFlightGalleryRequests = new Map<
  string,
  Promise<Awaited<ReturnType<typeof fetchGalleries>>>
>()

function fetchGalleriesOnce(params: NonNullable<Parameters<typeof fetchGalleries>[0]>) {
  const key = JSON.stringify(params)
  const existingRequest = inFlightGalleryRequests.get(key)
  if (existingRequest) return existingRequest

  const request = fetchGalleries(params).finally(() => {
    inFlightGalleryRequests.delete(key)
  })
  inFlightGalleryRequests.set(key, request)
  return request
}

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
  per_page: number
  current_page: number
  total_pages: number
}

const DEFAULT_INFINITE_PER_PAGE = 5
let cachedFirstPageMeta: GalleryMeta | null = null

export function useDummyGallery(options: GalleryQueryOptions = {}) {
  const isInfinite = options.page === undefined
  const effectivePerPage = options.perPage ?? DEFAULT_INFINITE_PER_PAGE
  const isDefaultFirstPage =
    (options.page === undefined || options.page === 1) &&
    effectivePerPage === DEFAULT_INFINITE_PER_PAGE &&
    !options.search &&
    (!options.variant || options.variant === 'all')

  const [items, setItems] = useState<DummyGalleryItem[]>(() =>
    isDefaultFirstPage && cachedGalleryItems
      ? cachedGalleryItems.slice(0, DEFAULT_INFINITE_PER_PAGE)
      : [],
  )
  const [isLoading, setIsLoading] = useState<boolean>(
    () => !(isDefaultFirstPage && cachedGalleryItems && cachedGalleryItems.length > 0),
  )
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [meta, setMeta] = useState<GalleryMeta | undefined>(() =>
    isDefaultFirstPage && cachedFirstPageMeta ? cachedFirstPageMeta : undefined,
  )

  const currentPageRef = useRef<number>(options.page ?? 1)
  const totalPagesRef = useRef<number>(
    isDefaultFirstPage && cachedFirstPageMeta ? cachedFirstPageMeta.total_pages : 1,
  )
  const isFetchingRef = useRef<boolean>(false)

  const reload = useCallback(async () => {
    const targetPage = options.page ?? 1
    isFetchingRef.current = true
    if (!(isDefaultFirstPage && cachedGalleryItems && cachedGalleryItems.length > 0)) {
      setIsLoading(true)
    }
    try {
      const res = await fetchGalleriesOnce({
        page: targetPage,
        per_page: effectivePerPage,
        search: options.search || undefined,
        variant: options.variant && options.variant !== 'all' ? options.variant : undefined,
      })
      const mapped = (res.galleries ?? []).map(mapApiToGalleryItem)
      const nextMeta: GalleryMeta = {
        total: res.meta.total,
        per_page: res.meta.per_page,
        current_page: res.meta.current_page,
        total_pages: res.meta.total_pages,
      }
      if (isDefaultFirstPage) {
        cachedGalleryItems = mapped
        cachedFirstPageMeta = nextMeta
      }
      currentPageRef.current = res.meta.current_page ?? targetPage
      totalPagesRef.current = res.meta.total_pages ?? 1
      setItems(mapped)
      setMeta(nextMeta)
    } catch {
      // Keep existing state if backend request fails temporarily
    } finally {
      isFetchingRef.current = false
      setIsLoading(false)
    }
  }, [effectivePerPage, isDefaultFirstPage, options.page, options.search, options.variant])

  const loadMore = useCallback(async () => {
    if (!isInfinite || isFetchingRef.current) return
    if (currentPageRef.current >= totalPagesRef.current) return

    const nextPage = currentPageRef.current + 1
    isFetchingRef.current = true
    setIsLoadingMore(true)
    try {
      const res = await fetchGalleriesOnce({
        page: nextPage,
        per_page: effectivePerPage,
        search: options.search || undefined,
        variant: options.variant && options.variant !== 'all' ? options.variant : undefined,
      })
      const mapped = (res.galleries ?? []).map(mapApiToGalleryItem)
      currentPageRef.current = res.meta.current_page ?? nextPage
      totalPagesRef.current = res.meta.total_pages ?? totalPagesRef.current
      setItems((prev) => {
        const existingUids = new Set(prev.map((item) => item.uid))
        const appended = mapped.filter((item) => !existingUids.has(item.uid))
        const next = [...prev, ...appended]
        cachedGalleryItems = next
        return next
      })
      setMeta({
        total: res.meta.total,
        per_page: res.meta.per_page,
        current_page: res.meta.current_page,
        total_pages: res.meta.total_pages,
      })
    } catch {
      // Ignore transient loadMore error; user can scroll again to retry
    } finally {
      isFetchingRef.current = false
      setIsLoadingMore(false)
    }
  }, [effectivePerPage, isInfinite, options.search, options.variant])

  const hasMore = isInfinite && Boolean(meta && meta.current_page < meta.total_pages)

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

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    meta,
    reload,
    create,
    update,
    remove,
    resetToSeed,
  }
}
