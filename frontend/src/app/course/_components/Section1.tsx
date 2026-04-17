'use client'

import { Search } from '@/components/ui/search'
import { useState } from 'react'
import { ICardData } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogoDuBig } from '@/components/ui/icons'
import Link from 'next/link'

const filter = [{ name: 'All' }, { name: 'Free' }, { name: 'Premium' }, { name: 'Ongoing Event' }]

const categories = ['Web Development', 'Linux', 'Cloud', 'Design', 'AI/ML', 'Open Source']

export default function CourseSection1({ Data }: { Data: ICardData[] }) {
  const [isActiveFilter, setIsActiveFilter] = useState<string>('All')
  return (
    <section className="bg-muted relative h-full min-h-screen w-full pt-20 pb-10">
      <div className="relative container mx-auto h-full w-full px-10">
        {/*search section*/}
        <div className="h-full w-full pt-20 text-center">
          <h1 className="mb-5 text-5xl leading-[1.3] font-bold">Explore Open Source Course</h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl leading-[1.3] font-normal text-[#A29F9F]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
          </p>
          <Search
            placeholder="Search courses or mentors"
            className="bg-muted rounded-[10px] py-6 align-middle placeholder:text-xl placeholder:font-normal placeholder:text-[#A29F9F]"
            containerClassName="max-w-2xl mx-auto"
          />
        </div>

        {/*top filtering*/}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          {filter.map((f) => {
            const isCurrentActive = isActiveFilter === f.name
            return (
              <button
                key={f.name}
                onClick={() => setIsActiveFilter(f.name)}
                className={`border-primary rounded-2xl border px-6 py-3 transition-colors ${isCurrentActive ? 'bg-primary text-white' : 'text-primary bg-transparent'}`}>
                <h3 className="justify-center text-center align-middle text-xl font-normal">{f.name}</h3>
              </button>
            )
          })}
        </div>

        {/*course and side filtering*/}
        <div className="mt-12 flex h-full w-full">
          {/*Side Filter*/}
          <div className="mr-4 h-full w-full max-w-[22%] rounded-xl bg-white p-8">
            <h2 className="mb-7 text-[28px] font-semibold tracking-tight text-black">Categories</h2>

            <div className="flex flex-col gap-5">
              {categories.map((category) => (
                <label key={category} className="group flex items-center gap-4">
                  <div className="relative flex h-[26px] w-[26px] cursor-pointer items-center justify-center">
                    <input type="checkbox" className="peer sr-only" />

                    <div className="absolute inset-0 rounded-[6px] border-[2.5px] border-black bg-transparent"></div>

                    <svg className="absolute opacity-0 transition-opacity peer-checked:opacity-100" width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 5.5L5 9L12.5 1.5" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <span className="text-base leading-[1.3] font-normal">{category}</span>
                </label>
              ))}
            </div>
          </div>
          {/*Card Course*/}
          <div className="relative h-full w-full">
            <h5 className="align-middle text-2xl leading-[1.3] font-semibold">Available Course</h5>
            <div className="mt-3 grid w-full grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
              {Data.map((data, idx) => (
                <Card
                  key={idx}
                  variantBadge={data.variantBadge}
                  title={data.title}
                  description={data.description}
                  author={data.author}
                  rating={data.rating}
                  totalReviews={data.totalReviews}
                  image={data.image}
                  size="sm"
                  detailHref={`/course/${data.uid}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/**/}
        <div className="relative mt-30 h-full w-full p-15">
          <div className="from-primary to-muted 2Xl:w-7xl mx-auto flex h-full w-full rounded-[20px] bg-linear-to-r from-10% to-75% px-25 py-21">
            <div className="max-w-2xl gap-5">
              <h3 className="mb-4 align-middle text-4xl leading-[1.3] font-bold">Ready to Start Your Journey?</h3>
              <p className="text-xl leading-[1.3] font-normal">Join thousands of developers who are already learning and growing with Doscom University. Start with free courses today!</p>
              <div className="mt-6 flex gap-3">
                <Button asChild variant={'secondary'} className="text-primary bg-white px-5 py-6 text-center text-lg font-medium">
                  <Link href={'/auth/register'}>Join Now - It’s Free</Link>
                </Button>
                <Button variant={'default'} className="p-3 px-5 py-6 text-center text-lg font-medium text-white">
                  Browse All Course
                </Button>
              </div>
            </div>
          </div>
          <LogoDuBig className="absolute top-2 right-0" />
        </div>
      </div>
    </section>
  )
}
