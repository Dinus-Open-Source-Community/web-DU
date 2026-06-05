import { useState } from 'react'
import { Layers3, UsersRound, LayoutDashboard, Star, Pencil, Eye, Sparkles, FileText, Tag, Banknote, Layout } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ICourseDetailItem, IMentorCourseStudent, IModulesData } from '../../lib/types/course'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ConfirmDialog } from './ConfirmDialog'
import { FormatRupiah } from '../../lib/func/func'
import { CourseParticipantsSection } from './CourseParticipation'
import { ROUTES } from '../../lib/routes.ts'
import { cn } from '../../lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { CourseLevelSignal } from './CourseLevel.tsx'
import type { JoinedCourse } from '@/lib/types/user.ts'

import { CourseMentorTable } from './CourseMentorTable'
import { CourseReviewSection } from './CourseReviewSection'
import { CourseCurriculumTab } from './CourseCurriculumTab'

type CourseDetailProps = {
  courseUid: string
  dataCourse: ICourseDetailItem | ICourseDetailItem[] | null
  dataStudents: IMentorCourseStudent[]
  dataModules?: IModulesData[]
  role?: 'mentor' | 'admin'
}

export function DetailCourse({ courseUid, role = 'mentor', dataCourse, dataStudents, dataModules }: CourseDetailProps) {
  const isAdmin = role === 'admin'
  const [isConfirm, setIsConfirm] = useState(false)
  const course = Array.isArray(dataCourse) ? dataCourse[0] : dataCourse
  const isPublished = Boolean(course?.is_published)

  const editHref = isAdmin ? ROUTES.admin.courseEditAdmin(courseUid) : ROUTES.mentor.courseEditMentor(courseUid)
  const previewHref = ROUTES.viewModuleAndLessons(courseUid)

  const TABS = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Kurikulum', icon: Layers3 },
    { label: 'Peserta', icon: UsersRound },
    { label: 'Review', icon: Star },
    { label: 'Mentor', icon: UsersRound },
  ]

  const handleReplyReview = (reviewUid: string, comment: string) => {
    console.log(`Replying to review ${reviewUid}: ${comment}`)
    // API logic for reply would go here
  }

  const modules = dataModules ?? course?.modules ?? []

  return (
    <div className="flex w-full flex-col gap-12 py-6 animate-in fade-in duration-500">
      {/* 1. Optimized Header */}
      <section className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={isPublished ? 'coursePublished' : 'courseDraft'} className="rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest shadow-xs">
              {isPublished ? 'Published' : 'Draft'}
            </Badge>
            <CourseLevelSignal level={course?.level as JoinedCourse['level']} />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{course?.title}</h1>
            <p className="text-base text-slate-500 sm:text-lg leading-relaxed">{course?.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 lg:pt-2">
          <Button asChild variant="outline" className="h-11 rounded-xl px-6 text-[11px] font-black uppercase tracking-widest border-slate-200 transition-all hover:bg-slate-50 active:scale-95">
            <Link to={editHref}>
              <Pencil className="mr-2 size-3.5 opacity-60" />
              Edit
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-xl px-6 text-[11px] font-black uppercase tracking-widest border-slate-200 transition-all hover:bg-slate-50 active:scale-95">
            <Link to={previewHref} target="_blank">
              <Eye className="mr-2 size-3.5 opacity-60" />
              Pratinjau
            </Link>
          </Button>
          {isAdmin && (
            <Button
              onClick={() => setIsConfirm(true)}
              className={cn(
                'h-11 rounded-xl px-8 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm',
                isPublished ? 'bg-primary text-white hover:bg-primary/90' : 'bg-slate-900 text-white hover:bg-slate-800',
              )}>
              {isPublished ? <Sparkles className="mr-2 size-3.5" /> : <Sparkles className="mr-2 size-3.5" />}
              {isPublished ? 'Update Status' : 'Terbitkan'}
            </Button>
          )}
        </div>
      </section>

      {/* 2. Content Tabs */}
      <Tabs defaultValue="overview" className="w-full space-y-12">
        <div className="flex items-center border-b border-slate-100 overflow-x-auto no-scrollbar">
          <TabsList variant="line" className="h-12 gap-10 flex-nowrap">
            {TABS.map((t) => (
              <TabsTrigger key={t.label} value={t.label.toLowerCase()} className="h-12 gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                <t.icon className="size-3.5 opacity-60" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="min-h-[400px]">
          <TabsContent value="overview" className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_340px]">
              <div className="space-y-12">
                <div className="flex flex-wrap items-center gap-10 border-b border-slate-100 pb-10">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                    <UsersRound className="size-4 text-primary opacity-70" /> {dataStudents.length} Peserta
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                    <Layers3 className="size-4 text-primary opacity-70" /> {course?.modules?.length || 0} Modul
                  </div>
                </div>
                <article className="space-y-8">
                  <h3 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <FileText className="size-4" />
                    Tentang Kursus
                  </h3>
                  <div
                    className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-base"
                    dangerouslySetInnerHTML={{ __html: course?.description || '<p className="italic text-slate-400">Belum ada deskripsi.</p>' }}
                  />
                </article>
              </div>

              <aside className="space-y-8">
                <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xs space-y-10">
                  <h3 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <Layout className="size-4" />
                    Informasi Kursus
                  </h3>
                  <div className="space-y-6">
                    <div className="group flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <Banknote className="size-3.5 text-slate-300" />
                        <span className="text-xs font-medium text-slate-400">Harga</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-primary">{course?.price === 0 ? 'Gratis' : FormatRupiah(course?.price as number)}</span>
                        {course?.price_strike ? <span className="text-[10px] text-slate-400 line-through">{FormatRupiah(course?.price_strike)}</span> : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <Tag className="size-3.5 text-slate-300" />
                        <span className="text-xs font-medium text-slate-400">Tipe</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{course?.course_type?.name || 'Reguler'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <Layers3 className="size-3.5 text-slate-300" />
                        <span className="text-xs font-medium text-slate-400">Kategori</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{typeof course?.category === 'string' ? course?.category : course?.category?.name || '-'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <Star className="size-3.5 text-amber-400" />
                        <span className="text-xs font-medium text-slate-400">Rating</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{course?.rating || '4.8'}</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="kurikulum" className="animate-in fade-in slide-in-from-top-4 duration-500">
            <CourseCurriculumTab modules={modules} editHref={editHref} />
          </TabsContent>

          <TabsContent value="peserta" className="animate-in fade-in slide-in-from-top-4 duration-500">
            <CourseParticipantsSection courseUid={courseUid} studentsData={dataStudents} />
          </TabsContent>

          <TabsContent value="review" className="animate-in fade-in slide-in-from-top-4 duration-500">
            <CourseReviewSection reviews={course?.reviews || []} isAdmin={isAdmin} onReply={handleReplyReview} />
          </TabsContent>

          <TabsContent value="mentor" className="animate-in fade-in slide-in-from-top-4 duration-500">
            <CourseMentorTable mentors={course?.mentors || []} isAdmin={isAdmin} onAssign={() => console.log('Assign Mentor')} />
          </TabsContent>
        </div>
      </Tabs>

      {isConfirm && (
        <ConfirmDialog
          title={isPublished ? 'Pembaruan Status' : 'Publikasikan Kursus'}
          description={isPublished ? 'Sinkronkan ulang metadata kursus agar informasi terbaru dapat dilihat oleh publik.' : 'Kursus akan diterbitkan dan dapat segera diakses oleh seluruh peserta.'}
          confirmLabel={isPublished ? 'Update' : 'Terbitkan'}
          onOpenChange={setIsConfirm}
          open={isConfirm}
          onConfirm={() => setIsConfirm(false)}
          onCancel={() => setIsConfirm(false)}
        />
      )}
    </div>
  )
}
