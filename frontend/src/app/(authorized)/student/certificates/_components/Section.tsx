'use client'
import React, { useState, useEffect } from 'react'
import { Download, Share2, Check } from 'lucide-react'
import { listCertificates } from '@/lib/data/repository'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import { EmptyCourseIcon } from '@/components/ui/icons'
import { Pagination } from '@/components/ui/pagination'
import { SearchForm } from '@/components/ui/SearchForm'
import { FilterCheckboxPanel } from '@/components/ui/FilterCheckboxPanel'
import Image from 'next/image'

const DUMMY_CATEGORIES = ['Pengembangan Web', 'Desain UI/UX', 'Data Science & AI', 'Cybersecurity']

const ITEMS_PER_PAGE = 6

const Section = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedUid, setCopiedUid] = useState<string | null>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, searchQuery])

  const certificateRows = isMockDataEnabled() ? listCertificates() : []

  const filteredCertificates = certificateRows.filter((cert) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || cert.title.toLowerCase().includes(q) || cert.courseName.toLowerCase().includes(q)
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

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
  }

  return (
    <section className="flex w-full flex-col gap-10 px-8 py-10">
      <div className="flex flex-col justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Sertifikat Saya</h1>
          <p className="text-sm font-medium text-slate-500">Lihat, unduh, dan bagikan bukti penyelesaian kursus Anda secara profesional.</p>
        </div>

        <SearchForm
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => setSearchQuery(searchInput)}
          placeholder="Cari sertifikat atau nama kursus..."
        />
      </div>

      <div className="flex flex-col items-start gap-10 lg:flex-row">
        <FilterCheckboxPanel
          title="Kategori"
          options={DUMMY_CATEGORIES}
          selected={selectedCategories}
          onToggle={toggleCategory}
          innerClassName="border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        />

        <div className="min-w-0 flex-1">
          {filteredCertificates.length > 0 ? (
            <div className="flex flex-col gap-10">
              <div
                key={`${selectedCategories.join(',')}-${searchQuery}-${currentPage}`}
                className="grid grid-cols-1 gap-6 duration-500 ease-out animate-in fade-in slide-in-from-bottom-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {paginatedCertificates.map((cert) => (
                  <div
                    key={cert.uid}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-300 hover:border-slate-300">
                    <div className="relative flex aspect-[4/3] w-full items-center justify-center border-b border-slate-100 bg-slate-50 p-6">
                      <Image src={cert.imageUrl || 'https://picsum.photos/seed/cert/800/600'} alt={cert.title} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary/80">{cert.category}</p>
                      <h4 className="mb-1 line-clamp-1 font-bold leading-snug text-slate-900">{cert.title}</h4>
                      <p className="mb-4 line-clamp-1 text-sm text-slate-500">{cert.courseName}</p>
                      <div className="mb-6 flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">ID Kredensial: {cert.credentialId}</span>
                      </div>

                      <div className="mt-auto flex gap-3">
                        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 px-4 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900">
                          <Download className="h-4 w-4" />
                          Unduh
                        </button>
                        <button
                          onClick={() => handleShare(cert.uid)}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 px-4 text-sm font-medium transition-all ${
                            copiedUid === cert.uid
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}>
                          {copiedUid === cert.uid ? (
                            <>
                              <Check className="h-4 w-4" />
                              Disalin
                            </>
                          ) : (
                            <>
                              <Share2 className="h-4 w-4" />
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
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-white py-24 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] duration-500 animate-in fade-in zoom-in">
              <EmptyCourseIcon className="mb-6 h-40 w-40" />
              <h3 className="mb-2 text-xl font-bold text-slate-900">Ups, sertifikat tidak ditemukan</h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                Kami tidak menemukan sertifikat yang sesuai dengan kata kunci atau filter kategori yang Anda pilih.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Section
