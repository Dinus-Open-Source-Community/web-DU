import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { PaymentInstruction } from '@/lib/transactions/payment-types'
import { SanitizedHtml } from '@/components/shared/SanitizedHtml'
import { cn } from '@/lib/utils'

export function PaymentInstructions({
  instructions,
}: {
  instructions: PaymentInstruction[]
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="rounded-[24px] border border-ink-900/10 bg-paper-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold tracking-wider text-primary uppercase">Panduan</p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-ink-900">
        Cara pembayaran
      </h2>

      <div className="mt-5 space-y-3">
        {instructions.map((instruction, index) => {
          const isOpen = openIndex === index

          return (
            <div key={instruction.title} className="overflow-hidden rounded-2xl border border-line-light">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-paper-paper focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
                aria-expanded={isOpen}
              >
                {instruction.title}
                <ChevronDown
                  className={cn(
                    'size-4 shrink-0 text-ink-400 transition-transform duration-200 motion-reduce:transition-none',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden
                />
              </button>

              <div
                className={cn(
                  'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
              >
                <div className="overflow-hidden">
                  <ol className="space-y-3 border-t border-line-light px-4 py-4">
                    {instruction.steps.map((step, stepIndex) => (
                      <li key={`${instruction.title}-${stepIndex}`} className="flex gap-3 text-sm leading-6 text-ink-600">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {stepIndex + 1}
                        </span>
                        <SanitizedHtml html={step} variant="inline" className="inline" />
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
