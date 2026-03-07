import { ReactElement } from "react";

export type BadgeVariant = "free" | "premium" | "event" | "draft";

export interface ICardData {
  variantBadge: BadgeVariant;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
  };
  rating: number;
  totalReviews: number;
  image?: string;
}

export interface IProgramFeatures {
  title: string;
  description: string;
  icon: React.ReactNode;
}
