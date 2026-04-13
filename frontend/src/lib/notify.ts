import { toast } from "sonner"

export function notifySaved(message = "Perubahan disimpan.") {
  toast.success(message)
}

export function notifyCreated(message = "Berhasil dibuat.") {
  toast.success(message)
}

export function notifyUpdated(message = "Berhasil diperbarui.") {
  toast.success(message)
}

export function notifyDeleted(message = "Berhasil dihapus.") {
  toast.success(message)
}

export function notifyError(message = "Terjadi kesalahan. Coba lagi.") {
  toast.error(message)
}

export function notifyInfo(message: string) {
  toast.message(message)
}

export function notifyPublished(message = "Kursus berhasil dipublikasikan.") {
  toast.success(message)
}

export function notifyReviewSaved(message = "Review disimpan.") {
  toast.success(message)
}

export function notifyCourseDraft(message = "Kursus dibuat. Lanjut ke editor.") {
  toast.success(message)
}
