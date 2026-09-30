import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import { Tunnistelista } from "@/components/tunnistelista";
import { LinkButton } from "@/components/ui/button";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { ryhmitaAlkukirjaimittain, suosituimmat, TUNNISTEET_POLKU } from "@/lib/tunnisteet";

import { haeTunnisteet } from "../_lib/tunnisteet";

/**
 * Tunnistehakemisto: blogin tunnistelistan vastine. Suosituimmat ensin,
 * sitten kaikki aakkosittain alkukirjaimen mukaan ryhmiteltynä.
 */

export const revalidate = 3600;

const SUOSITUIMPIA = 30;

const LEAD =
  "Uutisten aiheet, paikat, ravintolat ja henkilöt. Valitse tunniste, niin näet " +
  "kaikki sen kirjoitukset. Luku kertoo kirjoitusten määrän.";

export const metadata: Metadata = buildMetadata({
  title: "Uutisten tunnisteet",
  description: LEAD,
  path: TUNNISTEET_POLKU,
});

const trail = [rootCrumb, { label: "Uutiset", href: "/uutiset" }, { label: "Tunnisteet" }];

/** Kirjaimen ankkuri: "Ä" → "kirjain-ä" kelpaa id:ksi ja URL-fragmentiksi. */
function ankkuri(kirjain: string) {
  return kirjain === "0–9" ? "kirjain-0-9" : `kirjain-${kirjain.toLocaleLowerCase("fi")}`;
}

export default async function TunnisteetPage() {
  const { tunnisteet } = await haeTunnisteet();
  const ryhmat = ryhmitaAlkukirjaimittain(tunnisteet);
  const suosikit = suosituimmat(tunnisteet, SUOSITUIMPIA);

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: "Uutisten tunnisteet",
            description: LEAD,
            path: TUNNISTEET_POLKU,
            itemCount: tunnisteet.length,
          }),
        ]}
      />

      <Container className="pt-12">
        <PageHeader
          title="Tunnisteet"
          lead={LEAD}
          breadcrumbs={trail}
          actions={
            <LinkButton href="/uutiset" variant="secondary">
              Kaikki uutiset
            </LinkButton>
          }
        />
      </Container>

      {tunnisteet.length === 0 ? (
        <Container className="py-16">
          <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <p className="font-display text-2xl">Ei vielä tunnisteita</p>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Tunnisteet lisätään uutisiin Sanity Studiossa. Ne ilmestyvät tähän heti julkaisun jälkeen.
            </p>
          </div>
        </Container>
      ) : (
        <>
          <Container className="py-12">
            <section aria-labelledby="suosituimmat">
              <h2 id="suosituimmat" className="font-display text-2xl sm:text-3xl">
                Suosituimmat
              </h2>
              <Tunnistelista
                className="mt-6"
                tunnisteet={suosikit.map(({ nimi, maara }) => ({ nimi, maara }))}
              />
            </section>
          </Container>

          <section aria-labelledby="kaikki-tunnisteet" className="border-t border-border bg-surface py-16">
            <Container>
              <h2 id="kaikki-tunnisteet" className="font-display text-2xl sm:text-3xl">
                Kaikki tunnisteet A–Ö
              </h2>
              <p className="mt-2 text-sm text-muted">{tunnisteet.length} tunnistetta.</p>

              <nav aria-label="Hyppää alkukirjaimeen" className="mt-6">
                <ul className="flex list-none flex-wrap gap-1 p-0">
                  {ryhmat.map(({ kirjain }) => (
                    <li key={kirjain}>
                      <a
                        href={`#${ankkuri(kirjain)}`}
                        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-sm border border-border bg-background px-2 text-sm font-medium transition hover:border-accent hover:text-accent"
                      >
                        {kirjain}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-10 space-y-10">
                {ryhmat.map(({ kirjain, tunnisteet: ryhma }) => (
                  <section key={kirjain} aria-labelledby={ankkuri(kirjain)} className="scroll-mt-24">
                    <h3 id={ankkuri(kirjain)} className="scroll-mt-24 border-b border-border pb-2 font-display text-xl">
                      {kirjain}
                    </h3>
                    <Tunnistelista
                      className="mt-4"
                      tunnisteet={ryhma.map(({ nimi, maara }) => ({ nimi, maara }))}
                    />
                  </section>
                ))}
              </div>
            </Container>
          </section>
        </>
      )}
    </>
  );
}
