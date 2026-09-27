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
  /** Aihepiirin väri yläotsakkeessa: sininen = jalkapallo, messinki = ruoka. */
  topic?: "football" | "food";
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
  topic = "football",
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
          <p
            className={cn(
              "text-[13px] font-semibold uppercase tracking-[0.12em]",
              topic === "food" ? "text-brass-text" : "text-accent",
            )}
          >
            {eyebrow}
          </p>
        )}

        <h1 className="font-display text-4xl leading-[1.1] text-heading sm:text-5xl">
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
