import type { ICategoryItem } from '@/lib/types/course'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CourseCategoryFilterProps = {
  categories: ICategoryItem[]
  selected: string[]
  onChange: (selected: string[]) => void
  title?: string
}

export function CourseCategoryFilter({
  categories,
  selected,
  onChange,
  title = 'Kategori',
}: CourseCategoryFilterProps) {
  const selectedValue = selected.length === 1 ? selected[0] : 'all'

  const handleSelect = (value: string) => {
    onChange(value === 'all' ? [] : [value])
  }

  const handleToggle = (uid: string) => {
    onChange(selected.includes(uid) ? [] : [uid])
  }

  return (
    <>
      {/* Mobile */}
      <div className="rounded-xl bg-white p-5 lg:hidden">
        <label
          htmlFor="course-category-filter"
          className="mb-3 block text-xl font-semibold tracking-tight text-black"
        >
          {title}
        </label>
        <Select value={selectedValue} onValueChange={handleSelect}>
          <SelectTrigger
            id="course-category-filter"
            className="w-full rounded-sm"
            aria-label={title}
          >
            <SelectValue placeholder={`Semua ${title}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Semua {title}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.uid} value={category.uid}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop */}
      <div className="hidden h-fit w-full rounded-xl bg-white p-5 sm:p-6 lg:sticky lg:top-24 lg:block lg:max-w-[280px] lg:shrink-0 lg:p-8">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-black sm:mb-7 sm:text-[28px]">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-col lg:gap-5">
          {categories.map((category) => (
            <label
              key={category.uid}
              className="group flex min-h-11 items-center gap-4"
            >
              <div className="relative flex h-[26px] w-[26px] shrink-0 cursor-pointer items-center justify-center">
                <input
                  type="checkbox"
                  checked={selected.includes(category.uid)}
                  onChange={() => handleToggle(category.uid)}
                  className="peer sr-only"
                />
                <div className="absolute inset-0 rounded-[6px] border-[2.5px] border-black bg-transparent"></div>
                <svg
                  className="absolute opacity-0 transition-opacity peer-checked:opacity-100"
                  width="14"
                  height="11"
                  viewBox="0 0 14 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.5 5.5L5 9L12.5 1.5"
                    stroke="black"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-base leading-[1.3] font-normal">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </>
  )
}
