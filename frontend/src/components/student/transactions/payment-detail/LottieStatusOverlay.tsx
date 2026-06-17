import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { SafeLottie } from "@/components/ui/lottie";
import { cn } from "@/lib/utils";
import {
  PAYMENT_LOTTIE_ASSETS,
  PAYMENT_OVERLAY_TIMING,
} from '@/lib/transactions/payment-motion';

type LottieStatusOverlayProps = {
  onComplete: () => void;
  status: "success" | "failed";
  targetRef: RefObject<HTMLDivElement | null>;
};

export function LottieStatusOverlay({
  onComplete,
  status,
  targetRef,
}: LottieStatusOverlayProps) {
  const iconRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);

  const finish = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
  }, [isExiting]);

  useEffect(() => {
    const timer = window.setTimeout(finish, PAYMENT_OVERLAY_TIMING.display);
    return () => window.clearTimeout(timer);
  }, [finish]);

  useEffect(() => {
    if (!isExiting) return;

    const icon = iconRef.current;
    const target = targetRef.current;
    if (
      icon &&
      target &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const sourceRect = icon.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const translateX =
        targetRect.left +
        targetRect.width / 2 -
        (sourceRect.left + sourceRect.width / 2);
      const translateY =
        targetRect.top +
        targetRect.height / 2 -
        (sourceRect.top + sourceRect.height / 2);
      const scale = targetRect.width / sourceRect.width;

      requestAnimationFrame(() => {
        icon.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
        icon.style.opacity = "0";
      });
    }

    const timer = window.setTimeout(onComplete, PAYMENT_OVERLAY_TIMING.exit);
    return () => window.clearTimeout(timer);
  }, [isExiting, onComplete, targetRef]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-hidden p-6 transition-opacity duration-[1200ms] ease-in-out motion-reduce:transition-none",
        isExiting && "opacity-0",
      )}
      onClick={finish}
      role="dialog"
      aria-modal="true"
      aria-label={
        status === "success" ? "Pembayaran berhasil" : "Pembayaran gagal"
      }
    >
      <div
        className={cn(
          "absolute inset-0 transform-gpu transition-transform duration-[1200ms] ease-in-out motion-reduce:transition-none",
          status === "success"
            ? "bg-linear-to-br from-emerald-700 via-emerald-600 to-teal-600"
            : "bg-linear-to-br from-rose-800 via-rose-700 to-red-700",
          isExiting && "scale-105",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_58%)]" />
      </div>

      <div
        className={cn(
          "relative flex max-w-sm flex-col items-center text-center transition-all duration-[1200ms] ease-in-out motion-reduce:transition-none",
          isExiting
            ? "translate-y-2 scale-95 opacity-0"
            : "translate-y-0 scale-100 opacity-100",
        )}
      >
        <div
          ref={iconRef}
          className="size-56 transform-gpu rounded-full transition-[transform,opacity] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:size-64"
        >
          <SafeLottie
            src={PAYMENT_LOTTIE_ASSETS[status]}
            loop={false}
            autoplay
          />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
          {status === "success" ? "Pembayaran berhasil" : "Pembayaran gagal"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/80">
          {status === "success"
            ? "Transaksi telah diverifikasi. Detail pembayaran sedang disiapkan."
            : "Transaksi belum dapat diselesaikan. Lihat detail untuk langkah berikutnya."}
        </p>
        <span className="mt-5 text-xs font-semibold text-white/60">
          Ketuk untuk melanjutkan
        </span>
      </div>
    </div>
  );
}
