import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

type StarsProps = {
  value: number;
  max?: number;
  className?: string;
  /** Saavutettavuus: korvaa visuaalisesti piilotetun tekstin oletuksen. */
  label?: string;
};

export function Stars({ value, max = 5, className, label }: StarsProps) {
  const safe = Math.max(0, Math.min(max, Math.round(value)));
  const ariaLabel = label ?? `${safe}/${max} tähteä`;
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={ariaLabel}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < safe;
        return (
          <Star
            key={i}
            aria-hidden
            size={16}
            className={cn(
              filled ? "fill-brand-500 text-brand-500" : "text-border-strong",
            )}
          />
        );
      })}
    </span>
  );
}
