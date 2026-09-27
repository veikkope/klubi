import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardArrow,
  CardBody,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { formatDate } from "@/lib/format";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  arkistoSummaryQuery,
  arkistoTags,
  type TilastoSummary,
} from "@/sanity/lib/queries/arkisto";

import { ArkistoPage } from "./_tilastot/arkisto-page";
import {
  arkistoBasePath,
  arkistoTitle,
  arkistoTrail,
  countByCategory,
  latestUpdate,
  tableCountLabel,
} from "./_tilastot/helpers";
import { ArkistoEmpty } from "./_tilastot/stat-sections";
import { eurocupCategories } from "./eurocupit/competitions";

export const revalidate = 3600;

const description =
  "Klubin jalkapalloarkisto: Huuhkajien ottelut, arvokisat, Suomen mestarit, eurocupit, valmentajat ja FIFA-ranking taulukoina.";

const lead =
  "Lahden Suomalainen Klubi on koonnut jalkapallon tilastoja vuodesta 2007 " +
  "alkaen. Arkisto kattaa Suomen maajoukkueen ottelut ja karsinnat, " +
  "arvokisojen tulokset, Suomen mestarit, eurocupien finaalit sekä " +
  "palkintojen voittajat — vanhimmat taulukot ulottuvat 1900-luvun alkuun.";

interface ArkistoSection {
  href: string;
  title: string;
  eyebrow: string;
  body: string;
  /** Kategoriat joista kortin taulukkomäärä lasketaan. */
  categories?: string[];
}

const sections: ArkistoSection[] = [
  {
    href: "/jalkapalloarkisto/huuhkajat",
    title: "Huuhkajat",
    eyebrow: "Maajoukkue",
    body: "Suomen maajoukkueen otteluhistoria, pelaajatilastot ja karsintasarjat.",
    categories: ["huuhkajat", "karsinta"],
  },
  {
    href: "/jalkapalloarkisto/arvokisat",
    title: "Arvokisat",
    eyebrow: "MM ja EM",
    body: "MM- ja EM-kisojen tulokset, tilastot ja Kansojen liiga kisa kerrallaan.",
  },
  {
    href: "/jalkapalloarkisto/mestarit",
    title: "Suomen mestarit",
    eyebrow: "Sarjat",
    body: "Suomen mestaruuden voittaneet seurat vuosi vuodelta.",
    categories: ["champions"],
  },
  {
    href: "/jalkapalloarkisto/eurocupit",
    title: "Eurocupit",
    eyebrow: "Seurajoukkueet",
    body: "Champions League, Europa League, Conference League, Super Cup ja Intercontinental.",
    categories: eurocupCategories,
  },
  {
    href: "/jalkapalloarkisto/pelaajat",
    title: "Pelaajat",
    eyebrow: "Henkilöt",
    body: "Litmanen, Pikkuhuuhkajat ja maailman parhaat pelaajat omina koosteinaan.",
  },
  {
    href: "/jalkapalloarkisto/vuoden-pelaajat",
    title: "Vuoden pelaajat",
    eyebrow: "Palkinnot",
    body: "Suomen vuoden jalkapalloilijat ja FIFA:n vuoden pelaajat.",
    categories: ["vuoden-pelaaja"],
  },
  {
    href: "/jalkapalloarkisto/euroopan-paras",
    title: "Euroopan paras",
    eyebrow: "Palkinnot",
    body: "Ballon d'Or eli Euroopan parhaan pelaajan palkinto vuodesta 1956.",
    categories: ["ballon-dor"],
  },
  {
    href: "/jalkapalloarkisto/valmentajat",
    title: "Valmentajat",
    eyebrow: "Maajoukkue",
    body: "Huuhkajien päävalmentajat kausittain sekä tiedot valmentajien palkoista.",
    categories: ["valmentajat", "valmentajien-palkat"],
  },
  {
    href: "/jalkapalloarkisto/fifa-ranking",
    title: "FIFA-ranking",
    eyebrow: "Tilastot",
    body: "Suomen sijoitus FIFA:n maailmanlistalla ja listan kärkimaat.",
    categories: ["fifa-ranking"],
  },
  {
    href: "/jalkapalloarkisto/lupaavat",
    title: "Lupaavat pelaajat",
    eyebrow: "Palkinnot",
    body: "Vuosien 1980–1991 lupaavimmiksi valitut suomalaispelaajat.",
    categories: ["lupaavat"],
  },
  {
    href: "/jalkapalloarkisto/saavutukset",
    title: "Saavutukset",
    eyebrow: "Historia",
    body: "Suomalaisen jalkapallon merkittävimmät saavutukset aikajärjestyksessä.",
    categories: ["saavutukset"],
  },
  {
    href: "/jalkapalloarkisto/ulkomaiset-mestarit",
    title: "Ulkomaiset mestarit",
    eyebrow: "Sarjat",
    body: "Englannin ja Venäjän mestarit sekä Englannin seurojen mestaruudet ja cupvoitot.",
    categories: ["ulkomaiset-mestarit"],
  },
  {
    href: "/jalkapalloarkisto/palloliitto",
    title: "Palloliiton puheenjohtajat",
    eyebrow: "Historia",
    body: "Suomen Palloliiton puheenjohtajat kausittain.",
    categories: ["palloliitto"],
  },
  {
    href: "/jalkapalloarkisto/stadionit",
    title: "Stadionit",
    eyebrow: "Paikat",
    body: "Jalkapallostadionit, joilla klubi on vieraillut tai joita arkisto käsittelee.",
  },
  {
    href: "/jalkapalloarkisto/tilastot",
    title: "Muut tilastot",
    eyebrow: "Koosteet",
    body: "Unohtumattomat ottelut ja puutteelliset järjestelyt omina koosteinaan.",
    categories: ["muu"],
  },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: arkistoTitle,
    description,
    path: arkistoBasePath,
  });
}

export default async function JalkapalloarkistoPage() {
  const summary = await sanityFetch<TilastoSummary[]>({
    query: arkistoSummaryQuery,
    tags: arkistoTags,
    fallback: [],
  });

  const counts = countByCategory(summary);
  const total = summary.length;
  const updated = latestUpdate(summary);
  const trail = arkistoTrail({ label: arkistoTitle });

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: arkistoTitle,
            description,
            path: arkistoBasePath,
            itemCount: sections.length,
          }),
        ]}
      />

      <ArkistoPage
        title={arkistoTitle}
        lead={lead}
        eyebrow="Arkisto"
        breadcrumbs={trail}
        meta={
          <>
            <Badge tone="brand">{`${sections.length} osiota`}</Badge>
            {total > 0 && <Badge>{tableCountLabel(total)}</Badge>}
            {updated && (
              <Badge tone="muted">{`Päivitetty ${formatDate(updated)}`}</Badge>
            )}
          </>
        }
      >
        <h2 className="sr-only">Arkiston osiot</h2>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const count = (section.categories ?? []).reduce(
              (sum, category) => sum + (counts[category] ?? 0),
              0,
            );
            return (
              <li key={section.href} className="flex">
                <Card href={section.href} className="flex w-full flex-col">
                  <CardEyebrow>{section.eyebrow}</CardEyebrow>
                  <CardTitle className="mt-2">{section.title}</CardTitle>
                  <CardBody className="mt-2">{section.body}</CardBody>
                  {count > 0 && (
                    <p className="mt-3 text-sm text-muted">
                      {tableCountLabel(count)}
                    </p>
                  )}
                  <CardArrow label="Avaa osio" />
                </Card>
              </li>
            );
          })}
        </ul>

        {total === 0 && (
          <div className="mt-12">
            <ArkistoEmpty
              title="Arkisto odottaa sisältöä"
              message="Tilastoja ei ole vielä lisätty Studiossa. Osiot ovat valmiina, ja taulukot ilmestyvät heti kun ne tallennetaan."
            />
          </div>
        )}
      </ArkistoPage>
    </>
  );
}
