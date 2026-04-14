'use client'
import React from 'react'
import { DataCertificates } from '@/lib/dummyData'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import { useParams, notFound } from 'next/navigation'
import GuestLayout from '@/components/layout/GuestLayout'
import CertificateDetail from './_components/CertificateDetail'

export default function CertificatePage() {
  const params = useParams()
  const uid = params?.uid as string

  const list = isMockDataEnabled() ? DataCertificates : []
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
