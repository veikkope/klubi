import { cn } from "@/lib/cn";
import { Breadcrumbs, type Crumb } from "@/components/layout/breadcrumbs";

/**
 * Sivun yhtenäinen aloitus: murupolku, yläteksti, otsikko, tiivistelmä.
 *
 * Kaikki sisältösivut käyttävät tätä. Tiivistelmä on `lead`-kentässä, koska se
 * on sekä sivun ingressi että se teksti, jonka hakukone todennäköisimmin lainaa
 * — siksi se on aina sivun ensimmäinen kappale, ei kuvien tai valikkojen takana.
 */

interface PageHeaderProps {
  title: string;
  /** Sisällön `tiivistelma`-kenttä. */
  lead?: string | null;
  eyebrow?: string | null;
  breadcrumbs?: Crumb[];
  /** Esim. tähtiarvio, päivämäärä tai laskurit otsikon alle. */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  lead,
  eyebrow,
  breadcrumbs,
  meta,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      <div className="flex flex-col gap-3">
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
        )}

        <h1 className="font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>

        {lead && (
          <p className="max-w-3xl text-lg leading-relaxed text-muted">{lead}</p>
        )}
      </div>

      {meta && <div className="flex flex-wrap items-center gap-3">{meta}</div>}
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
