import Link from "next/link";
import { cn } from "@/lib/cn";

type CardProps = {
  href?: string;
  className?: string;
  children: React.ReactNode;
};

const cardBase =
  "block rounded-2xl border border-border bg-surface p-6 transition";

export function Card({ href, className, children }: CardProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          cardBase,
          "group hover:border-brand-300 hover:shadow-lg",
          className,
        )}
      >
        {children}
      </Link>
    );
  }
  return <div className={cn(cardBase, className)}>{children}</div>;
}

export function CardEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs uppercase tracking-[0.18em] text-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("font-serif text-xl text-foreground", className)}>
      {children}
    </h3>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-muted leading-relaxed", className)}>{children}</p>
  );
}

export function CardArrow({ label = "Lue lisää" }: { label?: string }) {
  return (
    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent transition group-hover:translate-x-1">
      {label}
      <span aria-hidden>→</span>
    </span>
  );
}
