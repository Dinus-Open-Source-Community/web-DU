import { useMemo } from 'react'
import { DataCertificates } from '@/lib/dummyData'

export interface Certificate {
  uid: string
  imageUrl?: string
  title: string
  category: string
  courseName: string
  issuedDate: string
  credentialId: string
}

/**
 * Hook untuk fetch certificate berdasarkan UID
 * Data sumber: dummyData.tsx
 * Siap untuk API integration di masa depan
 */
export function useCertificate(uid: string) {
  const certificate = useMemo(() => {
    return DataCertificates.find((cert) => cert.uid === uid) || null
  }, [uid])

  return {
    certificate,
    isLoading: false,
    error: null,
    isFetched: true,
  }
}

/**
 * Hook untuk fetch list semua certificates
 */
export function useCertificates() {
  const certificates = useMemo(() => {
    return DataCertificates
  }, [])

  return {
    certificates,
    isLoading: false,
    error: null,
    isFetched: true,
  }
}

/**
 * Hook untuk search certificates berdasarkan query
 */
export function useCertificateSearch(query: string) {
  const results = useMemo(() => {
    if (!query.trim()) return DataCertificates
    const keyword = query.toLowerCase()
    return DataCertificates.filter((cert) => cert.title.toLowerCase().includes(keyword) || cert.category.toLowerCase().includes(keyword) || cert.courseName.toLowerCase().includes(keyword))
  }, [query])

  return {
    results,
    totalCount: results.length,
    isLoading: false,
  }
}
