import { cn } from "@/lib/utils"

type DuLoaderProps = {
  className?: string
  /** Pixel size of the SVG viewBox scales to this width */
  size?: number
  label?: string
}

/**
 * SVG loader: dual arcs with CSS stroke animation. Respects prefers-reduced-motion.
 */
export function DuLoader({ className, size = 40, label = "Memuat" }: DuLoaderProps) {
  return (
    <div
      className={cn("inline-flex flex-col items-center gap-3 text-primary", className)}
      role="status"
      aria-live="polite"
      aria-label={label}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="du-loader-svg text-primary">
        <title>{label}</title>
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="32 96"
          className="du-loader-arc du-loader-arc-a origin-center"
        />
        <circle
          cx="24"
          cy="24"
          r="12"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="20 56"
          className="du-loader-arc du-loader-arc-b origin-center"
        />
      </svg>
    </div>
  )
}
