import Link from "next/link";
import { cn } from "@/lib/cn";

type CardProps = {
  href?: string;
  className?: string;
  children: React.ReactNode;
};

// Tyyliopas: valkoinen kortti paperipohjalla, pyöristys 4 px, pehmuste 24 px.
// Reunaviiva on paperin sävyinen, jotta kortti erottuu myös valkoisella osiolla.
const cardBase =
  "block rounded-sm border border-border bg-surface p-6 no-underline transition";

export function Card({ href, className, children }: CardProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          cardBase,
          "group hover:border-border-strong hover:shadow-panel",
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
        "font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft",
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
  as: Tagi = "h3",
}: {
  children: React.ReactNode;
  className?: string;
  /** h2, kun korttilista on suoraan sivun h1:n alla (otsikkotasot eivät saa hypätä). */
  as?: "h2" | "h3";
}) {
  return (
    <Tagi className={cn("font-display text-[1.375rem] leading-[1.3] text-heading", className)}>
      {children}
    </Tagi>
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
    <p className={cn("text-[15px] text-muted leading-relaxed", className)}>{children}</p>
  );
}

export function CardArrow({ label = "Lue lisää" }: { label?: string }) {
  return (
    <span className="mt-4 inline-flex items-center gap-1 text-[15px] font-semibold text-accent underline underline-offset-4 transition group-hover:text-accent-hover">
      {label}
      <span aria-hidden>→</span>
    </span>
  );
}
