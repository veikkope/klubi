import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "muted";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-strong text-foreground",
  brand: "bg-brand-50 text-brand-800",
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
