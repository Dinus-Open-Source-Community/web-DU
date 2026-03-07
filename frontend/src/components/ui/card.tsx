import Image from "next/image";
import { ReactIcon } from "./icons";
import { Badge } from "./badge";
import { Rating } from "./rating";
import { BadgeVariant } from "@/lib/types";
import { Profile } from "./profile";
import { Button } from "./button";

interface CardProps {
  image?: string;
  title: string;
  description: string;
  variantBadge: BadgeVariant;
  author: {
    name: string;
    avatar: string;
  };
  rating: number;
  totalReviews: number;
}

function Card({
  image,
  title,
  description,
  variantBadge,
  author,
  rating,
  totalReviews,
}: CardProps) {
  return (
    <div className="flex h-full w-full max-w-sm flex-col overflow-hidden drop-shadow-xl">
      {/* Image Content*/}
      <div className="relative aspect-video min-h-[203px] w-full shrink-0 rounded-[10px]">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="rounded-[10px] object-cover"
            sizes="(max-width: 768px) 100vw, 384px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#D2E1ED] text-[#00D8FF]">
            <ReactIcon />
          </div>
        )}
      </div>

      {/* 4. Content description */}
      <div className="relative z-10 -mt-6 flex min-h-[208px] grow flex-col rounded-xl bg-white p-4">
        <div className="mb-2.5 flex items-center justify-between">
          <Badge variant={variantBadge} />
          <Rating rating={rating} totalReviews={totalReviews} />
        </div>

        <div className="mb-5 w-full">
          <h3 className="mb-2 line-clamp-2 text-lg leading-snug font-medium text-black">
            {title}
          </h3>

          <p className="line-clamp-3 grow text-lg leading-[1.3] font-normal text-[var(--text-secondary)]">
            {description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <Profile
            image={author.avatar ?? "/pinguin.png"}
            name={author.name ?? ""}
          />

          <Button className="px-4 py-2 text-sm font-medium" variant="default">
            Enroll
          </Button>
        </div>
      </div>
    </div>
  );
}

export { Card };
