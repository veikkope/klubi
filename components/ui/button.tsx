import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "onDark"
  | "onDarkPrimary";
type Size = "md" | "lg";

// Tyyliopas: pääpainike klubinsininen → hover yönsininen; toissijainen
// yönsininen reuna → hover vaalea sininen. Tummalla pohjalla käännetyt.
const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover hover:text-on-primary",
  secondary:
    "bg-surface-strong text-foreground hover:bg-border hover:text-foreground",
  outline:
    "border border-navy bg-transparent text-navy hover:bg-blue-tint hover:text-navy",
  ghost:
    "bg-transparent text-foreground hover:bg-surface-strong hover:text-foreground",
  onDark:
    "border border-white bg-transparent text-white hover:bg-white/10 hover:text-white",
  onDarkPrimary:
    "bg-white text-navy hover:bg-blue-tint hover:text-navy",
};

// lg = tyylioppaan 48 px painike (16 px / 600, sivupehmuste 26 px)
const sizes: Record<Size, string> = {
  md: "h-10 px-5 text-[15px]",
  lg: "h-12 px-[26px] text-base",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-sm font-semibold no-underline transition focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

type LinkButtonProps = BaseProps & {
  href: string;
  external?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(baseClass, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  external,
}: LinkButtonProps) {
  const classes = cn(baseClass, variants[variant], sizes[size], className);
  if (external || /^https?:/.test(href)) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
