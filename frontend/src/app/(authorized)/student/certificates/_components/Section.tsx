'use client'
import React, { useState, useEffect } from 'react'
import { Search, Download, Share2, Check } from 'lucide-react'
import { DataCertificates } from '@/lib/dummyData'
import { EmptyCourseIcon } from '@/components/ui/icons'
import { Pagination } from '@/components/ui/pagination'
import Image from 'next/image'

const DUMMY_CATEGORIES = ['Pengembangan Web', 'Desain UI/UX', 'Data Science & AI', 'Cybersecurity']

const ITEMS_PER_PAGE = 6

const Section = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedUid, setCopiedUid] = useState<string | null>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, searchQuery])

  // Process filter
  const filteredCertificates = DataCertificates.filter((cert) => {
    const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase()) || cert.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    const categoryHit = selectedCategories.length === 0 || selectedCategories.includes(cert.category)

    return matchesSearch && categoryHit
  })

  const totalPages = Math.ceil(filteredCertificates.length / ITEMS_PER_PAGE)
  const paginatedCertificates = filteredCertificates.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleShare = (uid: string) => {
    const shareUrl = `${window.location.origin}/certificate/${uid}`
    navigator.clipboard.writeText(shareUrl)
    setCopiedUid(uid)
    setTimeout(() => {
      setCopiedUid(null)
    }, 2000)
  }

  return (
    <section className="px-8 py-10 w-full flex flex-col gap-10">
      {/* Header & Search */}
      <div className="flex flex-col justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Sertifikat Saya</h1>
          <p className="text-slate-500 font-medium text-sm">Lihat, unduh, dan bagikan bukti penyelesaian kursus Anda secara profesional.</p>
        </div>

        {/* Search */}
        <div className="flex w-full md:max-w-3xl items-center gap-3 mt-1">
          <div className="relative flex w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari sertifikat atau nama kursus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl pl-11 pr-4 py-3.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>
          <button className="px-6 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/95 transition-all shrink-0 border border-transparent">
            Cari
          </button>
        </div>
      </div>

      {/* Content Area dengan Sidebar Layout */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Sidebar Filter */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
          <div className="sticky top-10 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <h3 className="font-semibold text-slate-800 mb-5 px-1 text-sm uppercase tracking-wide">Kategori</h3>
            <div className="flex flex-col gap-3.5 px-1">
              {DUMMY_CATEGORIES.map((cat) => {
                const isChecked = selectedCategories.includes(cat)
                return (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all duration-200 ${
                        isChecked ? 'bg-primary border-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'border-slate-300 bg-white group-hover:border-primary/50'
                      }`}>
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm transition-colors ${isChecked ? 'font-medium text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{cat}</span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
                      }}
                    />
                  </label>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 w-full min-w-0">
          {filteredCertificates.length > 0 ? (
            <div className="flex flex-col gap-10">
              <div
                key={`${selectedCategories.join(',')}-${searchQuery}-${currentPage}`}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out">
                {paginatedCertificates.map((cert) => (
                  <div key={cert.uid} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:border-slate-300 transition-colors duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="relative w-full aspect-[4/3] bg-slate-50 border-b border-slate-100 flex items-center justify-center p-6">
                      <Image 
                        src={cert.imageUrl || 'https://picsum.photos/seed/cert/800/600'} 
                        alt={cert.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-2">{cert.category}</p>
                      <h4 className="font-bold text-slate-900 leading-snug mb-1 line-clamp-1">{cert.title}</h4>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-1">{cert.courseName}</p>
                      <div className="flex items-center gap-2 mb-6">
                        <span className="text-xs font-medium text-slate-400">ID Kredensial: {cert.credentialId}</span>
                      </div>
                      
                      <div className="mt-auto flex gap-3">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 font-medium text-sm py-2 px-4 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all">
                          <Download className="w-4 h-4" />
                          Unduh
                        </button>
                        <button 
                          onClick={() => handleShare(cert.uid)}
                          className={`flex-1 flex items-center justify-center gap-2 font-medium text-sm py-2 px-4 rounded-xl transition-all border ${
                            copiedUid === cert.uid 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                          }`}>
                          {copiedUid === cert.uid ? (
                            <>
                              <Check className="w-4 h-4" />
                              Disalin
                            </>
                          ) : (
                            <>
                              <Share2 className="w-4 h-4" />
                              Bagikan
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-[2rem] shadow-[0_1px_2px_rgba(0,0,0,0.02)] animate-in fade-in zoom-in duration-500">
              <EmptyCourseIcon className="w-40 h-40 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ups, sertifikat tidak ditemukan</h3>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed">Kami tidak menemukan sertifikat yang sesuai dengan kata kunci atau filter kategori yang Anda pilih.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Section
