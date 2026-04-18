import { useMemo } from 'react'
import { listCertificates } from '@/lib/data/repository'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import type { ICertificate } from '@/lib/types'

export type Certificate = ICertificate

function certificateList(): ICertificate[] {
  return isMockDataEnabled() ? listCertificates() : []
}

export function useCertificate(uid: string) {
  const certificate = useMemo(() => {
    return certificateList().find((cert) => cert.uid === uid) || null
  }, [uid])

  return {
    certificate,
    isLoading: false,
    error: null,
    isFetched: true,
  }
}

export function useCertificates() {
  const certificates = useMemo(() => certificateList(), [])

  return {
    certificates,
    isLoading: false,
    error: null,
    isFetched: true,
  }
}

export function useCertificateSearch(query: string) {
  const results = useMemo(() => {
    const list = certificateList()
    if (!query.trim()) return list
    const keyword = query.toLowerCase()
    return list.filter(
      (cert) =>
        cert.title.toLowerCase().includes(keyword) ||
        cert.category.toLowerCase().includes(keyword) ||
        cert.courseName.toLowerCase().includes(keyword)
    )
  }, [query])

  return {
    results,
    totalCount: results.length,
    isLoading: false,
  }
}
