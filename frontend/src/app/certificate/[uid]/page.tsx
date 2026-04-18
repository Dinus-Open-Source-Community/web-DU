'use client'
import React from 'react'
import { listCertificates } from '@/lib/data/repository'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import { useParams, notFound } from 'next/navigation'
import GuestLayout from '@/components/layout/GuestLayout'
import CertificateDetail from './_components/CertificateDetail'

export default function CertificatePage() {
  const params = useParams()
  const uid = params?.uid as string

  const list = isMockDataEnabled() ? listCertificates() : []
  const certificate = list.find((cert) => cert.uid === uid)

  if (!certificate) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 selection:bg-primary/20">
      <GuestLayout>
        <CertificateDetail certificate={certificate} />
      </GuestLayout>
    </div>
  )
}
