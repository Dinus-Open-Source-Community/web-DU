import Image from 'next/image'
import Link from 'next/link'
import { MessageSquareWarning, ChevronRight } from 'lucide-react'

import { ChartCard } from '@/components/charts/ChartCard'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/admin/EmptyState'
import { listTickets } from '@/lib/data/repository'
import { cn } from '@/lib/utils'

const severityMap = {
  high: 'severityHigh',
  medium: 'severityMedium',
  low: 'severityLow',
} as const

export function UnresolvedTickets() {
  const unresolvedTickets = listTickets()

  return (
    <ChartCard
      title="Unresolved Support Tickets"
      subtitle="Komplain terbaru dari siswa yang belum terselesaikan."
      action={
        <Link
          href="/admin/security/audit-logs"
          className="text-xs font-semibold text-primary hover:underline">
          Lihat semua
        </Link>
      }
      contentClassName="px-0 py-0">
      {unresolvedTickets.length === 0 ? (
        <EmptyState
          icon={<MessageSquareWarning className="h-5 w-5" />}
          title="Tidak ada tiket tertunda"
          description="Semua tiket sudah ditangani tim support."
          className="m-5"
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {unresolvedTickets.map((ticket, idx) => (
            <li
              key={ticket.uid}
              className={cn(
                'group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/70',
                idx === 0 && 'pt-4'
              )}>
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={ticket.studentAvatar}
                  alt={ticket.studentName}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="line-clamp-1 text-sm font-semibold text-slate-800">
                    {ticket.subject}
                  </p>
                  <Badge variant={severityMap[ticket.severity]} />
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                  <span className="truncate font-medium text-slate-600">{ticket.studentName}</span>
                  <span>•</span>
                  <span className="truncate">{ticket.category}</span>
                  <span>•</span>
                  <span>{ticket.createdAt}</span>
                </div>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" />
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  )
}
