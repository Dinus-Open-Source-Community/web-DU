import { getApiErrorMessage, type AppErrorSource } from '@/services/api-error'

/** Pesan tampilan untuk pengguna — plain language, tanpa istilah teknis. */
export const Message = {
  common: {
    genericError: 'Terjadi kesalahan. Silakan coba lagi.',
    validationFailed: 'Data belum lengkap atau tidak valid.',
    loginRequired: 'Anda perlu masuk terlebih dahulu.',
  },
  auth: {
    loginSuccess: 'Berhasil masuk.',
    loginFailed: 'Gagal masuk. Periksa email dan kata sandi Anda.',
    registerSuccess: 'Pendaftaran berhasil. Selamat bergabung!',
    registerFailed: 'Pendaftaran gagal. Silakan coba lagi.',
    resetPasswordUnavailable:
      'Layanan atur ulang kata sandi belum tersedia. Hubungi admin jika perlu bantuan.',
    resetPasswordInvalid: 'Data atur ulang kata sandi tidak valid.',
    forgotPasswordInvalidEmail: 'Email tidak valid.',
    googleLoginFailed: 'Gagal masuk dengan Google. Silakan coba lagi.',
    googleLoginCancelled: 'Login Google dibatalkan.',
    googleLoginInvalidSession: 'Sesi login tidak valid. Silakan coba lagi.',
    googleLoginSessionExpired: 'Sesi login sudah berakhir. Silakan masuk lagi.',
    googleLoginServiceUnavailable: 'Layanan login sedang bermasalah. Coba lagi nanti.',
  },
  profile: {
    photoUpdated: 'Foto profil berhasil diubah.',
    photoUpdateFailed: 'Foto profil gagal diubah. Silakan coba lagi.',
    updated: 'Profil berhasil diperbarui.',
    updateFailed: 'Profil gagal diperbarui. Silakan coba lagi.',
    passwordUpdated: 'Kata sandi berhasil diubah.',
    passwordUpdateFailed: 'Kata sandi gagal diubah. Silakan coba lagi.',
  },
  payment: {
    created: 'Pembayaran berhasil dibuat.',
    processFailed: 'Pembayaran gagal diproses. Silakan coba lagi.',
  },
  invoice: {
    downloadSuccess: 'Tagihan berhasil diunduh.',
    downloadFailed: 'Tagihan gagal diunduh. Silakan coba lagi.',
    loginRequired: 'Anda perlu masuk untuk mengunduh tagihan.',
  },
  course: {
    createdDraft: 'Kursus disimpan sebagai draf. Terbitkan lewat tombol Terbit.',
    createFailed: 'Kursus gagal dibuat. Silakan coba lagi.',
    updated: 'Detail kursus berhasil diperbarui.',
    updateFailed: 'Detail kursus gagal diperbarui. Silakan coba lagi.',
    published: 'Kursus berhasil diterbitkan.',
    publishFailed: 'Kursus gagal diterbitkan. Silakan coba lagi.',
    deactivated: 'Kursus berhasil dinonaktifkan.',
    deactivateFailed: 'Kursus gagal dinonaktifkan. Silakan coba lagi.',
    mentorAssigned: 'Mentor berhasil ditugaskan ke kursus.',
    mentorAssignFailed: 'Mentor gagal ditugaskan. Silakan coba lagi.',
    mentorUnassigned: 'Mentor berhasil dilepas dari kursus.',
    mentorUnassignFailed: 'Mentor gagal dilepas. Silakan coba lagi.',
    coverInvalidType: 'Pilih gambar berformat JPG, PNG, atau WebP.',
    notFound: 'Kursus tidak ditemukan.',
  },
  module: {
    created: 'Modul berhasil dibuat.',
    createFailed: 'Modul gagal dibuat. Silakan coba lagi.',
    renamed: 'Nama modul berhasil diperbarui.',
    renameFailed: 'Nama modul gagal diperbarui. Silakan coba lagi.',
    deleted: 'Modul berhasil dihapus.',
    deleteFailed: 'Modul gagal dihapus. Silakan coba lagi.',
    deleteBlockedUnsavedLessons: 'Simpan semua perubahan materi di modul ini sebelum menghapus.',
    deleteBlockedActiveLesson: 'Simpan materi yang sedang diedit sebelum menghapus modul.',
    courseNotFound: 'Kursus tidak ditemukan.',
  },
  lesson: {
    saved: 'Materi berhasil disimpan.',
    saveFailed: 'Materi gagal disimpan. Silakan coba lagi.',
    created: 'Materi berhasil dibuat.',
    createFailed: 'Materi gagal dibuat. Silakan coba lagi.',
    updated: 'Materi berhasil diperbarui.',
    updateFailed: 'Materi gagal diperbarui. Silakan coba lagi.',
    renamed: 'Nama materi berhasil diperbarui.',
    renameFailed: 'Nama materi gagal diperbarui. Silakan coba lagi.',
    deleted: 'Materi berhasil dihapus.',
    deleteFailed: 'Materi gagal dihapus. Silakan coba lagi.',
    deleteBlockedUnsaved: 'Simpan atau batalkan perubahan materi ini sebelum menghapus.',
  },
  assignment: {
    titleRequired: 'Judul tugas wajib diisi.',
    deadlineRequired: 'Batas waktu wajib diisi dengan benar.',
    deadlineInvalid: 'Batas waktu tidak valid.',
    submitTypeRequired: 'Aktifkan minimal satu cara pengumpulan untuk peserta.',
    submitMethodRequired: 'Aktifkan minimal satu metode pengumpulan jawaban.',
    textDescriptionRequired: 'Deskripsi tugas wajib diisi.',
    fileDescriptionRequiresUpload: 'Deskripsi file hanya bisa wajib jika unggah file diaktifkan.',
    resubmitCountRequired:
      'Jumlah pengumpulan ulang wajib diisi (minimal 1) jika pengumpulan ulang diaktifkan.',
    quizQuestionRequired: 'Tambahkan minimal satu soal kuis.',
    created: 'Tugas berhasil dibuat.',
    createFailed: 'Tugas gagal dibuat. Silakan coba lagi.',
    updated: 'Tugas berhasil diperbarui.',
    updateFailed: 'Tugas gagal diperbarui. Silakan coba lagi.',
    updateNotAllowed: 'Tugas ini tidak dapat diperbarui.',
    saved: 'Tugas berhasil disimpan.',
    saveFailed: 'Tugas gagal disimpan. Silakan coba lagi.',
    removedFromLesson: 'Tugas dihapus dari materi ini.',
    removedFromServer: 'Tugas dihapus.',
    deleteFailed: 'Tugas gagal dihapus. Silakan coba lagi.',
    saveLessonFirst: 'Simpan materi terlebih dahulu sebelum menyimpan tugas.',
    submitted: 'Tugas berhasil dikumpulkan.',
    reviewSaved: 'Penilaian berhasil disimpan.',
    reviewSaveFailed: 'Penilaian gagal disimpan. Silakan coba lagi.',
    answerAllQuizQuestions: 'Jawab semua pertanyaan sebelum mengumpulkan.',
    fileNotAllowedForQuiz: 'Unggahan file tidak diizinkan untuk kuis.',
    noActiveSubmitMethod: 'Tugas ini belum memiliki metode pengumpulan yang aktif.',
    plainTextNotAllowed: 'Jawaban teks biasa tidak diizinkan untuk tugas ini.',
    richTextNotAllowed: 'Jawaban teks berformat tidak diizinkan untuk tugas ini.',
    fileUploadNotAllowed: 'Unggahan file tidak diizinkan untuk tugas ini.',
    fileDescriptionRequired: 'Deskripsi file wajib diisi.',
    answerOrFileRequired: 'Isi jawaban atau unggah file terlebih dahulu.',
    closed: 'Tugas sudah ditutup.',
    notPublished: 'Tugas belum diterbitkan.',
    deadlinePassed: 'Batas waktu pengumpulan sudah lewat.',
    attemptsExhausted: 'Batas percobaan pengumpulan sudah habis.',
    resubmitNotAllowed: 'Pengumpulan ulang tidak diizinkan untuk tugas ini.',
  },
  grade: {
    saved: 'Penilaian berhasil disimpan.',
    saveFailed: 'Penilaian gagal disimpan. Silakan coba lagi.',
  },
  attendance: {
    updated: 'Kehadiran berhasil diperbarui.',
    updateFailed: 'Kehadiran gagal diperbarui. Silakan coba lagi.',
    noteDeleted: 'Catatan kehadiran berhasil dihapus.',
    noteDeleteFailed: 'Catatan kehadiran gagal dihapus. Silakan coba lagi.',
  },
  review: {
    replySent: 'Balasan ulasan berhasil dikirim.',
    replyFailed: 'Balasan ulasan gagal dikirim. Silakan coba lagi.',
  },
  qa: {
    replySent: 'Balasan tanya jawab berhasil dikirim.',
    replyFailed: 'Balasan tanya jawab gagal dikirim. Silakan coba lagi.',
  },
  userManage: {
    deleted: 'Pengguna berhasil dihapus.',
    deleteFailed: 'Pengguna gagal dihapus. Silakan coba lagi.',
    roleUpdateFailed: 'Peran pengguna gagal diperbarui. Silakan coba lagi.',
  },
  courseEdit: {
    saveAndContinue: 'Perubahan disimpan. Melanjutkan navigasi.',
  },
} as const

const GOOGLE_OAUTH_ERROR_MAP: Record<string, string> = {
  access_denied: Message.auth.googleLoginCancelled,
  invalid_token: Message.auth.googleLoginInvalidSession,
  token_expired: Message.auth.googleLoginSessionExpired,
  oauth_failed: Message.auth.googleLoginFailed,
  server_error: Message.auth.googleLoginServiceUnavailable,
}

export function getGoogleOAuthErrorMessage(rawError: string): string {
  const normalized = rawError.trim().toLowerCase()
  return GOOGLE_OAUTH_ERROR_MAP[normalized] ?? Message.auth.googleLoginFailed
}

export function messageUserRoleChanged(roleLabel: string): string {
  return `Peran diubah menjadi ${roleLabel}.`
}

export function messageCourseMasterAdded(label: string): string {
  return `${label} berhasil ditambahkan.`
}

export function messageCourseMasterAddFailed(label: string): string {
  return `${label} gagal ditambahkan. Silakan coba lagi.`
}

export function messageCourseMasterUpdated(label: string): string {
  return `${label} berhasil diperbarui.`
}

export function messageCourseMasterUpdateFailed(label: string): string {
  return `${label} gagal diperbarui. Silakan coba lagi.`
}

export function messageCourseMasterDeleted(label: string): string {
  return `${label} berhasil dihapus.`
}

export function messageCourseMasterDeleteFailed(label: string): string {
  return `${label} gagal dihapus. Silakan coba lagi.`
}

export function resolveActionError(error: Error | null | undefined, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  return fallback
}

export function messageInstructionAttachmentNameRequired(index: number): string {
  return `Nama lampiran instruksi #${index} wajib diisi.`
}

export function messageInstructionAttachmentLinkRequired(index: number): string {
  return `Link lampiran instruksi #${index} wajib diisi.`
}

export function messageInstructionAttachmentLinkInvalid(index: number): string {
  return `Link lampiran instruksi #${index} tidak valid.`
}

export function resolveApiActionError(error: AppErrorSource, fallback: string): string {
  return getApiErrorMessage(error, fallback)
}
