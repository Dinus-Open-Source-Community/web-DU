import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

export interface GlobalSelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const GlobalSelect = ({
  label,
  placeholder = "Select an option",
  options,
  value,
  onValueChange,
  className,
}: GlobalSelectProps) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label className="text-sm leading-[1.4] font-normal tracking-tight text-[#2D3748]">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            "h-full w-full rounded-md border-[#000000]/20 bg-white py-5.5",
            className,
          )}
        >
          <SelectValue
            placeholder={placeholder}
            className="font-normal text-[#BFBFBF]"
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
