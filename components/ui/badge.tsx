import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "muted";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-strong text-foreground",
  brand: "bg-blue-tint text-navy",
  muted: "bg-transparent text-muted border border-border",
};

type BadgeProps = {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
};

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs px-2.5 py-1 text-[13px] font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
