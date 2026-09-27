import { cn } from "@/lib/cn";

type RatingDotsProps = {
  /** Arvosana 0–5. Pyöristetään lähimpään kokonaiseen pisteeseen. */
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Ruudunlukijan teksti. Oletuksena tarkka arvo, esim. "3,9 / 5". */
  label?: string;
};

// Tyyliopas: ympyrät 9–12 px, väli 4–5 px. Täysi = messinki, tyhjä =
// läpinäkyvä 1,5 px messinkireunalla.
const dotSize = {
  sm: "size-[9px]",
  md: "size-[11px]",
  lg: "size-3",
};

export function RatingDots({
  value,
  max = 5,
  size = "md",
  className,
  label,
}: RatingDotsProps) {
  const filled = Math.max(0, Math.min(max, Math.round(value)));
  const exact = value.toFixed(1).replace(".", ",");
  return (
    <span
      role="img"
      aria-label={label ?? `${exact} / ${max}`}
      className={cn(
        "inline-flex items-center",
        size === "sm" ? "gap-1" : "gap-[5px]",
        className,
      )}
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "rounded-full border-[1.5px] border-brass",
            dotSize[size],
            i < filled && "bg-brass",
          )}
        />
      ))}
    </span>
  );
}
