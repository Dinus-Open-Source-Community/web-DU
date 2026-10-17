import type { ChangeEvent } from 'react'
import { ImagePlus, Upload } from 'lucide-react'

import { courseFormLayout } from '@/lib/course-form/layout'
import { cn } from '@/lib/utils'

type CourseFormCoverFieldProps = {
  previewUrl?: string | null
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function CourseFormCoverField({ previewUrl, onFileChange }: CourseFormCoverFieldProps) {
  const hasCover = Boolean(previewUrl)

  return (
    <div className="flex flex-col gap-2">
      <span className={courseFormLayout.label}>Cover kursus</span>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {hasCover ? (
          <img
            src={previewUrl!}
            width={320}
            height={200}
            loading="lazy"
            alt="Pratinjau cover kursus"
            className={courseFormLayout.coverPreview}
          />
        ) : null}

        <label
          className={cn(
            courseFormLayout.coverUpload,
            hasCover ? 'sm:flex-1' : 'w-full',
          )}
        >
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onFileChange}
            aria-label={hasCover ? 'Ganti cover kursus' : 'Unggah cover kursus'}
          />
          <span className="flex items-center justify-center gap-2 text-sm font-semibold text-ink-700">
            {hasCover ? (
              <>
                <Upload className="size-4 text-ink-500" aria-hidden />
                Ganti gambar
              </>
            ) : (
              <>
                <ImagePlus className="size-4 text-ink-500" aria-hidden />
                Unggah gambar
              </>
            )}
          </span>
          {!hasCover ? (
            <span className="mt-1 text-xs font-medium text-ink-500">JPG atau PNG</span>
          ) : null}
        </label>
      </div>
    </div>
  )
}
