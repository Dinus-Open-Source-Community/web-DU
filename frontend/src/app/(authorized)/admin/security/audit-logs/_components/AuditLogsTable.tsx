'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import {
  Calendar,
  Eye,
  Globe2,
  Hash,
  KeyRound,
  ScrollText,
  Shield,
  User,
} from 'lucide-react'

import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable'
import { DetailDrawer } from '@/components/admin/DetailDrawer'
import { EmptyState } from '@/components/admin/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { SearchForm } from '@/components/ui/SearchForm'
import { listAuditLogs } from '@/lib/data/repository'
import type { AdminAuditLog, AuditAction } from '@/lib/types'

type ActionFilter = 'all' | AuditAction
type ResourceFilter = 'all' | string

const actionOptions: { value: ActionFilter; label: string }[] = [
  { value: 'all', label: 'Semua Aksi' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'VIEW', label: 'View' },
]

const auditVariantMap = {
  CREATE: 'auditCreate',
  UPDATE: 'auditUpdate',
  DELETE: 'auditDelete',
  VIEW: 'auditView',
} as const

const PAGE_SIZE = 10

export function AuditLogsTable() {
  const auditLogs = listAuditLogs()
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all')
  const [resourceFilter, setResourceFilter] = useState<ResourceFilter>('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminAuditLog | null>(null)

  const resourceOptions = useMemo<{ value: ResourceFilter; label: string }[]>(() => {
    const unique = Array.from(new Set(auditLogs.map((a) => a.resource)))
    return [
      { value: 'all', label: 'Semua Resource' },
      ...unique.map((r) => ({ value: r, label: r })),
    ]
  }, [])

  const filtered = useMemo(() => {
    const q = committedSearch.toLowerCase().trim()
    return auditLogs.filter((a) => {
      const matchAction = actionFilter === 'all' || a.action === actionFilter
      const matchResource = resourceFilter === 'all' || a.resource === resourceFilter
      const matchQuery =
        q === '' ||
        a.actorName.toLowerCase().includes(q) ||
        a.detail.toLowerCase().includes(q) ||
        a.resourceId.toLowerCase().includes(q)
      return matchAction && matchResource && matchQuery
    })
  }, [committedSearch, actionFilter, resourceFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: AdminDataTableColumn<AdminAuditLog>[] = [
    {
      id: 'timestamp',
      header: 'Waktu',
      cell: (a) => (
        <span className="whitespace-nowrap font-mono text-xs text-slate-600">{a.timestamp}</span>
      ),
    },
    {
      id: 'actor',
      header: 'Aktor',
      cell: (a) => (
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-100">
            <Image src={a.actorAvatar} alt={a.actorName} fill className="object-cover" sizes="32px" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-slate-800">{a.actorName}</span>
            <span className="truncate text-xs text-slate-400">{a.actorRole}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'action',
      header: 'Aksi',
      cell: (a) => <Badge variant={auditVariantMap[a.action]} />,
    },
    {
      id: 'resource',
      header: 'Resource',
      cell: (a) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{a.resource}</span>
          <span className="text-xs text-slate-400">#{a.resourceId}</span>
        </div>
      ),
    },
    {
      id: 'detail',
      header: 'Detail',
      cell: (a) => (
        <span className="line-clamp-1 max-w-[280px] text-slate-600">{a.detail}</span>
      ),
    },
    {
      id: 'action-btn',
      header: <span className="sr-only">Aksi</span>,
      align: 'right',
      cell: (a) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-slate-200 px-3 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50"
          onClick={() => setSelected(a)}>
          <Eye className="h-3.5 w-3.5" aria-hidden />
          Detail
        </Button>
      ),
    },
  ]

  return (
    <>
      <AdminDataTable
        data={pagedRows}
        columns={columns}
        keyField={(a) => a.uid}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowClick={(a) => setSelected(a)}
        emptyState={
          <EmptyState
            icon={<ScrollText className="h-5 w-5" />}
            title="Belum ada aktivitas"
            description="Tidak ada audit log yang cocok dengan filter saat ini."
          />
        }
        toolbar={
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <SearchForm
              value={search}
              onChange={(v) => {
                setSearch(v)
                if (v === '') {
                  setCommittedSearch('')
                  setPage(1)
                }
              }}
              onSubmit={() => {
                setCommittedSearch(search)
                setPage(1)
              }}
              placeholder="Cari aktor, detail, atau resource..."
              submitLabel="Cari"
              className="flex-1 min-w-[240px]"
            />
            <FilterSelect<ActionFilter>
              id="audit-action"
              label="Aksi"
              value={actionFilter}
              onChange={(v) => {
                setActionFilter(v)
                setPage(1)
              }}
              options={actionOptions}
            />
            <FilterSelect<ResourceFilter>
              id="audit-resource"
              label="Resource"
              value={resourceFilter}
              onChange={(v) => {
                setResourceFilter(v)
                setPage(1)
              }}
              options={resourceOptions}
            />
          </div>
        }
      />

      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title="Detail Audit Log"
        description={selected ? `#${selected.uid}` : undefined}>
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-full bg-slate-100">
                <Image
                  src={selected.actorAvatar}
                  alt={selected.actorName}
                  fill
                  className="object-cover"
                  sizes="44px"
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-slate-900">
                  {selected.actorName}
                </span>
                <span className="truncate text-xs text-slate-500">{selected.actorRole}</span>
              </div>
              <div className="ml-auto">
                <Badge variant={auditVariantMap[selected.action]} />
              </div>
            </div>

            <DetailRow icon={<Calendar className="h-4 w-4" />} label="Waktu" value={selected.timestamp} mono />
            <DetailRow icon={<Hash className="h-4 w-4" />} label="Resource" value={`${selected.resource} #${selected.resourceId}`} />
            <DetailRow icon={<Globe2 className="h-4 w-4" />} label="IP Address" value={selected.ip} mono />
            <DetailRow icon={<User className="h-4 w-4" />} label="Aktor" value={selected.actorName} />
            <DetailRow icon={<Shield className="h-4 w-4" />} label="Role" value={selected.actorRole} />

            <div className="rounded-xl border border-slate-200/60 bg-slate-50/60 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <KeyRound className="h-3.5 w-3.5" aria-hidden />
                Keterangan
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{selected.detail}</p>
            </div>
          </div>
        )}
      </DetailDrawer>
    </>
  )
}

function DetailRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className={`truncate text-sm text-slate-800 ${mono ? 'font-mono' : ''}`}>
          {value}
        </span>
      </div>
    </div>
  )
}
