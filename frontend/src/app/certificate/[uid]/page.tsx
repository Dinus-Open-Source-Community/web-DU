'use client'
import React from 'react'
import { DataCertificates } from '@/lib/dummyData'
import Image from 'next/image'
import { CheckCircle2, Calendar, BookOpen, BadgeCheck } from 'lucide-react'
import { useParams, notFound } from 'next/navigation'
import GuestLayout from '@/components/layout/GuestLayout'

export default function CertificatePage() {
  const params = useParams()
  const uid = params?.uid as string

  const certificate = DataCertificates.find((cert) => cert.uid === uid)

  if (!certificate) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24  selection:bg-primary/20">
      <GuestLayout>
        <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12 items-center">
          {/* Certificate Image (Top) */}
          <div className="w-full bg-white p-4 md:p-6 rounded-[2rem] border border-slate-200 relative">
            <div className="w-full relative aspect-[1.414/1] md:aspect-[16/9] lg:aspect-[21/9] bg-slate-50 overflow-hidden rounded-xl border border-slate-100">
              <Image src={certificate.imageUrl || 'https://picsum.photos/seed/cert/1200/900'} alt={`Certificate for ${certificate.title}`} fill className="object-cover" priority />
            </div>

            <div className="absolute top-0 right-8 md:-top-4 md:-right-4 bg-emerald-50 text-emerald-600 p-2 rounded-2xl border border-emerald-200 flex items-center gap-2 transform -translate-y-1/2 md:translate-y-0">
              <BadgeCheck className="w-6 h-6" />
              <span className="pr-2 font-bold text-sm">Terverifikasi</span>
            </div>
          </div>

          {/* Certificate Details (Bottom) */}
          <div className="w-full max-w-3xl flex flex-col items-center text-center gap-6">
            <div>
              <p className="text-sm font-bold text-primary tracking-widest uppercase mb-4">{certificate.category}</p>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-[1.2] mb-6">{certificate.title}</h1>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Dipersembahkan kepada <span className="font-semibold text-slate-900">Budi Setiawan</span> atas keberhasilannya menyelesaikan program pembelajaran komprehensif.
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-left">
              <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Program Kursus</p>
                </div>
                <p className="font-semibold text-slate-900 leading-snug">{certificate.courseName}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Diterbitkan Pada</p>
                </div>
                <p className="font-semibold text-slate-900 leading-snug">{certificate.issuedDate}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ID Kredensial</p>
                </div>
                <p className="font-mono font-semibold text-slate-900 break-all leading-snug">{certificate.credentialId}</p>
              </div>
            </div>
          </div>
        </main>
      </GuestLayout>
    </div>
  )
}
