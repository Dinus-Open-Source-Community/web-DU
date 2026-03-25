import { BadgeVariant } from "@/lib/types";

const BadgeData: Record<BadgeVariant, { label: string; styles: string }> = {
  free: {
    label: "Free",
    styles: "bg-[#DCF8DA] text-[#54CD4C]",
  },
  premium: {
    label: "Premium",
    styles: "bg-[#E2F7FF] text-[#2290DF]",
  },
  event: {
    label: "Event",
    styles: "bg-[#D8DEFF] text-[#B922DF]",
  },
  draft: {
    label: "Draft",
    styles: "bg-gray-100 text-gray-600",
  },
};

function Badge({ variant }: { variant: BadgeVariant }) {
  const config = BadgeData[variant];

  if (!config) {
    console.error(`Invalid Badge variant: ${variant}`);
    return null;
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-[9px] px-3 py-1 text-sm leading-[1.3] font-medium ${config.styles}`}
    >
      {config.label}
    </span>
  );
}

export { Badge };
