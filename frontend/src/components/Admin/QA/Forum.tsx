import { useState } from 'react'
import { ArrowLeft, Loader2, MessageSquare, Send } from 'lucide-react'

import { UserAvatarImage } from '@/components/shared/UserAvatarImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { QaLottieIllustration } from '@/components/playful/QaLottieIllustration'
import { AdminMetaLabel, AdminQaStatusLabel } from '@/lib/admin/status-label'
import { appCardClassName, appSoftCardClassName } from '@/lib/design/app-shell-tokens'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useReplyAdminQnaThread } from '@/hooks/use-admin-moderation'
import type { AdminQaThread } from '@/lib/types/course'
import { cn } from '@/lib/utils'

const roleLabel: Record<'student' | 'mentor' | 'admin', string> = {
  student: 'Siswa',
  mentor: 'Mentor',
  admin: 'Admin',
}

type QaForumProps = {
  threads: AdminQaThread[]
  isLoading?: boolean
}

export function QaForum({ threads, isLoading = false }: QaForumProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div
        className={cn(
          appCardClassName,
          'flex min-h-48 items-center justify-center',
        )}
      >
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    )
  }

  if (threads.length === 0) {
    return (
      <div className={cn(appCardClassName, 'flex flex-col items-center px-6 py-10 text-center')}>
        <QaLottieIllustration className="mb-2 max-w-[14rem]" height="200px" />
        <EmptyState
          hideIcon
          className="border-0 bg-transparent px-0 py-0"
          title="Belum ada pertanyaan"
          description="Q&A akan muncul di sini ketika siswa memulai diskusi."
        />
      </div>
    )
  }

  const thread = threads.find((item) => item.uid === selectedId)
  if (thread) {
    return <QaThreadView thread={thread} onBack={() => setSelectedId(null)} />
  }

  return (
    <section className="flex flex-col gap-3">
      {threads.map((item) => (
        <button
          key={item.uid}
          type="button"
          onClick={() => setSelectedId(item.uid)}
          className={cn(
            appSoftCardClassName,
            'group flex items-start gap-4 p-5 text-left transition-colors hover:border-ink-900/20 hover:bg-paper-paper/80',
          )}
        >
          <UserAvatarImage
            src={item.authorAvatar}
            alt={item.author}
            size={40}
            className="ring-1 ring-border"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-base font-semibold text-ink-900 group-hover:text-primary">
                {item.title}
              </h3>
              <AdminQaStatusLabel answered={item.status === 'answered'} />
            </div>
            <p className="line-clamp-2 text-sm text-ink-500">{item.body}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
              <span className="font-medium text-ink-600">{item.author}</span>
              <span>•</span>
              <span>{item.courseTitle}</span>
              <span>•</span>
              <span>{item.createdAt}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3 w-3" aria-hidden /> {item.repliesCount} balasan
              </span>
            </div>
          </div>
        </button>
      ))}
    </section>
  )
}

function QaThreadView({ thread, onBack }: { thread: AdminQaThread; onBack: () => void }) {
  const replyMutation = useReplyAdminQnaThread()
  const [reply, setReply] = useState('')
  const canSubmit = reply.trim().length >= 3 && !replyMutation.isPending

  const handleSendReply = async () => {
    const body = reply.trim()
    if (!canSubmit) return

    try {
      await replyMutation.mutateAsync({
        threadUid: thread.uid,
        body,
      })
      setReply('')
    } catch {
      // Toast ditangani mutation hook.
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-fit gap-1.5 rounded-sm px-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={onBack}
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Kembali ke daftar Q&A
      </Button>

      <article className={cn(appSoftCardClassName, 'flex flex-col gap-4 p-6')}>
        <div className="flex items-start gap-3">
          <UserAvatarImage
            src={thread.authorAvatar}
            alt={thread.author}
            size={48}
            className="ring-1 ring-border"
          />
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">{thread.title}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
              <span className="font-semibold text-ink-700">{thread.author}</span>
              <span>{thread.courseTitle}</span>
              <span>{thread.createdAt}</span>
            </div>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-ink-700">{thread.body}</p>
      </article>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-ink-600">{thread.replies.length} Balasan</h3>
        {thread.replies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            Belum ada balasan. Jadilah yang pertama menjawab.
          </div>
        ) : (
          thread.replies.map((item) => (
            <div
              key={item.uid}
              className={cn(appSoftCardClassName, 'flex items-start gap-3 p-4')}
            >
              <UserAvatarImage
                src={item.authorAvatar}
                alt={item.author}
                size={40}
                className="ring-1 ring-border"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-ink-900">{item.author}</span>
                  <AdminMetaLabel>{roleLabel[item.role]}</AdminMetaLabel>
                  <span className="text-ink-500">{item.createdAt}</span>
                </div>
                <p className="text-sm leading-relaxed text-ink-700">{item.body}</p>
              </div>
            </div>
          ))
        )}
      </section>

      <section className={cn(appSoftCardClassName, 'flex flex-col gap-3 p-5')}>
        <h3 className="text-sm font-semibold text-ink-900">Tulis balasan Anda</h3>
        <Textarea
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Balas pertanyaan siswa dengan jelas..."
          disabled={replyMutation.isPending}
          className="min-h-[120px] resize-none text-sm"
        />
        <div className="flex justify-end">
          <Button
            className="h-10 gap-1.5 rounded-sm"
            disabled={!canSubmit}
            onClick={() => void handleSendReply()}
          >
            {replyMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            Kirim balasan
          </Button>
        </div>
      </section>
    </section>
  )
}
