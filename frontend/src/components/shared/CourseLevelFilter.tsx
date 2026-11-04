import type { CourseUiLevel } from '@/lib/types'
import { COURSE_FORM_LEVELS } from '@/lib/course-form/level'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type CourseLevelFilterProps = {
  levels?: CourseUiLevel[]
  selected: CourseUiLevel[]
  onChange: (selected: CourseUiLevel[]) => void
  title?: string
}

export function CourseLevelFilter({
  levels = COURSE_FORM_LEVELS,
  selected,
  onChange,
  title = 'Level Kursus',
}: CourseLevelFilterProps) {
  const selectedValue = selected.length === 1 ? selected[0] : 'all'

  const handleSelect = (value: string) => {
    onChange(value === 'all' ? [] : [value as CourseUiLevel])
  }

  const handleToggle = (level: CourseUiLevel) => {
    onChange(
      selected.includes(level)
        ? selected.filter((l) => l !== level)
        : [...selected, level],
    )
  }

  return (
    <>
      {/* Mobile Selector */}
      <div className="rounded-2xl border-2 border-ink-900 bg-paper-white p-4 shadow-paper lg:hidden">
        <label
          htmlFor="course-level-filter"
          className="mb-2 block font-display text-base font-bold text-ink-900"
        >
          {title}
        </label>
        <Select value={selectedValue} onValueChange={handleSelect}>
          <SelectTrigger
            id="course-level-filter"
            className="w-full rounded-xl border-2 border-ink-900 bg-paper-white font-bold text-ink-900 shadow-2xs"
            aria-label={title}
          >
            <SelectValue placeholder={`Semua ${title}`} />
          </SelectTrigger>
          <SelectContent className="border-2 border-ink-900 bg-paper-white shadow-paper">
            <SelectGroup>
              <SelectItem value="all" className="font-bold">
                Semua Level
              </SelectItem>
              {levels.map((level) => (
                <SelectItem key={level} value={level} className="font-bold">
                  {level}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden h-fit w-full rounded-2xl border-2 border-ink-900 bg-paper-white p-5 shadow-paper sm:p-6 lg:sticky lg:top-24 lg:block lg:max-w-[280px] lg:shrink-0">
        <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-ink-900/15 pb-3">
          <h2 className="font-display text-lg font-bold text-ink-900 sm:text-xl">
            {title}
          </h2>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="font-mono text-xs font-bold text-brand-ink hover:underline"
            >
              Reset ({selected.length})
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {levels.map((level) => {
            const isChecked = selected.includes(level)
            return (
              <label
                key={level}
                className={cn(
                  'group flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-all select-none',
                  isChecked
                    ? 'border-ink-900 bg-note-yellow/40 text-ink-900 shadow-2xs'
                    : 'border-transparent text-ink-700 hover:border-ink-900/20 hover:bg-paper-panel hover:text-ink-900',
                )}
              >
                <div className="relative flex size-5 shrink-0 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(level)}
                    className="peer sr-only"
                  />
                  <div
                    className={cn(
                      'size-5 rounded-md border-2 border-ink-900 transition-colors',
                      isChecked ? 'bg-note-yellow' : 'bg-paper-white',
                    )}
                  />
                  <Check
                    className={cn(
                      'pointer-events-none absolute size-3.5 stroke-[3] text-ink-900 transition-opacity',
                      isChecked ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </div>
                <span className="text-sm font-bold leading-tight">
                  {level}
                </span>
              </label>
            )
          })}
        </div>
      </div>
    </>
  )
}
