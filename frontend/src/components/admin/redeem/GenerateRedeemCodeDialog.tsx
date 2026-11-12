import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  Copy,
  Ticket,
  Search,
  User,
  BookOpen,
  Calendar,
  AlertCircle,
  X,
  ChevronDown,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DialogScrollArea } from '@/components/ui/dialog-scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CourseLevelLabel } from '@/components/shared/CourseLevel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ICourseItem } from '@/lib/types/data/course'
import { useAuth } from '@/providers/auth-provider'
import { useCourseDetail, useInfiniteCourses } from '@/hooks/use-course'
import {
  useGenerateRedeemCode,
  useRedeemCandidateStudents,
} from '@/hooks/use-redeem-codes'
import type { ICandidateStudentUser, IRedeemCodeItem } from '@/services/redeem'
import { cn } from '@/lib/utils'

interface GenerateRedeemCodeDialogProps {
  initialCourseUid?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  triggerLabel?: string
  triggerClassName?: string
  onSuccess?: (code: IRedeemCodeItem) => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

type CourseOption = Pick<
  ICourseItem,
  'title' | 'level' | 'subtitle' | 'cover_url' | 'thumbnail_url'
>

function CourseOptionContent({ course }: { course: CourseOption }) {
  const cover = course.cover_url || course.thumbnail_url

  return (
    <span className="flex min-w-0 flex-1 items-center gap-3">
      <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-900/10 bg-paper-paper">
        <BookOpen className="size-4 text-ink-400" />
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink-900">{course.title}</span>
        <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-ink-500">
          <CourseLevelLabel level={course.level} compact className="shrink-0 text-[11px] text-ink-600" />
          {course.subtitle ? (
            <>
              <span className="text-ink-300">•</span>
              <span className="truncate">{course.subtitle}</span>
            </>
          ) : null}
        </span>
      </span>
    </span>
  )
}

export function GenerateRedeemCodeDialog({
  initialCourseUid,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  triggerLabel = 'Generate Kode Redeem',
  triggerClassName,
  onSuccess,
}: GenerateRedeemCodeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (isControlled) {
        controlledOnOpenChange?.(nextOpen)
      } else {
        setInternalOpen(nextOpen)
      }
    },
    [isControlled, controlledOnOpenChange],
  )

  const { profile } = useAuth()
  const isMentor = profile?.role === 'mentor'

  // Form State
  const [courseUid, setCourseUid] = useState(initialCourseUid ?? '')
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false)
  const [courseSearchInput, setCourseSearchInput] = useState('')
  const [debouncedCourseSearch, setDebouncedCourseSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<ICandidateStudentUser | null>(null)
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false)
  const [studentSearchInput, setStudentSearchInput] = useState('')
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState('')

  const [prefix, setPrefix] = useState('')
  const [maxUses, setMaxUses] = useState(1)
  const [expiresAt, setExpiresAt] = useState('')
  const expiresAtInputRef = useRef<HTMLInputElement>(null)
  const [isActive, setIsActive] = useState(true)

  const [copied, setCopied] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<IRedeemCodeItem | null>(null)

  // Debounce course search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCourseSearch(courseSearchInput.trim())
    }, 300)
    return () => clearTimeout(handler)
  }, [courseSearchInput])

  // Debounce student search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStudentSearch(studentSearchInput.trim())
    }, 300)
    return () => clearTimeout(handler)
  }, [studentSearchInput])

  // Courses list (infinite scroll + server-side title search)
  const coursesQuery = useInfiniteCourses(
    {
      per_page: 10,
      title: debouncedCourseSearch || undefined,
      mentor_id: isMentor ? profile?.uid : undefined,
    },
    { enabled: open },
  )
  const courses = coursesQuery.courses
  const initialCourseQuery = useCourseDetail(initialCourseUid ?? '', {
    enabled: open && Boolean(initialCourseUid),
  })
  const isCoursesLoading =
    coursesQuery.isLoading || (Boolean(initialCourseUid) && initialCourseQuery.isLoading)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (initialCourseUid) {
        setCourseUid(initialCourseUid)
      }
    } else {
      // Clear result and transient states when closed
      setGeneratedResult(null)
      setCopied(false)
      setIsCourseDropdownOpen(false)
      setCourseSearchInput('')
      setDebouncedCourseSearch('')
      setIsStudentDropdownOpen(false)
      setStudentSearchInput('')
      setDebouncedStudentSearch('')
      if (!initialCourseUid) {
        setCourseUid('')
      }
      setSelectedStudent(null)
      setPrefix('')
      setMaxUses(1)
      setExpiresAt('')
      setIsActive(true)
    }
  }, [open, initialCourseUid])

  // Filter candidate students: only students who haven't enrolled in selected courseUid
  const candidateStudentsQuery = useRedeemCandidateStudents(
    courseUid,
    {
      per_page: 20,
      search: debouncedStudentSearch || undefined,
    },
    { enabled: Boolean(courseUid) && open },
  )

  const candidateStudents = useMemo(() => {
    return candidateStudentsQuery.data?.users ?? []
  }, [candidateStudentsQuery.data?.users])

  // Reset selected student if selected course changes
  const handleCourseChange = (newCourseUid: string) => {
    setCourseUid(newCourseUid)
    setIsCourseDropdownOpen(false)
    setCourseSearchInput('')
    setDebouncedCourseSearch('')
    setSelectedStudent(null)
    setIsStudentDropdownOpen(false)
    setStudentSearchInput('')
    setDebouncedStudentSearch('')

    // Auto-suggest prefix from course title if available
    const chosenCourse = courses.find((c) => c.uid === newCourseUid)
    if (chosenCourse?.title && !prefix) {
      const words = chosenCourse.title.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter(Boolean)
      if (words.length > 0) {
        setPrefix(words[0].slice(0, 8).toUpperCase())
      }
    }
  }

  // Mutations
  const generateMutation = useGenerateRedeemCode()

  const handleSelectStudent = (student: ICandidateStudentUser) => {
    setSelectedStudent(student)
    setIsStudentDropdownOpen(false)
    setStudentSearchInput('')
  }

  const handleClearStudent = () => {
    setSelectedStudent(null)
    setStudentSearchInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!courseUid) {
      toast.error('Silakan pilih kursus terlebih dahulu.')
      return
    }

    if (maxUses < 1) {
      toast.error('Maksimal penggunaan harus minimal 1 kali.')
      return
    }

    try {
      const result = await generateMutation.mutateAsync({
        course_uid: courseUid,
        target_user_uid: selectedStudent ? selectedStudent.uid : undefined,
        target_email: selectedStudent ? selectedStudent.email : undefined,
        prefix: prefix.trim() ? prefix.trim().toUpperCase() : undefined,
        max_uses: Number(maxUses),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        is_active: isActive,
      })

      setGeneratedResult(result)
      toast.success(`Kode redeem "${result.code}" berhasil dibuat!`)
      onSuccess?.(result)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat kode redeem.'
      toast.error(message)
    }
  }

  const handleCopyCode = async (codeToCopy: string) => {
    try {
      await navigator.clipboard.writeText(codeToCopy)
      setCopied(true)
      toast.success('Kode redeem disalin ke clipboard!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Gagal menyalin kode.')
    }
  }

  const handleResetForAnother = () => {
    setGeneratedResult(null)
    setCopied(false)
    setSelectedStudent(null)
  }

  const selectedCourse =
    courses.find((c) => c.uid === courseUid) ??
    (initialCourseQuery.data?.uid === courseUid ? initialCourseQuery.data : undefined)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            type="button"
            className={cn(
              'inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-paper hover:bg-primary/90 transition-all active:scale-[0.98]',
              triggerClassName,
            )}
          >
            <Ticket className="size-4" />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="gap-0 overflow-hidden rounded-2xl border-2 border-ink-900/10 bg-paper-white p-0 shadow-paper sm:max-w-2xl">
        <DialogHeader className="border-b border-line-light px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Ticket className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-ink-900">
                Generate Kode Redeem
              </DialogTitle>
              <DialogDescription className="text-sm text-ink-500">
                Buat kode voucher untuk ditukarkan oleh siswa yang belum terdaftar di kursus terkait.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {generatedResult ? (
          /* ============================================================ */
          /* SUCCESS VIEW: DISPLAY GENERATED CODE & COPY BUTTON           */
          /* ============================================================ */
          <div className="p-6 space-y-6">
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 p-6 text-center space-y-4">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Sparkles className="size-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-ink-900">Kode Redeem Siap Digunakan!</h3>
                <p className="text-xs text-ink-500 mt-0.5">
                  Salin dan bagikan kode ini kepada siswa yang dituju.
                </p>
              </div>

              <div className="relative mx-auto flex max-w-md items-center justify-between rounded-xl border-2 border-dashed border-ink-900/20 bg-paper-white px-4 py-3 shadow-inner">
                <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-primary selection:bg-primary/20">
                  {generatedResult.code}
                </span>

                <Button
                  type="button"
                  variant={copied ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCopyCode(generatedResult.code)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg font-semibold transition-all',
                    copied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'hover:bg-paper-paper',
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="size-4" />
                      Disalin!
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      Salin Kode
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Detail ringkasan kode */}
            <div className="rounded-xl border border-line-light bg-paper-paper/50 p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-line-light">
                <span className="text-ink-500">Kursus:</span>
                <span className="font-semibold text-ink-900 truncate max-w-[280px]">
                  {generatedResult.course_title}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-line-light">
                <span className="text-ink-500">Target Siswa:</span>
                {generatedResult.target_user ? (
                  <span className="inline-flex items-center gap-2 font-medium text-ink-900">
                    <Avatar className="size-6 ring-1 ring-ink-900/10">
                      {generatedResult.target_user.avatar_url && (
                        <AvatarImage src={generatedResult.target_user.avatar_url} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                        {getInitials(generatedResult.target_user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{generatedResult.target_user.name}</span>
                    <span className="text-xs text-ink-400">({generatedResult.target_user.email})</span>
                  </span>
                ) : generatedResult.target_email ? (
                  <span className="font-medium text-ink-900">{generatedResult.target_email}</span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-note-yellow/30 px-2 py-0.5 text-xs font-semibold text-ink-800">
                    Umum (Semua Siswa yang Memenuhi Syarat)
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center py-1 border-b border-line-light">
                <span className="text-ink-500">Batas Kuota Penggunaan:</span>
                <span className="font-semibold text-ink-900">{generatedResult.max_uses} kali</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-line-light">
                <span className="text-ink-500">Masa Berlaku:</span>
                <span className="font-semibold text-ink-900">
                  {generatedResult.expires_at
                    ? new Intl.DateTimeFormat('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(generatedResult.expires_at))
                    : 'Tidak ada batas waktu (Permanen)'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-ink-500">Status Awal:</span>
                <span className={cn('font-semibold', generatedResult.is_active ? 'text-emerald-600' : 'text-ink-400')}>
                  {generatedResult.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForAnother}
                className="rounded-xl border-2 border-ink-900/10 font-semibold text-ink-700"
              >
                Buat Kode Lain
              </Button>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-primary font-semibold text-white hover:bg-primary/90"
              >
                Selesai
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* ============================================================ */
          /* FORM VIEW: COURSE SELECTOR, STUDENT FILTER SELECTOR, CONFIG  */
          /* ============================================================ */
          <form onSubmit={handleSubmit} className="flex flex-col">
            <DialogScrollArea className="max-h-[70vh] p-6 space-y-6">
              {/* 1. SELECT KURSUS */}
              <div className="space-y-2">
                <Label htmlFor="course-select" className="text-xs font-bold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-primary" />
                  1. Pilih Kursus <span className="text-destructive">*</span>
                </Label>

                <div className="relative">
                  <button
                    type="button"
                    id="course-select"
                    onClick={() => setIsCourseDropdownOpen((prev) => !prev)}
                    disabled={Boolean(initialCourseUid) || isCoursesLoading}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-xl border-2 border-ink-900/15 bg-paper-white px-3 py-2.5 text-left shadow-sm transition hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:bg-paper-paper/60',
                      isCourseDropdownOpen && 'border-primary ring-2 ring-primary/20',
                    )}
                  >
                    {selectedCourse ? (
                      <CourseOptionContent course={selectedCourse} />
                    ) : (
                      <>
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-ink-900/20 bg-paper-paper text-ink-400">
                          <BookOpen className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink-700">
                            {isCoursesLoading ? 'Memuat kursus...' : 'Pilih kursus'}
                          </span>
                          <span className="block text-[11px] text-ink-400">
                            Kursus menentukan daftar siswa yang bisa dipilih
                          </span>
                        </span>
                      </>
                    )}
                    <ChevronDown
                      className={cn(
                        'size-4 shrink-0 text-ink-400 transition-transform duration-200',
                        isCourseDropdownOpen && 'rotate-180',
                      )}
                    />
                  </button>

                  {isCourseDropdownOpen && (
                    <div className="absolute z-50 mt-1.5 w-full rounded-xl border-2 border-ink-900/10 bg-paper-white p-2 shadow-2xl">
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                        <Input
                          type="text"
                          value={courseSearchInput}
                          onChange={(event) => setCourseSearchInput(event.target.value)}
                          placeholder="Cari kursus..."
                          className="h-9 rounded-lg border-ink-900/15 pl-9 text-xs"
                          autoFocus
                        />
                        {courseSearchInput && (
                          <button
                            type="button"
                            onClick={() => setCourseSearchInput('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>

                      <div
                        className="max-h-60 space-y-1 overflow-y-auto overscroll-y-contain pr-1"
                        onWheel={(event) => event.stopPropagation()}
                        onScroll={(event) => {
                          const element = event.currentTarget
                          const reachedBottom =
                            element.scrollTop + element.clientHeight >= element.scrollHeight - 48
                          if (
                            reachedBottom &&
                            coursesQuery.hasNextPage &&
                            !coursesQuery.isFetchingNextPage
                          ) {
                            void coursesQuery.fetchNextPage()
                          }
                        }}
                      >
                        {isCoursesLoading ? (
                          <div className="py-6 text-center text-xs text-ink-400">
                            Memuat daftar kursus...
                          </div>
                        ) : courses.length === 0 ? (
                          <div className="py-6 text-center text-xs text-ink-500 space-y-1">
                            <BookOpen className="mx-auto mb-1 size-6 text-ink-300" />
                            <p className="font-semibold text-ink-700">Kursus tidak ditemukan</p>
                            <p className="text-[11px] text-ink-400">
                              {debouncedCourseSearch
                                ? 'Coba gunakan kata kunci pencarian lain.'
                                : 'Belum ada kursus yang tersedia.'}
                            </p>
                          </div>
                        ) : (
                          courses.map((course) => (
                            <button
                              key={course.uid}
                              type="button"
                              onClick={() => handleCourseChange(course.uid)}
                              className={cn(
                                'group flex w-full items-center justify-between gap-2.5 rounded-lg p-2 text-left transition hover:bg-primary/5',
                                course.uid === courseUid && 'bg-primary/5',
                              )}
                            >
                              <CourseOptionContent course={course} />
                              <Check
                                className={cn(
                                  'size-4 shrink-0 text-primary',
                                  course.uid === courseUid ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                            </button>
                          ))
                        )}

                        {coursesQuery.isFetchingNextPage && (
                          <div className="py-3 text-center text-xs text-ink-400" aria-live="polite">
                            Memuat kursus berikutnya...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {!selectedCourse && (
                  <p className="text-xs text-ink-500">
                    Pilih kursus untuk membuka daftar siswa yang belum terdaftar.
                  </p>
                )}
              </div>

              {/* 2. SELECT USER (ROLE STUDENT) DENGAN FILTER HANYA YANG BELUM MASUK KURSUS A */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                    <User className="size-3.5 text-primary" />
                    2. Target Siswa (Role: Student)
                  </Label>
                  {courseUid && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {candidateStudentsQuery.isLoading
                        ? 'Memuat...'
                        : `${candidateStudentsQuery.data?.total ?? 0} siswa belum terdaftar`}
                    </span>
                  )}
                </div>

                {!courseUid ? (
                  /* Kondisi Belum Pilih Kursus */
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-ink-900/20 bg-paper-paper/50 p-4 text-ink-500 text-sm">
                    <AlertCircle className="size-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="font-medium text-ink-700">Pilih kursus terlebih dahulu</p>
                      <p className="text-xs text-ink-500">
                        Daftar siswa akan otomatis difilter hanya menampilkan siswa yang <strong>belum masuk ke kursus yang Anda pilih</strong>.
                      </p>
                    </div>
                  </div>
                ) : selectedStudent ? (
                  /* Kondisi Siswa Telah Dipilih */
                  <div className="flex items-center justify-between rounded-xl border-2 border-primary/30 bg-primary/5 p-3.5 shadow-sm transition">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 shrink-0 ring-2 ring-primary/20">
                        {selectedStudent.avatar_url && (
                          <AvatarImage src={selectedStudent.avatar_url} alt={selectedStudent.name} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {getInitials(selectedStudent.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink-900">{selectedStudent.name}</p>
                        <p className="truncate text-xs text-ink-600">{selectedStudent.email}</p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearStudent}
                      className="size-8 p-0 text-ink-400 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      title="Batalkan pilihan siswa"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  /* Kondisi Memilih Siswa dari List Calon Siswa */
                  <div className="space-y-2">
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsStudentDropdownOpen((prev) => !prev)}
                        className={cn(
                          'w-full justify-between rounded-xl border-2 border-ink-900/15 bg-paper-white px-3.5 py-2.5 text-left text-sm font-medium shadow-sm hover:bg-paper-white focus:border-primary',
                          isStudentDropdownOpen && 'border-primary ring-2 ring-primary/20',
                        )}
                      >
                        <span className="text-ink-500">
                          Pilih siswa target (opsional - kosongkan jika voucher umum)...
                        </span>
                        <ChevronDown
                          className={cn(
                            'size-4 text-ink-400 transition-transform duration-200',
                            isStudentDropdownOpen && 'rotate-180',
                          )}
                        />
                      </Button>

                      {isStudentDropdownOpen && (
                        <div className="absolute z-50 mt-1.5 w-full rounded-xl border-2 border-ink-900/10 bg-paper-white p-2 shadow-2xl backdrop-blur">
                          {/* Search box calon siswa */}
                          <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
                            <Input
                              type="text"
                              value={studentSearchInput}
                              onChange={(e) => setStudentSearchInput(e.target.value)}
                              placeholder="Cari nama atau email siswa..."
                              className="pl-9 h-9 text-xs rounded-lg border-ink-900/15"
                              autoFocus
                            />
                            {studentSearchInput && (
                              <button
                                type="button"
                                onClick={() => setStudentSearchInput('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                              >
                                <X className="size-3.5" />
                              </button>
                            )}
                          </div>

                          {/* List Calon Siswa */}
                          <div
                            className="max-h-56 overflow-y-auto overscroll-y-contain space-y-1 pr-1"
                            onWheel={(event) => event.stopPropagation()}
                            onScroll={(event) => {
                              const element = event.currentTarget
                              const reachedBottom =
                                element.scrollTop + element.clientHeight >= element.scrollHeight - 48
                              if (
                                reachedBottom &&
                                candidateStudentsQuery.hasNextPage &&
                                !candidateStudentsQuery.isFetchingNextPage
                              ) {
                                void candidateStudentsQuery.fetchNextPage()
                              }
                            }}
                          >
                            {candidateStudentsQuery.isLoading ? (
                              <div className="py-6 text-center text-xs text-ink-400">
                                Memuat daftar siswa...
                              </div>
                            ) : candidateStudents.length === 0 ? (
                              <div className="py-6 text-center text-xs text-ink-500 space-y-1">
                                <ShieldAlert className="size-6 text-ink-300 mx-auto mb-1" />
                                <p className="font-semibold text-ink-700">Tidak ada siswa yang cocok</p>
                                <p className="text-[11px] text-ink-400">
                                  {debouncedStudentSearch
                                    ? 'Coba gunakan kata kunci pencarian lain.'
                                    : 'Semua siswa yang terdaftar di sistem sudah menjadi peserta pada kursus ini.'}
                                </p>
                              </div>
                            ) : (
                              candidateStudents.map((student) => (
                                <button
                                  key={student.uid}
                                  type="button"
                                  onClick={() => handleSelectStudent(student)}
                                  className="w-full flex items-center justify-between gap-2.5 rounded-lg p-2 text-left text-sm transition hover:bg-primary/5 hover:text-primary group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Avatar className="size-8 shrink-0 ring-1 ring-ink-900/10">
                                      {student.avatar_url && <AvatarImage src={student.avatar_url} />}
                                      <AvatarFallback className="bg-note-yellow/60 text-ink-900 text-[10px] font-bold">
                                        {getInitials(student.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <p className="truncate font-semibold text-ink-900 group-hover:text-primary">
                                        {student.name}
                                      </p>
                                      <p className="truncate text-xs text-ink-500">{student.email}</p>
                                    </div>
                                  </div>
                                </button>
                              ))
                            )}

                            {candidateStudentsQuery.isFetchingNextPage && (
                              <div className="py-3 text-center text-xs text-ink-400" aria-live="polite">
                                Memuat siswa berikutnya...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-ink-400">
                      💡 Kode redeem dapat dikhususkan untuk 1 siswa, atau biarkan kosong jika ingin membuat voucher umum.
                    </p>
                  </div>
                )}
              </div>

              {/* 3. PREFIX KODE REDEEM */}
              <div className="space-y-4 pt-2 border-t border-line-light">
                <div className="space-y-1.5">
                  <Label htmlFor="code-prefix" className="text-xs font-semibold text-ink-700">
                    Prefix Kode (Opsional)
                  </Label>
                  <Input
                    id="code-prefix"
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    placeholder="Contoh: REACT, GO, PROMO"
                    maxLength={12}
                    className="rounded-xl border-ink-900/15 uppercase font-mono tracking-wider"
                  />
                  <p className="text-[11px] text-ink-400">
                    Kode dibuat otomatis. Format: <span className="font-mono text-ink-700">{prefix.trim() || 'DK'}-XXXX-XXXX</span>.
                  </p>
                </div>
              </div>

              {/* 4. KUOTA & MASA BERLAKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-line-light">
                <div className="space-y-1.5">
                  <Label htmlFor="max-uses" className="text-xs font-semibold text-ink-700">
                    Batas Kuota Penggunaan
                  </Label>
                  <Input
                    id="max-uses"
                    type="number"
                    min={1}
                    max={10000}
                    value={maxUses}
                    onChange={(e) => setMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                    className="rounded-xl border-ink-900/15"
                  />
                  <p className="text-[11px] text-ink-400">
                    {selectedStudent ? 'Untuk target 1 siswa, disarankan kuota 1 kali.' : 'Jumlah maksimal klaim kode ini.'}
                  </p>
                </div>

                <div className="space-y-1.5 select-none">
                  <Label htmlFor="expires-at" className="text-xs font-semibold text-ink-700 flex items-center gap-1">
                    <Calendar className="size-3 text-ink-400" />
                    Masa Berlaku (Opsional)
                  </Label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const input = expiresAtInputRef.current
                        if (!input) return
                        try {
                          input.showPicker()
                        } catch {
                          input.click()
                        }
                      }}
                      className="flex h-9 w-full select-none items-center justify-between rounded-xl border border-ink-900/15 bg-card px-3 text-left text-xs text-ink-900 transition hover:border-line-medium focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                      <span className={expiresAt ? '' : 'text-ink-400'}>
                        {expiresAt
                          ? new Intl.DateTimeFormat('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(new Date(expiresAt))
                          : 'Pilih tanggal dan waktu'}
                      </span>
                      <Calendar className="size-4 shrink-0 text-ink-400" />
                    </button>
                    <input
                      ref={expiresAtInputRef}
                      id="expires-at"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 size-px -translate-x-1/2 -translate-y-1/2 opacity-0"
                    />
                  </div>
                  <p className="text-[11px] text-ink-400">
                    Kosongkan jika kode berlaku selamanya.
                  </p>
                </div>
              </div>

              {/* 5. STATUS AKTIF */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-line-light p-3 hover:bg-paper-paper/50 transition">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4 rounded text-primary focus:ring-primary/20"
                  />
                  <div>
                    <p className="text-xs font-semibold text-ink-900">Aktifkan Kode Sekarang</p>
                    <p className="text-[11px] text-ink-400">
                      Jika dinonaktifkan, siswa belum bisa menukarkan kode ini sampai diaktifkan kembali.
                    </p>
                  </div>
                </label>
              </div>
            </DialogScrollArea>

            <DialogFooter className="border-t border-line-light px-6 py-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl border-2 border-ink-900/10 font-semibold text-ink-700 hover:bg-paper-paper"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!courseUid || generateMutation.isPending}
                className="rounded-xl bg-primary font-semibold text-white shadow-paper hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {generateMutation.isPending ? (
                  <>Membuat Kode...</>
                ) : (
                  <>
                    <Ticket className="size-4 mr-1.5" />
                    Generate Kode Redeem
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
