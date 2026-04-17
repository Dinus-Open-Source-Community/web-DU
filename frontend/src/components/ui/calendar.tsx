"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years"
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn(
        "bg-background p-3",
        className
      )}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex flex-col gap-4", defaultClassNames.month),
        month_caption: cn(
          "flex h-9 items-center justify-center px-10",
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          "select-none text-sm font-medium",
          defaultClassNames.caption_label
        ),
        nav: cn(
          "flex items-center justify-between absolute inset-x-0 top-0",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "w-9 rounded-md text-[0.75rem] font-normal text-muted-foreground",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        day: cn(
          "relative h-9 w-9 p-0 text-center text-sm [&:has([aria-selected])]:bg-accent [&:has([aria-selected].range_end)]:rounded-r-md [&:has([aria-selected].range_start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          defaultClassNames.day
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100",
          defaultClassNames.day_button
        ),
        selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          defaultClassNames.selected
        ),
        today: cn(
          "bg-accent text-accent-foreground",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn(
          "rounded-none aria-selected:bg-accent aria-selected:text-accent-foreground",
          defaultClassNames.range_middle
        ),
        range_end: cn(
          "rounded-r-md bg-accent",
          defaultClassNames.range_end
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className="size-4" {...chevronProps} />
          }
          return <ChevronRightIcon className="size-4" {...chevronProps} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
