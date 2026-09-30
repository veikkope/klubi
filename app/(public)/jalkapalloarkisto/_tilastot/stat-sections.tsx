import { PortableText } from "@/components/portable-text";
import { UusiValilehti } from "@/components/ui/uusi-valilehti";
import { SanityImage } from "@/components/sanity-image";
import { StatTable } from "@/components/ui/stat-table";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { SanityImage as SanityImageData } from "@/lib/types";
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
      <p className="font-display text-2xl text-foreground">{title}</p>
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
              className="inline-flex min-h-11 items-center break-all text-accent underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {source}
              <UusiValilehti />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Tilaston kuvat (kaaviot, otteluohjelmat, joukkuekuvat) rajaamattomina.
 * Kuvateksti näkyy `figcaption`ina; alt-teksti on kuvassa itsessään.
 */
export function TilastoKuvat({
  kuvat,
  className,
}: {
  kuvat: SanityImageData[] | null | undefined;
  className?: string;
}) {
  const items = (kuvat ?? []).filter((kuva) => kuva?.asset);
  if (items.length === 0) return null;

  return (
    <ul className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((kuva, index) => (
        <li key={`${kuva?.asset?._ref ?? "kuva"}-${index}`}>
          <figure>
            <SanityImage
              image={kuva}
              kuvateksti={kuva?.caption}
              width={900}
              crop={false}
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
              className="h-auto w-full rounded-xl border border-border bg-surface"
            />
            {kuva?.caption && (
              <figcaption className="mt-2 text-sm text-muted">{kuva.caption}</figcaption>
            )}
          </figure>
        </li>
      ))}
    </ul>
  );
}

function hasBlocks(value: unknown[] | null | undefined): boolean {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Yhden tilaston sisältö ilman otsikkoa: johdanto, taulukko, lisätiedot,
 * kuvat, päivityspäivä ja lähteet. Otsikon omistaa kutsuja, jotta
 * otsikkotasot pysyvät järjestyksessä.
 */
export function TilastoBody({
  tilasto,
  ylinOtsikko,
  className,
}: {
  tilasto: TilastoDoc;
  /** Tekstisisällön ylimmän otsikon taso: yhtä syvemmällä kuin kutsujan otsikko. */
  ylinOtsikko: 2 | 3 | 4;
  className?: string;
}) {
  const hasTable = (tilasto.columns?.length ?? 0) > 0 && (tilasto.rows?.length ?? 0) > 0;
  // Osa tilastoista on pelkkää tekstiä (valmentajien palkat, FIFA-rankingin
  // uutinen, EM 2028 -karsinnan ottelut): tyhjää taulukkoa ei silloin mainita.
  const hasText = hasBlocks(tilasto.intro) || hasBlocks(tilasto.lisatiedot);
  const hasImages = (tilasto.kuvat ?? []).some((kuva) => kuva?.asset);

  return (
    <div className={className}>
      {hasBlocks(tilasto.intro) && (
        <div className="max-w-3xl">
          <PortableText value={tilasto.intro} ylinOtsikko={ylinOtsikko} />
        </div>
      )}

      {(hasTable || (!hasText && !hasImages)) && (
        <StatTable
          className="mt-6"
          caption={tilasto.title}
          columns={tilasto.columns ?? []}
          rows={tilasto.rows ?? []}
          emptyLabel="Taulukon rivejä ei ole vielä lisätty Studiossa."
        />
      )}

      {tilasto.paivitetty && (
        <p className="mt-3 text-sm text-muted">
          Tiedot päivitetty{" "}
          <time dateTime={tilasto.paivitetty}>{formatDate(tilasto.paivitetty)}</time>
        </p>
      )}

      {hasBlocks(tilasto.lisatiedot) && (
        <div className="mt-8 max-w-3xl">
          <PortableText value={tilasto.lisatiedot} ylinOtsikko={ylinOtsikko} />
        </div>
      )}

      <TilastoKuvat kuvat={tilasto.kuvat} className="mt-8" />

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
      ? "font-display text-2xl leading-tight text-foreground sm:text-3xl"
      : "font-display text-xl leading-tight text-foreground sm:text-2xl";

  return (
    <div className={cn("flex flex-col gap-14", className)}>
      {tilastot.map((tilasto) => (
        <section
          key={tilasto._id}
          id={tilasto.slug ?? undefined}
        >
          <Heading className={headingClass}>{tilasto.title}</Heading>

          {tilasto.tiivistelma && (
            <p className="mt-3 max-w-3xl leading-relaxed text-muted">
              {tilasto.tiivistelma}
            </p>
          )}

          <TilastoBody tilasto={tilasto} ylinOtsikko={headingLevel === "h2" ? 3 : 4} className="mt-2" />
        </section>
      ))}
    </div>
  );
}
