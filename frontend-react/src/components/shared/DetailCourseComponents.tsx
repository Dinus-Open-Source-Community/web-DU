import { useEffect, useState } from 'react'
import { ClipboardList, Eye, Pencil, Sparkles } from 'lucide-react'
// import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import type { IMentorCourseStudent } from '../../lib/types/course'
import { Button } from '../ui/button'
import { ConfirmDialog } from './ConfirmDialog'
import { FormatRupiah } from '../../lib/func/func'
import { CourseParticipantsSection } from './CourseParticipation'
import type { CourseDetailItem } from '../../lib/types/api'
import { ROUTES } from '../../lib/routes.ts'

type CourseHubClientProps = {
  courseUid: string
  dataCourse: CourseDetailItem[]
  dataStudents: IMentorCourseStudent[]
  // dataUpdateStatus: Record<string, unknown>
  role?: 'mentor' | 'admin'
}

export function DetailCourse({ courseUid, role = 'mentor', dataCourse, dataStudents }: CourseHubClientProps) {
  const isAdmin = role === 'admin'
  const [course, setCourse] = useState<CourseDetailItem | null>(null)
  const [isConfirm, setIsConfirm] = useState(false)

  const mapCourse = (data: CourseDetailItem): Partial<CourseDetailItem> => {
    return {
      uid: (data.uid as string) ?? '',
      title: (data.title as string) ?? '',
      subtitle: (data.subtitle as string) ?? '',
      description: (data.description as string) ?? '',
      cover_url: data.cover_url as string,
      thumbnail_url: (data.thumbnail_url as string) ?? '',
      is_published: Boolean(data.is_published),
      updated_at: (data.updated_at as string) ?? '',
      category: data.category,
      level: (data.level as CourseDetailItem['level']) ?? undefined,
      price: data.price,
      price_strike: data.price_strike,
      what_you_learn: Array.isArray(data.what_you_learn) ? data.what_you_learn.map(String) : [],
    }
  }

  useEffect(() => {
    if (Array.isArray(dataCourse) && dataCourse.length > 0) {
      setCourse(mapCourse(dataCourse[0]) as CourseDetailItem)
      return
    }

    setCourse(null)
  }, [dataCourse])

  const handlePublish = async () => {
    if (!course || !isAdmin) return
    setIsConfirm(true)

    // void dataUpdateStatus.mutateAsync()
    //   .then(() => {
    //     toast.success('Kursus berhasil dipublikasikan.')
    //     setCourse((prev) => (prev ? { ...prev, published: true } : prev))
    //   })
    //   .catch((error: unknown) => {
    //     toast.error(error instanceof Error ? error.message : 'Gagal mempublikasikan kursus.')
    //   })
  }

  if (!course) {
    return (
      <section className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-sm text-slate-600">Kursus tidak ditemukan.</p>
        <Button asChild variant="outline" className="rounded-xl shadow-none">
          <Link to={isAdmin ? '/admin/courses' : '/mentor/courses'}>Kembali ke daftar</Link>
        </Button>
      </section>
    )
  }

  const categoryLabel = typeof course.category === 'string' ? course.category : (course.category?.name ?? '')
  const hasDetails = categoryLabel || /*course.classType ||*/ course.price != null || course.level
  const priceLabel = course.price != null ? (course.price === 0 ? 'Gratis' : FormatRupiah(course.price)) : null
  // const moduleCount = course.moduleCount

  const actions = [
    {
      icon: Pencil,
      label: 'Edit Konten',
      description: 'Buka editor modul untuk mengedit materi kursus.',
      href: `${isAdmin ? '/admin' : '/mentor'}/courses/${courseUid}/edit`,
      accent: 'group-hover:bg-blue-50 group-hover:text-blue-600',
    },
    {
      icon: Eye,
      label: 'Preview Materi',
      description: 'Lihat tampilan materi seperti yang dilihat peserta.',
      href: `/course/${courseUid}/view`,
      accent: 'group-hover:bg-violet-50 group-hover:text-violet-600',
    },
    {
      icon: isAdmin ? ClipboardList : ClipboardList,
      label: isAdmin ? 'Reviews Peserta' : 'Kelola Tugas',
      description: isAdmin ? 'Lihat review & Q&A peserta pada halaman terpisah.' : 'Buat, sunting tugas, dan tinjau kiriman peserta.',
      href: isAdmin ? ROUTES.admin.reviewsAndQa(courseUid) : `/mentor/courses/${courseUid}/assignments`,
      accent: isAdmin ? 'group-hover:bg-emerald-50 group-hover:text-emerald-600' : 'group-hover:bg-amber-50 group-hover:text-amber-600',
    },
  ]

  const infoRows = [
    { label: 'Status', value: course.is_published ? 'Published' : 'Draft' },
    { label: 'Kategori', value: categoryLabel || '-' },
    // { label: 'Tipe Kelas', value: course.classType || '-' },
    { label: 'Level', value: course.level || '-' },
    { label: 'Harga', value: priceLabel || '-' },
    // { label: 'Total Modul', value: moduleCount.toString() },
  ]

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        {course.cover_url && (
          <div className="absolute inset-0 opacity-[0.04]">
            <img src={course.cover_url} width={384} height={256} loading="lazy" alt={course.title} className="h-full w-full object-cover blur-2xl" />
          </div>
        )}

        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:gap-6">
          {course.thumbnail_url && (
            <div className="shrink-0 overflow-hidden rounded-xl border border-slate-200/60 shadow-xs">
              <img src={course.thumbnail_url} width={384} height={256} loading="lazy" alt={course.title} className="h-32 w-48 object-cover sm:h-36 sm:w-52" />
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{course.title}</h1>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{course.subtitle}</p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                  course.is_published ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'
                }`}>
                {course.is_published ? 'Published' : 'Draft'}
              </span>
            </div>

            {hasDetails && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {categoryLabel && <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">{categoryLabel}</span>}
                {/* {course.classType && <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">{course.classType}</span>} */}
                {course.level && <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">{course.level}</span>}
                {priceLabel && <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700">{priceLabel}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-8">
          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Informasi Course</h2>
                <p className="mt-1 text-sm text-slate-500">Ringkasan detail utama course untuk kebutuhan monitoring dan pengelolaan.</p>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {infoRows.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200/70 bg-slate-50/40 px-4 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{item.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>

        <aside className="xl:col-span-4">
          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 xl:sticky xl:top-6">
            <h2 className="text-base font-semibold text-slate-900">Opsi Pengelolaan</h2>
            <p className="mt-1 text-sm text-slate-500">Akses cepat untuk edit konten, preview materi, dan pengelolaan lanjutan.</p>

            <div className="mt-4 flex flex-col gap-3">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="group flex items-start gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition-colors hover:border-slate-300/90">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors ${action.accent}`}>
                    <action.icon className="size-5" />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
            {!course.is_published && isAdmin ? (
              <div className="mt-5 border-t border-slate-200 pt-5">
                <Button type="button" className="h-10 w-full gap-1.5 rounded-xl text-sm font-semibold" onClick={() => void handlePublish()}>
                  <Sparkles className="size-4" />
                  Publish Kursus
                </Button>
              </div>
            ) : null}
          </article>
        </aside>
      </div>

      <CourseParticipantsSection courseUid={courseUid} studentsData={dataStudents} />

      {isConfirm && (
        <ConfirmDialog
          title="Publikasikan kursus?"
          description="Kursus akan ditandai aktif dan bisa diakses peserta."
          confirmLabel="Publish"
          onOpenChange={setIsConfirm}
          open={isConfirm}
          onConfirm={handlePublish}
          onCancel={() => setIsConfirm(false)}
        />
      )}
    </section>
  )
}
