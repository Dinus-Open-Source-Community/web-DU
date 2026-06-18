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
        'flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className,
      )}
      aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
      {...props}
    >
      {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
    </button>
  )
}
