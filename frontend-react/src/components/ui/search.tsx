import * as React from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ISearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showIcon?: boolean
  containerClassName?: string
}

const Search = React.forwardRef<HTMLInputElement, ISearchProps>(({ className, containerClassName, showIcon = true, ...props }, ref) => {
  return (
    <div className={cn('relative flex w-full items-center', containerClassName)}>
      <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#A29F9F]" />

      <input
        type="search"
        ref={ref}
        className={cn(
          'border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring bg-background flex h-10 w-full rounded-md border py-2 pr-3 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          showIcon ? 'pl-10' : 'pl-3',
          className,
        )}
        {...props}
      />
    </div>
  )
})

Search.displayName = 'Search'

export { Search }
