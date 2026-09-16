type AuthDividerProps = {
  label: string
}

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t-2 border-dashed border-border/25" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
      </div>
    </div>
  )
}
