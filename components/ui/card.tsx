import Link from "next/link";
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

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

/**
 * Linkitetty kortti ("stretched link"): linkki on vain otsikossa (`CardTitle`),
 * ja sen ::after-kerros kattaa koko kortin, joten kortti on silti kokonaan
 * klikattava. Ruudunlukija kuulee linkkinä pelkän otsikon, ja päiväys, ingressi
 * ym. luetaan tavallisena tekstinä. Koko kortti linkkinä teki linkin nimeksi
 * kaiken tekstin, jopa ~270 merkkiä (docs/16, saavutettavuus-7).
 *
 * Linkki liitetään automaattisesti ensimmäiseen `CardTitle`-otsikkoon, joten
 * kutsujien ei tarvitse tehdä mitään. Jos otsikkoa ei ole, koko kortti on linkki.
 */
export function Card({ href, className, children }: CardProps) {
  if (href) {
    const { lapset, loytyi } = linkitaOtsikko(children, href);
    if (loytyi) {
      return (
        <div
          className={cn(
            cardBase,
            "group relative hover:border-border-strong hover:shadow-panel",
            // Fokus näkyy koko kortin ympärillä, vaikka se on otsikkolinkissä.
            "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2",
            className,
          )}
        >
          {lapset}
        </div>
      );
    }
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

/** Etsii ensimmäisen `CardTitle`-otsikon (myös sisäkkäisistä elementeistä) ja antaa sille linkin. */
function linkitaOtsikko(children: ReactNode, href: string): { lapset: ReactNode; loytyi: boolean } {
  let loytyi = false;
  const kay = (solmu: ReactNode): ReactNode =>
    Children.map(solmu, (lapsi) => {
      if (loytyi || !isValidElement(lapsi)) return lapsi;
      if (lapsi.type === CardTitle) {
        loytyi = true;
        return cloneElement(lapsi as ReactElement<CardTitleProps>, { href });
      }
      const sisalto = (lapsi.props as { children?: ReactNode }).children;
      if (sisalto === undefined) return lapsi;
      return cloneElement(lapsi, undefined, kay(sisalto));
    });
  const lapset = kay(children);
  return { lapset, loytyi };
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

type CardTitleProps = {
  children: ReactNode;
  className?: string;
  /** h2, kun korttilista on suoraan sivun h1:n alla (otsikkotasot eivät saa hypätä). */
  as?: "h2" | "h3";
  /** Kortin linkki. `Card href` asettaa tämän itse; älä anna käsin. */
  href?: string;
};

export function CardTitle({ children, className, as: Tagi = "h3", href }: CardTitleProps) {
  return (
    <Tagi className={cn("font-display text-[1.375rem] leading-[1.3] text-heading", className)}>
      {href ? (
        <Link
          href={href}
          className="text-inherit no-underline after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:outline-none"
        >
          {children}
        </Link>
      ) : (
        children
      )}
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

/** Näkyvä kehotus. Ruudunlukijalta piilotettu: linkki on jo otsikossa. */
export function CardArrow({ label = "Lue lisää" }: { label?: string }) {
  return (
    <span aria-hidden className="mt-4 inline-flex items-center gap-1 text-[15px] font-semibold text-accent underline underline-offset-4 transition group-hover:text-accent-hover">
      {label}
      <span aria-hidden>→</span>
    </span>
  );
}
