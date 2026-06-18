import { UserAvatarImage } from '@/components/shared/UserAvatarImage'

function Profile({ image, name }: { image: string; name: string }) {
  return (
    <div className="flex w-full items-center gap-2">
      <UserAvatarImage src={image} alt={name} size={28} />
      <p className="text-left text-base font-medium text-[var(--text-secondary)]">{name}</p>
    </div>
  )
}

export { Profile }
