import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar'
import { Initials } from '@/lib/func/func'
import type { IAssignmentParticipantAvatar } from '@/lib/types/features/course-detail-assignments'

const MAX_VISIBLE_AVATARS = 5

type AssignmentSubmitterAvatarGroupProps = {
  participants: IAssignmentParticipantAvatar[]
  maxVisible?: number
}

export function AssignmentSubmitterAvatarGroup({
  participants,
  maxVisible = MAX_VISIBLE_AVATARS,
}: AssignmentSubmitterAvatarGroupProps) {
  if (participants.length === 0) {
    return <span className="text-sm text-slate-500">Belum ada peserta</span>
  }

  const submittedCount = participants.filter((item) => item.hasSubmitted).length
  const visibleParticipants = participants.slice(0, maxVisible)
  const overflowCount = participants.length - visibleParticipants.length

  return (
    <div className="space-y-1.5">
      <AvatarGroup
        aria-label={`${submittedCount} dari ${participants.length} peserta sudah mengumpulkan`}
      >
        {visibleParticipants.map((participant) => (
          <Avatar key={participant.uid} size="sm" title={participant.name}>
            {participant.avatar_url ? (
              <AvatarImage src={participant.avatar_url} alt={participant.name} />
            ) : null}
            <AvatarFallback>{Initials(participant.name)}</AvatarFallback>
          </Avatar>
        ))}
        {overflowCount > 0 ? <AvatarGroupCount>+{overflowCount}</AvatarGroupCount> : null}
      </AvatarGroup>
      <p className="text-xs text-slate-500">
        {submittedCount}/{participants.length} sudah kumpul
      </p>
    </div>
  )
}
