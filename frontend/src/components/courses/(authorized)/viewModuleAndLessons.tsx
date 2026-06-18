import '@/styles/tiptap-editor.css'

import { LessonAssignmentDetailPage } from '../module-viewer/assignment/LessonAssignmentDetailPage'
import { LessonAssignmentOverview } from '../module-viewer/assignment/LessonAssignmentOverview'
import { LessonAssignmentWork } from '../module-viewer/assignment/LessonAssignmentWork'
import { LessonContent } from '../module-viewer/LessonContent'
import { LessonFooter } from '../module-viewer/LessonFooter'
import { LessonSearchDialog } from '../module-viewer/LessonSearchDialog'
import { LessonSidebar } from '../module-viewer/LessonSidebar'
import { LessonThemeDialog } from '../module-viewer/LessonThemeDialog'
import { LessonViewerHeader } from '../module-viewer/LessonViewerHeader'
import { cn } from '@/lib/utils'
import type { CourseModuleViewerShellProps } from '@/lib/course-module-viewer/course-module-viewer-view-model'

export type { CourseModulePreviewVariant } from '@/lib/course-module-viewer/navigation'

export function CourseModulePreview({ view }: CourseModuleViewerShellProps) {
  const {
    backHref,
    courseTitle,
    theme,
    isThemeDialogOpen,
    onThemeDialogOpenChange,
    onThemeChange,
    modulesState,
    lessonEntries,
    effectiveActiveLessonId,
    activeEntry,
    displayedLesson,
    isLessonLoading,
    isAssignmentLoading,
    readLessonIds,
    completedLessonsCount,
    progressPercent,
    effectiveExpandedModules,
    isRightSidebarOpen,
    isMobileSidebarOpen,
    isLocalSearchOpen,
    searchQuery,
    filteredSearchItems,
    localSearchInputRef,
    assignmentState,
    footerActiveTitle,
    footerPreviousAction,
    footerNextAction,
    isContentShifted,
    showFooter,
    showLessonContent,
    showAssignmentOverview,
    showAssignmentDetail,
    showAssignmentWork,
    onOpenSearch,
    onOpenThemeSettings,
    onOpenModules,
    onToggleSidebar,
    onMobileSidebarOpenChange,
    onToggleModule,
    onSelectLesson,
    onSearchQueryChange,
    onCloseSearch,
    onViewerPaneChange,
    onSubmitAssignment,
  } = view

  return (
    <section
      className={cn(
        'relative min-h-dvh overflow-hidden',
        theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-slate-950',
      )}>
      <LessonViewerHeader
        backHref={backHref}
        courseTitle={courseTitle}
        theme={theme}
        onOpenSearch={onOpenSearch}
        onOpenThemeSettings={onOpenThemeSettings}
        onOpenModules={onOpenModules}
      />

      <div
        className={cn(
          'transition-[margin-right] duration-200 ease-out',
          isContentShifted && 'lg:mr-[348px]',
        )}>
        {showLessonContent ? (
          <LessonContent lesson={displayedLesson} theme={theme} isLoading={isLessonLoading} />
        ) : null}

        {isAssignmentLoading ? (
          <main className="min-h-dvh px-4 pb-28 pt-20 sm:px-6 sm:pt-24 md:px-8 lg:px-10">
            <div className="mx-auto w-full max-w-3xl">
              <p className={cn('text-sm', theme === 'dark' ? 'text-zinc-400' : 'text-slate-500')}>
                Memuat data tugas...
              </p>
            </div>
          </main>
        ) : null}

        {showAssignmentOverview && assignmentState.assignment && displayedLesson ? (
          <LessonAssignmentOverview
            lesson={displayedLesson}
            assignment={assignmentState.assignment}
            submission={assignmentState.submission}
            submissionAttempts={assignmentState.submissionAttempts}
            submissionMaxAttempts={assignmentState.submissionMaxAttempts}
            canStart={assignmentState.canStart}
            submissionBlockReason={assignmentState.submissionBlockReason}
            theme={theme}
            onStart={() => onViewerPaneChange('assignment-work')}
            onViewDetail={() => onViewerPaneChange('assignment-detail')}
          />
        ) : null}

        {showAssignmentDetail &&
        assignmentState.assignment &&
        assignmentState.submission &&
        displayedLesson ? (
          <LessonAssignmentDetailPage
            assignment={assignmentState.assignment}
            submission={assignmentState.submission}
            phase={assignmentState.phase}
            quizReview={assignmentState.quizReview}
            theme={theme}
            onBack={() => onViewerPaneChange('assignment')}
          />
        ) : null}

        {showAssignmentWork && assignmentState.assignment && displayedLesson ? (
          <LessonAssignmentWork
            lesson={displayedLesson}
            assignment={assignmentState.assignment}
            submission={assignmentState.submission}
            quiz={assignmentState.quiz}
            theme={theme}
            isSubmitting={assignmentState.isSubmitting}
            onCancel={() => onViewerPaneChange('assignment')}
            onSubmit={onSubmitAssignment}
          />
        ) : null}
      </div>

      {showFooter ? (
        <LessonFooter
          activeTitle={footerActiveTitle}
          previousAction={footerPreviousAction}
          nextAction={footerNextAction}
          theme={theme}
        />
      ) : null}

      <LessonSidebar
        modules={modulesState}
        lessonEntries={lessonEntries}
        activeModuleId={activeEntry?.module.uid}
        activeLessonId={effectiveActiveLessonId}
        readLessonIds={readLessonIds}
        completedLessonsCount={completedLessonsCount}
        progressPercent={progressPercent}
        expandedModules={effectiveExpandedModules}
        isOpen={isRightSidebarOpen}
        isMobileOpen={isMobileSidebarOpen}
        theme={theme}
        onToggleSidebar={onToggleSidebar}
        onMobileOpenChange={onMobileSidebarOpenChange}
        onToggleModule={onToggleModule}
        onSelectLesson={onSelectLesson}
      />

      <LessonSearchDialog
        open={isLocalSearchOpen}
        query={searchQuery}
        items={filteredSearchItems}
        inputRef={localSearchInputRef}
        theme={theme}
        onQueryChange={onSearchQueryChange}
        onClose={onCloseSearch}
      />

      <LessonThemeDialog
        open={isThemeDialogOpen}
        value={theme}
        onOpenChange={onThemeDialogOpenChange}
        onChange={onThemeChange}
      />
    </section>
  )
}
