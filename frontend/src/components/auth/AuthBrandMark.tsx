import { Link } from 'react-router-dom'

import { LogoDu } from '@/components/shared/icon'

export function AuthBrandMark() {
  return (
    <Link
      to="/"
      className="group mb-2 inline-flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-primary/25 lg:hidden"
    >
      <LogoDu className="size-8 text-primary transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none" />
      <span className="text-base font-semibold tracking-tight text-foreground">
        Doscom University
      </span>
    </Link>
  )
}
