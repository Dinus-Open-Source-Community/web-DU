import Image from "next/image";

function Profile({ image, name }: { image: string; name: string }) {
  return (
    <div className="flex w-full items-center gap-2 text-center">
      <Image
        src={image}
        alt={name}
        width={28}
        height={28}
        className="rounded-full object-cover"
        loading="lazy"
      />
      <p className="text-base font-medium text-[var(--text-secondary)]">
        {name}
      </p>
    </div>
  );
}

export { Profile };
