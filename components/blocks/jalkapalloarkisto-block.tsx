import Link from "next/link";

import { Container } from "@/components/layout/container";
import { BlockHeading } from "@/components/blocks/block-heading";
import { LinkButton } from "@/components/ui/button";
import { StatTable } from "@/components/ui/stat-table";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  etusivuArkistoQuery,
  type ArkistoTeaserData,
} from "@/sanity/lib/queries/etusivu";
import { arkistoNav } from "@/lib/nav-sections";
import { formatDate } from "@/lib/format";

/**
 * Jalkapalloarkiston teaser (docs/02 §"Etusivun rakenne", kohta 6).
 *
 * Kaksi tehtävää:
 *  1. **Kävijälle:** näyttää tuoreimman FIFA-rankingin kärjen ja arkiston
 *     laajuuden lukuina — arkisto on klubin sivuston laajin aineisto, eikä se
 *     saa jäädä pelkän valikkokohdan taakse.
 *  2. **Löydettävyydelle:** etusivu linkittää jokaiseen arkiston hub-sivuun.
 *     Linkit luetaan `lib/nav-sections.ts`:stä, joten ne eivät voi ajautua
 *     erilleen todellisista reiteistä.
 *
 * Taulukko on oikeaa HTML:ää `<caption>`- ja `<th scope>` -merkintöineen
 * (docs/11 §7.3) — ei kuva, ei canvas.
 */

export type JalkapalloarkistoBlockProps = {
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const emptyTeaser: ArkistoTeaserData = {
  arvokisat: 0,
  pelaajat: 0,
  stadionit: 0,
  tilastot: 0,
  fifa: null,
};

/** Näytetään vain ne luvut joissa on sisältöä. */
function buildCounts(data: ArkistoTeaserData) {
  return [
    { label: "arvokisaa", value: data.arvokisat },
    { label: "tilastoa", value: data.tilastot },
    { label: "pelaajaa", value: data.pelaajat },
    { label: "stadionia", value: data.stadionit },
  ].filter((entry) => entry.value > 0);
}

export async function JalkapalloarkistoBlock({
  heading = "Jalkapalloarkisto",
  body,
  ctaLabel = "Selaa arkistoa",
  ctaHref = "/jalkapalloarkisto",
}: JalkapalloarkistoBlockProps) {
  const data = await sanityFetch<ArkistoTeaserData>({
    query: etusivuArkistoQuery,
    tags: ["arvokisa", "pelaaja", "stadion", "jalkapalloTilasto"],
    fallback: emptyTeaser,
  });

  const counts = buildCounts(data);
  const fifaColumns = data.fifa?.columns ?? [];
  const fifaRows = data.fifa?.rows ?? [];
  const showFifa = fifaColumns.length > 0 && fifaRows.length > 0;

  // Yleiskatsaus on jo CTA-napissa, joten se jätetään linkkiruudukosta pois.
  const sections = arkistoNav.filter((item) => item.href !== ctaHref);

  return (
    <section
      className="border-y border-border bg-surface py-20 sm:py-24"
      aria-labelledby="etusivu-arkisto"
    >
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div>
            <BlockHeading
              id="etusivu-arkisto"
              eyebrow="Klubin kokoama aineisto"
              title={heading}
            />

            {body && (
              <p className="mt-5 max-w-xl text-pretty text-xl leading-relaxed text-muted">
                {body}
              </p>
            )}

            {counts.length > 0 && (
              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
                {counts.map((entry) => (
                  // flex-col-reverse: dt on DOM:ssa ensin (semantiikka),
                  // mutta luku näytetään ylempänä (luettavuus).
                  <div key={entry.label} className="flex flex-col-reverse">
                    <dt className="mt-1 text-sm text-muted">{entry.label}</dt>
                    <dd className="font-display text-3xl leading-none tabular-nums text-foreground">
                      {entry.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <nav aria-label="Jalkapalloarkiston osiot" className="mt-8">
              <ul className="flex flex-wrap gap-2">
                {sections.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-11 items-center rounded-sm border border-border bg-background px-4 text-sm text-muted transition hover:border-accent hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8">
              <LinkButton href={ctaHref} size="lg" variant="primary">
                {ctaLabel}
              </LinkButton>
            </div>
          </div>

          {showFifa && data.fifa && (
            <div>
              <StatTable
                caption={data.fifa.title}
                captionVisible
                columns={fifaColumns}
                rows={fifaRows}
                className="bg-background"
              />
              <p className="mt-3 text-sm text-muted">
                Päivitetty {formatDate(data.fifa._updatedAt)}.{" "}
                <Link
                  href="/jalkapalloarkisto/fifa-ranking"
                  className="text-accent hover:text-accent-hover"
                >
                  Koko ranking
                </Link>
              </p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
