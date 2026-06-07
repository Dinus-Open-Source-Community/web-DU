import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  className?: string;
};

const CONTAINER_CLASS =
  "relative flex  items-center gap-1.5 rounded-lg bg-slate-100 p-1.5 shadow-inner w-max";

const SCROLLBAR_HIDDEN =
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const TAB_CLASS =
  "relative z-10 flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:h-10 sm:px-4 sm:text-sm";

export function SegmentedFilter<T extends string>({
  items,
  value,
  onChange,
  variant = "scroll",
  className,
}: SegmentedFilterProps<T>) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = items.findIndex((t) => t.value === value);

  const updateIndicator = useCallback(() => {
    const activeTab = tabsRef.current[activeIndex];
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [activeIndex]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, items.length, value]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(container);
    window.addEventListener("resize", updateIndicator);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  return (
    <div
      ref={containerRef}
      className={cn(
        CONTAINER_CLASS,
        variant === "scroll" && cn("overflow-x-auto", SCROLLBAR_HIDDEN),
        variant === "wrap" && "flex-wrap",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute top-1.5 bottom-1.5 hidden rounded-lg border border-slate-200/60 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-300 ease-in-out sm:block"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          opacity: indicatorStyle.width > 0 ? 1 : 0,
        }}
      />

      {items.map((item, index) => {
        const active = value === item.value;

        return (
          <button
            key={item.value}
            type="button"
            ref={(el) => {
              tabsRef.current[index] = el;
            }}
            onClick={() => onChange(item.value)}
            className={cn(
              TAB_CLASS,
              active
                ? "text-primary font-semibold"
                : "text-slate-500 hover:text-slate-800",
              active &&
                "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-slate-200/70 sm:bg-transparent sm:shadow-none sm:ring-0",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
