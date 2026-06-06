import { Button } from '@/components/ui/button'
import { editLayout } from '@/components/courses/(authorized)/curriculum/edit-layout'

type CourseEditStickySaveBarProps = {
  isSaving: boolean
  isPublishing: boolean
  hasUnsavedLesson: boolean
  isAdmin: boolean
  isPublished: boolean
  onSave: () => void
  onPublish: () => void
}

export function CourseEditStickySaveBar({
  isSaving,
  isPublishing,
  hasUnsavedLesson,
  isAdmin,
  isPublished,
  onSave,
  onPublish,
}: CourseEditStickySaveBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm supports-backdrop-filter:bg-white/85 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        {hasUnsavedLesson && (
          <p className="min-w-0 flex-1 text-xs font-medium text-amber-700 sm:text-sm">
            Belum disimpan
          </p>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {!isPublished && isAdmin && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={editLayout.control}
              disabled={isSaving || isPublishing}
              onClick={onPublish}
            >
              {isPublishing ? 'Menerbitkan...' : 'Terbitkan'}
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            className={`${editLayout.control} min-w-[8.5rem]`}
            disabled={isSaving || !hasUnsavedLesson}
            onClick={onSave}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan lesson'}
          </Button>
        </div>
      </div>
    </div>
  )
}
