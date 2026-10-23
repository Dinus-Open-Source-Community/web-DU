import { cn } from "../../lib/utils";

export type SegmentedItem<T extends string = string> = {
  value: T;
  label: string;
};

export type SegmentedFilterVariant = "scroll" | "wrap";

type SegmentedFilterProps<T extends string> = {
  items: SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: SegmentedFilterVariant;
  ariaLabel?: string;
  className?: string;
};

const CONTAINER_CLASS =
  "inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg border-2 border-ink-900/10 bg-paper-paper p-1";

const TAB_CLASS =
  "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm transition-all";

export function SegmentedFilter<T extends string>({
  items,
  value,
  onChange,
  ariaLabel = "Filter tab",
  className,
}: SegmentedFilterProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(CONTAINER_CLASS, className)}
    >
      {items.map((item) => {
        const active = value === item.value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              TAB_CLASS,
              active
                ? "bg-brand-blue font-bold text-white shadow-none"
                : "font-semibold text-ink-500 hover:bg-paper-white hover:text-ink-800",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
