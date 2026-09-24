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
      <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />

      <input
        type="search"
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-xl border border-input bg-card py-2 pr-3 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-line-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
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
