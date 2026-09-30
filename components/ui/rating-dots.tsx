import { cn } from "@/lib/cn";

type RatingDotsProps = {
  /** Arvosana 0–5. Pallo täyttyy kymmenyksen tarkkuudella: 4,4 = neljä täyttä ja 40 % viidennestä. */
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

/** Pallon täyttöaste 0–100 % kymmenyksen portain (sama tarkkuus kuin näytetty luku). */
function fillPercent(value: number, index: number): number {
  const tenths = Math.round(value * 10) - index * 10;
  return Math.max(0, Math.min(10, tenths)) * 10;
}

export function RatingDots({
  value,
  max = 5,
  size = "md",
  className,
  label,
}: RatingDotsProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const exact = clamped.toFixed(1).replace(".", ",");
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
      {Array.from({ length: max }, (_, i) => {
        const fill = fillPercent(clamped, i);
        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              "rounded-full border-[1.5px] border-brass bg-origin-border",
              dotSize[size],
            )}
            // Osittainen pallo täyttyy vasemmalta: kova raja gradientissa.
            style={
              fill > 0
                ? { backgroundImage: `linear-gradient(to right, var(--brass) ${fill}%, transparent ${fill}%)` }
                : undefined
            }
          />
        );
      })}
    </span>
  );
}
