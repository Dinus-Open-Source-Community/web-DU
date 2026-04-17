'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { adminCategoryList } from '@/lib/data/admin-fixtures'

import { CategoryFormDialog } from './CategoryFormDialog'

export function CategoryManager() {
  const [dialogState, setDialogState] = useState<
    | { open: false }
    | { open: true; mode: 'create' }
    | { open: true; mode: 'edit'; name: string }
  >({ open: false })

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Daftar Kategori</h3>
            <p className="text-xs text-slate-500">
              Kelola pengelompokan kursus. Kategori ini tampil sebagai filter di katalog siswa.
            </p>
          </div>
          <Button
            className="h-10 rounded-xl px-4"
            onClick={() => setDialogState({ open: true, mode: 'create' })}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            Tambah Kategori
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {adminCategoryList.map((cat) => (
            <article
              key={cat.uid}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <Badge variant={cat.colorVariant}>{cat.name}</Badge>
                  <h3 className="text-base font-semibold tracking-tight text-slate-900">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {cat.coursesCount} kursus aktif terdaftar
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100"
                    onClick={() =>
                      setDialogState({ open: true, mode: 'edit', name: cat.name })
                    }>
                    <Pencil className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50">
                    <Trash2 className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Hapus</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span>Terhubung ke {cat.coursesCount} kursus</span>
                <span className="inline-flex h-6 items-center rounded-md bg-slate-50 px-2 font-semibold text-slate-600">
                  {cat.uid}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CategoryFormDialog
        open={dialogState.open}
        onOpenChange={(o) => {
          if (!o) setDialogState({ open: false })
        }}
        mode={dialogState.open ? dialogState.mode : 'create'}
        initialName={dialogState.open && dialogState.mode === 'edit' ? dialogState.name : ''}
      />
    </>
  )
}
