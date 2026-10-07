import type { Metadata } from "next";
import { stegaClean } from "next-sanity";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardArrow,
  CardBody,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/card";
import { arkistoNav, rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  KISATYYPIT,
  arvokisaMitalitaulukotQuery,
  arvokisatListQuery,
  kisatyyppiLabel,
  withSlug,
  type ArvokisaCard,
  type Kisatyyppi,
} from "@/sanity/lib/queries/arkisto-laajennus";
import type { TilastoDoc } from "@/sanity/lib/queries/arkisto";

import { StatSections } from "../_tilastot/stat-sections";

export const revalidate = 3600;

const PATH = "/jalkapalloarkisto/arvokisat";
const TITLE = "Arvokisat";
const LEAD =
  "Jalkapallon arvokisat kisa kerrallaan: isäntämaat, voittajat ja Suomen sijoitus. " +
  "Kisat on ryhmitelty kisatyypin mukaan, uusin vuosi ensin.";

const trail = [
  rootCrumb,
  { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
  { label: TITLE },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: TITLE,
    description: LEAD,
    path: PATH,
  });
}

/** Ryhmittelee kisat kisatyypin mukaan. Kyselyn järjestys (vuosi desc) säilyy. */
function groupByKisatyyppi(items: (ArvokisaCard & { slug: string })[]) {
  return KISATYYPIT.map((kisatyyppi) => ({
    kisatyyppi,
    label: kisatyyppiLabel(kisatyyppi),
    items: items.filter((item) => resolveKisatyyppi(item) === kisatyyppi),
  })).filter((group) => group.items.length > 0);
}

/** Tuntematon tai puuttuva kisatyyppi päätyy "Muut kisat" -ryhmään. */
function resolveKisatyyppi(item: ArvokisaCard): Kisatyyppi {
  const value = stegaClean(item.kisatyyppi) as Kisatyyppi | null | undefined;
  return value && KISATYYPIT.includes(value) ? value : "muu";
}

export default async function ArvokisatPage() {
  const [kisatRaw, mitalitaulukot] = await Promise.all([
    sanityFetch<ArvokisaCard[]>({
      query: arvokisatListQuery,
      tags: ["arvokisa"],
      fallback: [],
    }),
    // Vanhat mmtilasto-, emtilasto- ja kansojenliiga-sivut ohjautuvat tänne,
    // joten niiden mitalitaulukot näytetään listauksen yhteydessä.
    sanityFetch<TilastoDoc[]>({
      query: arvokisaMitalitaulukotQuery,
      tags: ["jalkapalloTilasto", "arvokisa"],
      fallback: [],
    }),
  ]);
  const kisat = withSlug(kisatRaw);

  const groups = groupByKisatyyppi(kisat);

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: TITLE,
            description: LEAD,
            path: PATH,
            itemCount: kisat.length,
          }),
        ]}
      />

      <PageHeader
        eyebrow="Jalkapalloarkisto"
        title={TITLE}
        lead={LEAD}
        breadcrumbs={trail}
        meta={
          kisat.length > 0 ? (
            <Badge tone="brand">
              {kisat.length} {kisat.length === 1 ? "kisa" : "kisaa"}
            </Badge>
          ) : undefined
        }
      />

      <SectionNav
        items={arkistoNav}
        label="Jalkapalloarkiston osiot"
        className="mt-8"
      />

      {groups.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
          Arvokisoja ei ole vielä lisätty. Ne julkaistaan tälle sivulle
          myöhemmin.
        </p>
      ) : (
        <div className="mt-12 space-y-14">
          {groups.map((group) => (
            <section key={group.kisatyyppi} aria-labelledby={`kisat-${group.kisatyyppi}`}>
              <h2
                id={`kisat-${group.kisatyyppi}`}
                className="font-display text-2xl text-foreground sm:text-3xl"
              >
                {group.label}
              </h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((kisa) => (
                  <li key={kisa._id}>
                    <ArvokisaListCard kisa={kisa} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {mitalitaulukot.length > 0 && (
        <section aria-labelledby="mitalistit" className="mt-16">
          <h2
            id="mitalistit"
            className="font-display text-2xl text-foreground sm:text-3xl"
          >
            Mitalistit
          </h2>
          <StatSections tilastot={mitalitaulukot} headingLevel="h3" className="mt-6" />
        </section>
      )}
    </Container>
  );
}

function ArvokisaListCard({ kisa }: { kisa: ArvokisaCard & { slug: string } }) {
  const isannat = kisa.isantamaat?.filter(Boolean) ?? [];

  return (
    <Card href={`/jalkapalloarkisto/arvokisat/${kisa.slug}`} className="h-full">
      {kisa.vuosi != null && <CardEyebrow>{kisa.vuosi}</CardEyebrow>}
      <CardTitle className="mt-1">{kisa.title}</CardTitle>

      {kisa.tiivistelma && (
        <CardBody className="mt-3 text-sm">{kisa.tiivistelma}</CardBody>
      )}

      <dl className="mt-4 space-y-1 text-sm">
        {isannat.length > 0 && (
          <FactRow label="Isäntämaa" value={isannat.join(", ")} />
        )}
        {kisa.voittaja && <FactRow label="Voittaja" value={kisa.voittaja} />}
        {kisa.suomenSijoitus && (
          <FactRow label="Suomi" value={kisa.suomenSijoitus} />
        )}
      </dl>

      <CardArrow label="Kisan tiedot" />
    </Card>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-muted-soft">{label}:</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
