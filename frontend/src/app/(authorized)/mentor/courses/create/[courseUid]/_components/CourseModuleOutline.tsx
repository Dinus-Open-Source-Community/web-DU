'use client'

import { Plus } from 'lucide-react'
import type { ICourseModule } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type CourseModuleOutlineProps = {
  modules: ICourseModule[]
  activeModuleId: string | null
  onSelectModule: (moduleId: string) => void
  onAddModule: () => void
}

export function CourseModuleOutline({ modules, activeModuleId, onSelectModule, onAddModule }: CourseModuleOutlineProps) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 lg:sticky lg:top-6">
      <div className="mb-3 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Struktur kursus</p>
        <h3 className="text-sm font-semibold text-slate-900">Daftar modul</h3>
      </div>

      <div className="space-y-1.5">
        {modules.map((module, index) => {
          const isActive = module.id === activeModuleId
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => onSelectModule(module.id)}
              className={cn(
                'w-full rounded-xl border px-3 py-2.5 text-left transition-colors',
                isActive ? 'border-slate-300 bg-slate-50/80' : 'border-slate-200/70 bg-white hover:bg-slate-50/60'
              )}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Modul {index + 1}</p>
              <p className={cn('mt-1 line-clamp-2 text-sm font-medium', isActive ? 'text-slate-900' : 'text-slate-700')}>{module.title}</p>
            </button>
          )
        })}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={onAddModule} className="mt-4 w-full rounded-xl border-slate-300 bg-transparent">
        <Plus className="size-4" />
        Add new module
      </Button>
    </aside>
  )
}
