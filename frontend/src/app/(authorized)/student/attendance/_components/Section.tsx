'use client'
import React, { useState } from 'react'
import { listAttendance } from '@/lib/data/repository'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import { ICourseAttendance } from '@/lib/types'
import { User, XCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const Section = () => {
  const attendanceRows = isMockDataEnabled() ? listAttendance() : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [permissionReason, setPermissionReason] = useState('')
  const [permissionDate, setPermissionDate] = useState('')
  const [activeCourseForModal, setActiveCourseForModal] = useState<ICourseAttendance | null>(null)

  const handleOpenModal = (course: ICourseAttendance, e?: React.MouseEvent) => {
    if (e) e.preventDefault() // prevent navigating to Link
    setActiveCourseForModal(course)
    setPermissionDate('')
    setPermissionReason('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setActiveCourseForModal(null)
  }

  const handleSubmitPermission = (e: React.FormEvent) => {
    e.preventDefault()
    // Logic to handle permission
    setIsModalOpen(false)
    setActiveCourseForModal(null)
  }

  const handleHadir = (e: React.MouseEvent) => {
    e.preventDefault() // prevent navigating to Link
    // Logic for Hadir action
  }

  return (
    <section className="px-5 md:px-8 py-10 w-full flex flex-col gap-10">
      <div className="flex flex-col gap-8">
        <div className="pb-4 border-b border-slate-100 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Absensi Kelas</h1>
          <p className="text-slate-500 font-medium text-sm">Pilih kelas untuk melihat detail absensi Anda atau lakukan presensi cepat.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {attendanceRows.map((course) => (
            <Link
              href={`/student/attendance/${course.courseId}`}
              key={course.courseId}
              className="group cursor-pointer bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors shadow-xs flex flex-col block">
              <div className="relative w-full aspect-[2/1] bg-slate-50 border-b border-slate-100">
                <Image src={course.image || 'https://picsum.photos/seed/placeholder/600/400'} alt={course.courseName} fill className="object-cover" />
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">{course.courseName}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 line-clamp-1">
                    <User className="w-3.5 h-3.5" />
                    {course.author.name}
                  </p>
                </div>

                <div className="mt-auto flex flex-col gap-5 pt-4 border-t border-slate-100">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500">Progres Kehadiran</span>
                      <span className="text-slate-800">{course.summary.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-[width] duration-200 ease-out" style={{ width: `${course.summary.progressPercentage}%` }}></div>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button onClick={(e) => handleHadir(e)} className="flex-1 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/80 transition-colors">
                      Hadir
                    </button>
                    <button
                      onClick={(e) => handleOpenModal(course, e)}
                      className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors">
                      Ajukan Izin
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* -------------------- MODAL IZIN -------------------- */}
      {isModalOpen && activeCourseForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-sm w-full max-w-md border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div className="pr-4">
                <h3 className="text-lg font-bold text-slate-900">Mengajukan Izin</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">{activeCourseForModal.courseName}</p>
              </div>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1 shrink-0 self-start mt-0.5" aria-label="Tutup modal">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPermission} className="p-6">
              <div className="w-full mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Izin</label>
                <input
                  type="date"
                  required
                  value={permissionDate}
                  onChange={(e) => setPermissionDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>

              <div className="w-full mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Alasan Izin</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ceritakan alasan Anda dengan jelas..."
                  value={permissionReason}
                  onChange={(e) => setPermissionReason(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-none shadow-xs"></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border border-transparent">
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-colors outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  Kirim Izin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Section
