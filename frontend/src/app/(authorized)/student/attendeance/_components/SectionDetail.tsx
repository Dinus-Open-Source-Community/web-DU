'use client'
import React, { useState } from 'react'
import { CourseAttendanceData } from '@/lib/dummyData'
import { AttendanceStatus } from '@/lib/types'
import { User, CheckCircle2, Clock, XCircle, Info, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const SectionDetail = () => {
  const params = useParams()
  const uid = params.uid as string
  const selectedCourse = CourseAttendanceData.find((c) => c.courseId === uid)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [permissionReason, setPermissionReason] = useState('')
  const [permissionDate, setPermissionDate] = useState('')

  if (!selectedCourse) {
    return (
      <section className="px-5 md:px-8 py-20 w-full flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Kelas tidak ditemukan</h2>
        <Link href="/student/attendeance" className="text-primary hover:underline font-medium">
          Kembali ke Daftar Kelas
        </Link>
      </section>
    )
  }

  const handleOpenModal = () => {
    setPermissionDate('')
    setPermissionReason('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmitPermission = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(false)
  }

  const handleHadir = () => {
    // Logic for Hadir action
    alert('Berhasil mengisi presensi hadir!')
  }

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'Hadir':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200'
      case 'Izin':
        return 'text-amber-700 bg-amber-50 border-amber-200'
      case 'Alpha':
        return 'text-rose-700 bg-rose-50 border-rose-200'
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200'
    }
  }

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'Hadir':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />
      case 'Izin':
        return <Clock className="w-5 h-5 text-amber-600" />
      case 'Alpha':
        return <XCircle className="w-5 h-5 text-rose-600" />
      default:
        return <Info className="w-5 h-5 text-slate-600" />
    }
  }

  return (
    <section className="px-5 md:px-8 py-10 w-full flex flex-col gap-10">
      <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Detail Header */}
        <div className="flex flex-col gap-4 pb-6 border-b border-slate-100">
          <Link href="/student/attendeance" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Kelas
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight leading-tight">{selectedCourse.courseName}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <User className="w-4 h-4" />
                <span>{selectedCourse.author.name}</span>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0 shrink-0">
              <button
                onClick={handleHadir}
                className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                Hadir
              </button>
              <button
                onClick={handleOpenModal}
                className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-sm border border-transparent">
                Ajukan Izin
              </button>
            </div>
          </div>
        </div>

        {/* Overview Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Ringkasan Kehadiran</h2>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2 pt-2">
              <span className="text-sm font-medium text-slate-600">Persentase Kehadiran</span>
              <span className="text-2xl font-bold text-slate-900">{selectedCourse.summary.progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-50 border border-slate-100 rounded-full h-3 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${selectedCourse.summary.progressPercentage}%` }}></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-sm text-slate-500 mb-1">Total Pertemuan</span>
              <span className="text-xl font-bold text-slate-800">{selectedCourse.summary.totalMeetings}</span>
            </div>
            <div className="flex flex-col p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
              <span className="text-sm text-emerald-600 mb-1">Hadir</span>
              <span className="text-xl font-bold text-emerald-700">{selectedCourse.summary.hadir}</span>
            </div>
            <div className="flex flex-col p-4 rounded-xl border border-amber-100 bg-amber-50/50">
              <span className="text-sm text-amber-600 mb-1">Izin</span>
              <span className="text-xl font-bold text-amber-700">{selectedCourse.summary.izin}</span>
            </div>
            <div className="flex flex-col p-4 rounded-xl border border-rose-100 bg-rose-50/50">
              <span className="text-sm text-rose-600 mb-1">Alpha</span>
              <span className="text-xl font-bold text-rose-700">{selectedCourse.summary.alpha}</span>
            </div>
          </div>
        </div>

        {/* Detail List */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-slate-800 px-1">Riwayat Pertemuan</h3>
          <div className="flex flex-col gap-3">
            {selectedCourse.records.map((record) => (
              <div
                key={record.uid}
                className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)] gap-4">
                <div className="flex items-start md:items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 group-hover:bg-primary/5 transition-colors">
                    {getStatusIcon(record.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Pertemuan {record.meetingNumber}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 leading-snug">{record.topic}</h4>
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{record.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2.5 shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(record.status)}`}>{record.status}</span>
                  {record.notes && <span className="text-xs text-slate-400 italic max-w-xs text-left md:text-right leading-relaxed">Catatan: {record.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------- MODAL IZIN -------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div className="pr-4">
                <h3 className="text-lg font-bold text-slate-900">Mengajukan Izin</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">{selectedCourse.courseName}</p>
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
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
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
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary resize-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]"></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border border-transparent">
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-all outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
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

export default SectionDetail
