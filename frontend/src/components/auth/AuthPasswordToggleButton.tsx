import type { ButtonHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { cn } from '@/lib/utils'

type AuthPasswordToggleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  visible: boolean
}

export function AuthPasswordToggleButton({
  visible,
  className,
  ...props
}: AuthPasswordToggleButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-[10px] text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
      {...props}
    >
      {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
    </button>
  )
}
