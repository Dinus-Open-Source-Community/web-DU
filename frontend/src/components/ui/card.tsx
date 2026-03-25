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
  size?: "sm" | "md" | "lg";
}

const sizes = {
  container: {
    sm: "max-w-xs",
    md: "max-w-sm",
    lg: "max-w-md",
  },
  imageWrapper: {
    sm: "min-h-[160px]",
    md: "min-h-[203px]",
    lg: "min-h-[250px]",
  },
  contentWrapper: {
    sm: "min-h-[160px] p-3 -mt-6",
    md: "min-h-[208px] p-4 -mt-6",
    lg: "min-h-[250px] p-6 -mt-8",
  },
  title: {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  },
  description: {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-lg",
  },
};

function Card({
  image,
  title,
  description,
  variantBadge,
  author,
  rating,
  totalReviews,
  size = "md",
}: CardProps) {
  return (
    <div
      className={`flex h-full w-full ${sizes.container[size]} flex-col overflow-hidden drop-shadow-xl`}
    >
      {/* Image Content*/}
      <div
        className={`relative aspect-video w-full shrink-0 rounded-[10px] ${sizes.imageWrapper[size]}`}
      >
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

      {/* Content description */}
      <div
        className={`relative z-10 flex grow flex-col rounded-xl bg-white ${sizes.contentWrapper[size]}`}
      >
        <div className="mb-2.5 flex items-center justify-between">
          <Badge variant={variantBadge} />
          <Rating rating={rating} totalReviews={totalReviews} />
        </div>

        <div className="mb-5 w-full">
          <h3
            className={`mb-2 line-clamp-2 leading-snug font-medium text-black ${sizes.title[size]}`}
          >
            {title}
          </h3>

          <p
            className={`line-clamp-2 grow leading-[1.3] font-normal text-[var(--text-secondary)] ${sizes.description[size]}`}
          >
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
