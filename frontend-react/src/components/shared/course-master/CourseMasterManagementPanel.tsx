import { useMemo, useState } from 'react'
import { FolderTree, Layers3, Pencil, Plus, Trash2 } from 'lucide-react'

import { AdminDataTable } from '@/components/shared/AdminDataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SearchForm } from '@/components/shared/SearchForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCourseMasterList } from '@/hooks/use-course-master-list'
import {
  useCreateCourseMaster,
  useDeleteCourseMaster,
  useUpdateCourseMaster,
} from '@/hooks/use-course-master-mutations'
import {
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
} from '@/lib/course-master/mappers'
import type {
  CourseMasterFormValues,
  CourseMasterItem,
  CourseMasterKind,
} from '@/lib/course-master/types'
import { COURSE_MASTER_LABELS } from '@/lib/course-master/types'
import { CourseMasterFormDialog } from './CourseMasterFormDialog'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; item: CourseMasterItem }

type DeleteState = { uid: string; name: string } | null

const PAGE_SIZE = 10

export function CourseMasterManagementPanel({ kind }: { kind: CourseMasterKind }) {
  const labels = COURSE_MASTER_LABELS[kind]
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [dialogState, setDialogState] = useState<DialogState>({ mode: 'closed' })
  const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null)

  const { items, meta, isLoading } = useCourseMasterList(kind, {
    page,
    per_page: PAGE_SIZE,
    ...(committedSearch ? { name: committedSearch } : {}),
  })

  const createMutation = useCreateCourseMaster(kind)
  const updateMutation = useUpdateCourseMaster(kind)
  const deleteMutation = useDeleteCourseMaster(kind)

  const totalPages = meta?.total_pages ?? 1
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const columns = useMemo(
    () => [
      {
        id: 'name',
        header: 'Nama',
        cell: (row: CourseMasterItem) => (
          <div className="min-w-[180px]">
            <p className="font-semibold text-slate-900">{row.name}</p>
            {row.description ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{row.description}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row: CourseMasterItem) => (
          <Badge variant={row.is_active ? 'userActive' : 'userInactive'}>
            {row.is_active ? 'Aktif' : 'Nonaktif'}
          </Badge>
        ),
      },
      {
        id: 'courses',
        header: 'Kursus',
        align: 'center' as const,
        cell: (row: CourseMasterItem) => (
          <span className="tabular-nums text-slate-700">{row.courses?.length ?? 0}</span>
        ),
      },
      {
        id: 'updated',
        header: 'Diperbarui',
        cell: (row: CourseMasterItem) => (
          <span className="text-slate-600">
            {row.updated_at ? dateFormatter.format(new Date(row.updated_at)) : '-'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Aksi',
        align: 'right' as const,
        cell: (row: CourseMasterItem) => (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-slate-200 px-3 text-xs font-semibold text-slate-700"
              onClick={() => setDialogState({ mode: 'edit', item: row })}
            >
              <Pencil className="mr-1.5 size-3.5" aria-hidden />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-slate-200 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => setDeleteTarget({ uid: row.uid, name: row.name })}
            >
              <Trash2 className="mr-1.5 size-3.5" aria-hidden />
              Hapus
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const closeDialog = () => setDialogState({ mode: 'closed' })

  const handleCreate = async (values: CourseMasterFormValues) => {
    await createMutation.mutateAsync(formValuesToCreatePayload(values))
    closeDialog()
    setPage(1)
  }

  const handleEdit = async (values: CourseMasterFormValues) => {
    if (dialogState.mode !== 'edit') return

    await updateMutation.mutateAsync({
      uid: dialogState.item.uid,
      payload: formValuesToUpdatePayload(values),
    })
    closeDialog()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    await deleteMutation.mutateAsync(deleteTarget.uid)
    setDeleteTarget(null)

    if (items.length === 1 && page > 1) {
      setPage((current) => current - 1)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <AdminDataTable
        columns={columns}
        data={items}
        keyField={(row) => row.uid}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        toolbar={
          <>
            <SearchForm
              value={search}
              onChange={(value) => {
                setSearch(value)
                if (value === '') {
                  setCommittedSearch('')
                  setPage(1)
                }
              }}
              onSubmit={() => {
                setCommittedSearch(search)
                setPage(1)
              }}
              placeholder={`Cari ${labels.singular.toLowerCase()}...`}
              submitLabel="Cari"
            />
            <Button
              type="button"
              className="ml-auto rounded-xl px-4"
              onClick={() => setDialogState({ mode: 'create' })}
            >
              <Plus className="mr-2 size-4" aria-hidden />
              {labels.createButton}
            </Button>
          </>
        }
        emptyState={
          isLoading ? (
            <p className="text-sm text-slate-500">Memuat data...</p>
          ) : (
            <EmptyState
              icon={kind === 'category' ? <FolderTree className="size-5" /> : <Layers3 className="size-5" />}
              title={labels.emptyTitle}
              description={labels.emptyDescription}
              action={
                <Button type="button" className="rounded-xl" onClick={() => setDialogState({ mode: 'create' })}>
                  <Plus className="mr-2 size-4" aria-hidden />
                  {labels.createButton}
                </Button>
              }
            />
          )
        }
      />

      <CourseMasterFormDialog
        open={dialogState.mode !== 'closed'}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        kind={kind}
        mode={dialogState.mode === 'edit' ? 'edit' : 'create'}
        item={dialogState.mode === 'edit' ? dialogState.item : null}
        submitting={isSubmitting}
        onSubmitCreate={handleCreate}
        onSubmitEdit={handleEdit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={labels.deleteTitle}
        description={deleteTarget ? labels.deleteDescription(deleteTarget.name) : undefined}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="destructive"
        onConfirm={() => {
          void handleDelete()
        }}
      />
    </div>
  )
}
