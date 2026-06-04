import { useMemo, useState } from 'react'
import { Search } from '../ui/search'
import CardCourse from '../shared/CardCourse'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { LogoDuBig } from '../shared/icon'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import type { BadgeVariant, ICategoryItem, ICourseItem } from '@/lib/types/course'
import { FormatRupiah } from '@/lib/func/func'

const filter = [{ name: 'All' }, { name: 'Free' }, { name: 'Premium' }, { name: 'Ongoing Event' }]

export default function CourseSection1({ Data, Categories }: { Data: ICourseItem[]; Categories: ICategoryItem[] }) {
  const [isActiveFilter, setIsActiveFilter] = useState<string>('All')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  const selectedCategoryValue = selectedCategories.length === 1 ? selectedCategories[0] : 'all'

  const filteredCourses = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    return Data.filter((course) => {
      const matchSearch =
        !keyword ||
        [course.title, course.subtitle, course.description, course.created_by?.name, ...course.mentors.map((mentor) => mentor.name)].filter(Boolean).join(' ').toLowerCase().includes(keyword)

      const matchTopFilter =
        isActiveFilter === 'All' ||
        (isActiveFilter === 'Free' && !course.is_premium) ||
        (isActiveFilter === 'Premium' && course.is_premium) ||
        (isActiveFilter === 'Ongoing Event' && Boolean(course.event_uid))

      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category_uid)

      return matchSearch && matchTopFilter && matchCategory
    })
  }, [Data, isActiveFilter, searchQuery, selectedCategories])

  const handleCategorySelect = (value: string) => {
    setSelectedCategories(value === 'all' ? [] : [value])
  }

  const handleCategoryToggle = (categoryUid: string) => {
    setSelectedCategories((current) => (current.includes(categoryUid) ? [] : [categoryUid]))
  }

  return (
    <section className="bg-muted relative h-full min-h-screen w-full pt-16 pb-10 sm:pt-20">
      <div className="relative container mx-auto h-full w-full px-4 sm:px-6 lg:px-10">
        {/*search section*/}
        <div className="h-full w-full pt-12 text-center sm:pt-16 lg:pt-20">
          <h1 className="mx-auto mb-4 max-w-4xl text-3xl leading-[1.3] font-bold sm:mb-5 sm:text-4xl lg:text-5xl">Explore Open Source Course</h1>
          <p className="mx-auto mb-6 max-w-2xl text-base leading-[1.5] font-normal text-[#A29F9F] sm:mb-8 sm:text-xl sm:leading-[1.3]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
          </p>
          <Search
            placeholder="Search courses or mentors"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="bg-muted rounded-[10px] py-5 align-middle text-base placeholder:text-base placeholder:font-normal placeholder:text-[#A29F9F] sm:py-6 sm:placeholder:text-xl"
            containerClassName="max-w-2xl mx-auto"
          />
        </div>

        {/*top filtering*/}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
          {filter.map((f) => {
            const isCurrentActive = isActiveFilter === f.name
            return (
              <button
                key={f.name}
                onClick={() => setIsActiveFilter(f.name)}
                className={`border-primary min-h-11 rounded-2xl border px-3 py-2.5 transition-colors sm:px-6 sm:py-3 ${isCurrentActive ? 'bg-primary text-white' : 'text-primary bg-transparent'}`}>
                <h3 className="justify-center text-center align-middle text-sm font-normal leading-tight sm:text-xl">{f.name}</h3>
              </button>
            )
          })}
        </div>

        {/*course and side filtering*/}
        <div className="mt-8 flex h-full w-full flex-col gap-6 lg:mt-12 lg:flex-row lg:items-start">
          {/*Mobile Category Filter*/}
          <div className="rounded-xl bg-white p-5 lg:hidden">
            <label htmlFor="course-category-filter" className="mb-3 block text-xl font-semibold tracking-tight text-black">
              Categories
            </label>
            <Select value={selectedCategoryValue} onValueChange={handleCategorySelect}>
              <SelectTrigger id="course-category-filter" className="w-full rounded-sm" aria-label="Categories">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Categories.map((category) => (
                    <SelectItem key={category.uid} value={category.uid}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/*Side Filter*/}
          <div className="hidden h-full w-full rounded-xl bg-white p-5 sm:p-6 lg:sticky lg:top-24 lg:block lg:max-w-[280px] lg:shrink-0 lg:p-8">
            <h2 className="mb-5 text-2xl font-semibold tracking-tight text-black sm:mb-7 sm:text-[28px]">Categories</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-col lg:gap-5">
              {Categories.map((category) => (
                <label key={category.uid} className="group flex min-h-11 items-center gap-4">
                  <div className="relative flex h-[26px] w-[26px] shrink-0 cursor-pointer items-center justify-center">
                    <input type="checkbox" checked={selectedCategories.includes(category.uid)} onChange={() => handleCategoryToggle(category.uid)} className="peer sr-only" />

                    <div className="absolute inset-0 rounded-[6px] border-[2.5px] border-black bg-transparent"></div>

                    <svg className="absolute opacity-0 transition-opacity peer-checked:opacity-100" width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 5.5L5 9L12.5 1.5" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <span className="text-base leading-[1.3] font-normal">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
          {/*Card Course*/}
          <div className="relative h-full w-full">
            <h5 className="align-middle text-2xl leading-[1.3] font-semibold">Available Course</h5>
            <div className="mt-3 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-3">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((data) => (
                  <CardCourse
                    key={data.uid}
                    size="lg"
                    data={{
                      title: data.title,
                      description: data.description,
                      image: data.cover_url,
                      variantBadge: data.is_premium ? ('premium' as BadgeVariant) : ('free' as BadgeVariant),
                      author: { name: data.created_by?.name, avatar: data.created_by?.avatar_url },
                      rating: data.rating,
                      totalReviews: data.total_reviews,
                      price: data.price === 0 ? 'Gratis' : String(FormatRupiah(data.price)),
                      detailHref: `/course/${data.uid}`,
                    }}
                  />
                ))
              ) : (
                <p className="col-span-full px-6 py-12 text-center text-base text-slate-500">No courses match your current filters.</p>
              )}
            </div>
          </div>
        </div>

        {/**/}
        <div className="relative mt-16 h-full w-full py-8 sm:mt-20 sm:p-10 lg:mt-30 lg:p-15">
          <div className="from-primary to-muted mx-auto flex h-full w-full rounded-[20px] bg-linear-to-r from-10% to-75% px-6 py-10 sm:px-10 lg:px-16 lg:py-16 xl:px-25 xl:py-21 2xl:max-w-7xl">
            <div className="relative z-10 max-w-2xl gap-5 xl:pr-12">
              <h3 className="mb-4 align-middle text-3xl leading-[1.3] font-bold sm:text-4xl">Ready to Start Your Journey?</h3>
              <p className="text-base leading-[1.5] font-normal sm:text-xl sm:leading-[1.3]">
                Join thousands of developers who are already learning and growing with Doscom University. Start with free courses today!
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant={'secondary'} className="text-primary min-h-12 bg-white px-5 py-3 text-center text-base font-medium sm:py-6 sm:text-lg">
                  <Link to={'/auth/register'}>Join Now - It’s Free</Link>
                </Button>
                <Button variant={'default'} className="min-h-12 px-5 py-3 text-center text-base font-medium text-white sm:py-6 sm:text-lg">
                  Browse All Course
                </Button>
              </div>
            </div>
          </div>
          <LogoDuBig className="absolute top-2 right-0 hidden xl:block" />
        </div>
      </div>
    </section>
  )
}
