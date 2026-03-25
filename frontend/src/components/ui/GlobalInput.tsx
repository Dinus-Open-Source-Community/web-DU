import { ReactNode, InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface GlobalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  subLabel?: string;
  rightIcon?: ReactNode;
}

export const GlobalInput = ({
  label,
  subLabel,
  rightIcon,
  className,
  ...props
}: GlobalInputProps) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label className="text-sm leading-[1.4] font-normal tracking-tight text-[#2D3748]">
          {label}{" "}
          {subLabel && (
            <span className="text-xs font-normal text-gray-400">
              {subLabel}
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <Input
          className={cn(
            "h-full w-full rounded-md border-[#000000]/20 bg-white py-3 text-gray-800 placeholder:text-[#BFBFBF]",
            rightIcon && "pr-10",
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-3 flex items-center text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
};
