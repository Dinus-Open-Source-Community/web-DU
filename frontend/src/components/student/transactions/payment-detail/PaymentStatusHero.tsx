import type { RefObject } from "react";
import { ShieldCheck } from "lucide-react";

import { SafeLottie } from "@/components/ui/lottie";
import type { PaymentInvoiceViewModel } from "@/lib/transactions/present-payment-invoice-view";
import { cn } from "@/lib/utils";
import { PAYMENT_LOTTIE_ASSETS } from "./payment-motion";

type PaymentStatusHeroProps = {
  invoice: PaymentInvoiceViewModel;
  lottieTargetRef: RefObject<HTMLDivElement | null>;
};

export function PaymentStatusHero({
  invoice,
  lottieTargetRef,
}: PaymentStatusHeroProps) {
  const isSuccess = invoice.paymentStatus === "success";
  const isFailed = invoice.paymentStatus === "failed";
  const isTerminal = isSuccess || isFailed;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border px-5 py-8 text-center shadow-sm sm:px-8 sm:py-10",
        isSuccess &&
          "border-emerald-200 bg-linear-to-b from-emerald-50 to-white",
        isFailed && "border-rose-200 bg-linear-to-b from-rose-50 to-white",
        !isTerminal && "border-amber-200 bg-linear-to-b from-amber-50 to-white",
      )}
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-1/4 top-0 h-32 rounded-full blur-3xl",
          isSuccess
            ? "bg-emerald-200/50"
            : isFailed
              ? "bg-rose-200/50"
              : "bg-amber-200/50",
        )}
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center">
        <div
          ref={lottieTargetRef}
          className={cn(
            "flex size-24 items-center justify-center sm:size-28",
            "animate-in zoom-in-90 fade-in duration-700 ease-out motion-reduce:animate-none",
          )}
        >
          {isTerminal ? (
            <SafeLottie
              src={
                PAYMENT_LOTTIE_ASSETS[
                  invoice.paymentStatus as "success" | "failed"
                ]
              }
              className="rounded-none bg-transparent"
              loop
              autoplay
            />
          ) : (
            <ShieldCheck
              className="size-11 text-amber-500"
              strokeWidth={1.8}
              aria-hidden
            />
          )}
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {isSuccess
            ? "Pembayaran berhasil"
            : isFailed
              ? "Pembayaran belum berhasil"
              : "Selesaikan pembayaran Anda"}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
          {invoice.statusMessage}
        </p>
        <p className="mt-4 font-mono text-xs font-semibold tracking-wide text-slate-500">
          Ref. {invoice.reference}
        </p>
      </div>
    </section>
  );
}
