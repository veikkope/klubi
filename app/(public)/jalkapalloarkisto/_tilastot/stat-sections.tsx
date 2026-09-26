import { PortableText } from "@/components/portable-text";
import { StatTable } from "@/components/ui/stat-table";
import { cn } from "@/lib/cn";
import type { TilastoDoc } from "@/sanity/lib/queries/arkisto";

/**
 * Jalkapalloarkiston tilastolistauksen yhteinen renderöinti.
 *
 * Yksityinen `_tilastot`-kansio ei tuota reittiä (Next.js ohittaa alaviivalla
 * alkavat kansiot). Komponentti asuu arkiston oman kansion sisällä, koska
 * jaetut `components/`-kansiot ovat vain luku rinnakkaisajon aikana.
 */

const emptyMessageDefault = "Tilastoja ei ole vielä lisätty Studiossa.";

export function ArkistoEmpty({
  title = "Ei vielä tilastoja",
  message = emptyMessageDefault,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="font-serif text-2xl text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-muted">{message}</p>
    </div>
  );
}

function Sources({ sources }: { sources: string[] | null }) {
  const items = (sources ?? []).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <div className="mt-4 text-sm text-muted">
      <p className="font-medium text-foreground">Lähteet</p>
      <ul className="mt-1 flex flex-col">
        {items.map((source) => (
          <li key={source}>
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center break-all text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              {source}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Yhden tilaston sisältö ilman otsikkoa: johdanto, taulukko ja lähteet.
 * Otsikon omistaa kutsuja, jotta otsikkotasot pysyvät järjestyksessä.
 */
export function TilastoBody({
  tilasto,
  className,
}: {
  tilasto: TilastoDoc;
  className?: string;
}) {
  return (
    <div className={className}>
      {tilasto.intro && tilasto.intro.length > 0 && (
        <div className="max-w-3xl">
          <PortableText value={tilasto.intro} />
        </div>
      )}

      <StatTable
        className="mt-6"
        caption={tilasto.title}
        columns={tilasto.columns ?? []}
        rows={tilasto.rows ?? []}
        emptyLabel="Taulukon rivejä ei ole vielä lisätty Studiossa."
      />

      <Sources sources={tilasto.sources} />
    </div>
  );
}

interface StatSectionsProps {
  tilastot: TilastoDoc[];
  /** Otsikkotaso taulukon otsikolle — h3 kun sivulla on jo väliotsikko h2. */
  headingLevel?: "h2" | "h3";
  emptyTitle?: string;
  emptyMessage?: string;
  className?: string;
}

export function StatSections({
  tilastot,
  headingLevel = "h2",
  emptyTitle,
  emptyMessage,
  className,
}: StatSectionsProps) {
  if (tilastot.length === 0) {
    return <ArkistoEmpty title={emptyTitle} message={emptyMessage} />;
  }

  const Heading = headingLevel;
  const headingClass =
    headingLevel === "h2"
      ? "font-serif text-2xl leading-tight text-foreground sm:text-3xl"
      : "font-serif text-xl leading-tight text-foreground sm:text-2xl";

  return (
    <div className={cn("flex flex-col gap-14", className)}>
      {tilastot.map((tilasto) => (
        <section
          key={tilasto._id}
          id={tilasto.slug ?? undefined}
          className="scroll-mt-24"
        >
          <Heading className={headingClass}>{tilasto.title}</Heading>

          {tilasto.tiivistelma && (
            <p className="mt-3 max-w-3xl leading-relaxed text-muted">
              {tilasto.tiivistelma}
            </p>
          )}

          <TilastoBody tilasto={tilasto} className="mt-2" />
        </section>
      ))}
    </div>
  );
}
