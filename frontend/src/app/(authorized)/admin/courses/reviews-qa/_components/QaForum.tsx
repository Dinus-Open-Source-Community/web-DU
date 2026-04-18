'use client'

import Image from 'next/image'
import { useState } from 'react'
import { MessageSquare, Send, ArrowLeft } from 'lucide-react'

import { EmptyState } from '@/components/admin/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { listAllQaThreads } from '@/lib/data/repository'
import type { AdminQaThread } from '@/lib/types'
import { cn } from '@/lib/utils'

const roleLabel: Record<'student' | 'mentor' | 'admin', string> = {
  student: 'Siswa',
  mentor: 'Mentor',
  admin: 'Admin',
}

const roleColor: Record<'student' | 'mentor' | 'admin', string> = {
  student: 'bg-slate-100 text-slate-700',
  mentor: 'bg-primary/10 text-primary',
  admin: 'bg-violet-100 text-violet-700',
}

export function QaForum() {
  const adminQaThreads = listAllQaThreads()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (adminQaThreads.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-5 w-5" />}
        title="Belum ada pertanyaan"
        description="Q&A akan muncul di sini ketika siswa memulai diskusi."
      />
    )
  }

  const thread = adminQaThreads.find((t) => t.uid === selectedId)

  if (thread) {
    return <QaThreadView thread={thread} onBack={() => setSelectedId(null)} />
  }

  return (
    <section className="flex flex-col gap-3">
      {adminQaThreads.map((t) => (
        <button
          key={t.uid}
          type="button"
          onClick={() => setSelectedId(t.uid)}
          className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-slate-300/90">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
            <Image src={t.authorAvatar} alt={t.author} fill className="object-cover" sizes="40px" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-base font-semibold text-slate-900 group-hover:text-primary">
                {t.title}
              </h3>
              <Badge variant={t.status === 'answered' ? 'qaAnswered' : 'qaUnanswered'} />
            </div>
            <p className="line-clamp-2 text-sm text-slate-500">{t.body}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="font-medium text-slate-600">{t.author}</span>
              <span>•</span>
              <span>{t.courseTitle}</span>
              <span>•</span>
              <span>{t.createdAt}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3 w-3" aria-hidden /> {t.repliesCount} balasan
              </span>
            </div>
          </div>
        </button>
      ))}
    </section>
  )
}

function QaThreadView({ thread, onBack }: { thread: AdminQaThread; onBack: () => void }) {
  const [reply, setReply] = useState('')
  const canSubmit = reply.trim().length >= 3

  return (
    <section className="flex flex-col gap-4">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-fit gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        onClick={onBack}>
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Kembali ke daftar Q&A
      </Button>

      <article className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100">
            <Image src={thread.authorAvatar} alt={thread.author} fill className="object-cover" sizes="48px" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">{thread.title}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{thread.author}</span>
              <span>{thread.courseTitle}</span>
              <span>{thread.createdAt}</span>
            </div>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-slate-700">{thread.body}</p>
      </article>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-600">
          {thread.replies.length} Balasan
        </h3>
        {thread.replies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-500">
            Belum ada balasan. Jadilah yang pertama menjawab.
          </div>
        ) : (
          thread.replies.map((rep) => (
            <div
              key={rep.uid}
              className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                <Image src={rep.authorAvatar} alt={rep.author} fill className="object-cover" sizes="40px" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-900">{rep.author}</span>
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                      roleColor[rep.role]
                    )}>
                    {roleLabel[rep.role]}
                  </span>
                  <span className="text-slate-400">{rep.createdAt}</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">{rep.body}</p>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-slate-800">Tulis balasan Anda</h3>
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Balas pertanyaan siswa dengan jelas..."
          className="min-h-[120px] resize-none text-sm"
        />
        <div className="flex justify-end">
          <Button
            className="h-10 gap-1.5 rounded-xl"
            disabled={!canSubmit}
            onClick={() => setReply('')}>
            <Send className="h-4 w-4" aria-hidden />
            Kirim balasan
          </Button>
        </div>
      </section>
    </section>
  )
}
