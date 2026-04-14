"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"

export type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** destructive = red confirm button */
  variant?: "default" | "destructive"
}

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider")
  }
  return ctx.confirm
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
  })
  const resolverRef = useRef<(value: boolean) => void>(() => {})
  /** True when user clicked the primary action (resolves true on close). */
  const confirmClickedRef = useRef(false)

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    confirmClickedRef.current = false
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (!next) {
      if (confirmClickedRef.current) {
        resolverRef.current(true)
      } else {
        resolverRef.current(false)
      }
      confirmClickedRef.current = false
    }
  }, [])

  const onConfirmClick = useCallback(() => {
    confirmClickedRef.current = true
  }, [])

  const value = useMemo(() => ({ confirm }), [confirm])

  const variant = options.variant ?? "default"
  const confirmLabel = options.confirmLabel ?? "Lanjutkan"
  const cancelLabel = options.cancelLabel ?? "Batal"

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            {options.description ? (
              <AlertDialogDescription>{options.description}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">{cancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={onConfirmClick}
              className={
                variant === "destructive" ? buttonVariants({ variant: "destructive" }) : undefined
              }>
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}
