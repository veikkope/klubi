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
import { haeOsioSivu, haeOsioSivujenKorttitekstit } from "@/sanity/lib/osiosivu";
import { osioSivu, type OsioSivuSlug } from "@/lib/osiosivut";
import {
  arkistoSummaryQuery,
  arkistoTags,
  type TilastoSummary,
} from "@/sanity/lib/queries/arkisto";

import { ArkistoPage } from "./_tilastot/arkisto-page";
import {
  arkistoBasePath,
  arkistoTrail,
  countByCategory,
  latestUpdate,
  tableCountLabel,
} from "./_tilastot/helpers";
import { ArkistoEmpty } from "./_tilastot/stat-sections";
import { eurocupCategories } from "./eurocupit/competitions";

export const revalidate = 3600;

/** Otsikko, johdanto ja hakukoneteksti: Studion Osioiden sivut (lib/osiosivut.ts). */
const OSIO = "jalkapalloarkisto" as const;

/**
 * Osioiden kortit. Kortin otsikko ja yläotsake ovat valikkonimiä (koodissa);
 * teksti tulee osion sivulta Studiosta (kenttä "Teksti arkiston etusivun
 * kortissa"), oletuksena lib/osiosivut.ts. `body` on vain Litmasella, joka ei
 * ole osion sivu.
 */
interface ArkistoSection {
  href: string;
  title: string;
  eyebrow: string;
  body?: string;
  /** Kategoriat joista kortin taulukkomäärä lasketaan. */
  categories?: string[];
}

const sections: ArkistoSection[] = [
  {
    href: "/jalkapalloarkisto/huuhkajat",
    title: "Huuhkajat",
    eyebrow: "Maajoukkue",
    categories: ["huuhkajat", "karsinta"],
  },
  {
    href: "/jalkapalloarkisto/arvokisat",
    title: "Arvokisat",
    eyebrow: "MM ja EM",
  },
  {
    href: "/jalkapalloarkisto/mestarit",
    title: "Suomen mestarit",
    eyebrow: "Sarjat",
    categories: ["champions"],
  },
  {
    href: "/jalkapalloarkisto/eurocupit",
    title: "Eurocupit",
    eyebrow: "Seurajoukkueet",
    categories: eurocupCategories,
  },
  {
    href: "/jalkapalloarkisto/litmanen",
    title: "Litmanen",
    eyebrow: "Henkilöt",
    body: "Jari Litmasen ura, lehtileikkeet, patsas ja loukkaantumiset.",
  },
  {
    href: "/jalkapalloarkisto/vuoden-pelaajat",
    title: "Vuoden pelaajat",
    eyebrow: "Palkinnot",
    categories: ["vuoden-pelaaja"],
  },
  {
    href: "/jalkapalloarkisto/euroopan-paras",
    title: "Euroopan paras",
    eyebrow: "Palkinnot",
    categories: ["ballon-dor"],
  },
  {
    href: "/jalkapalloarkisto/maailman-parhaat",
    title: "Maailman parhaat",
    eyebrow: "Kokoonpanot",
    categories: ["maailman-parhaat"],
  },
  {
    href: "/jalkapalloarkisto/valmentajat",
    title: "Valmentajat",
    eyebrow: "Maajoukkue",
    categories: ["valmentajat", "valmentajien-palkat"],
  },
  {
    href: "/jalkapalloarkisto/fifa-ranking",
    title: "FIFA-ranking",
    eyebrow: "Tilastot",
    categories: ["fifa-ranking"],
  },
  {
    href: "/jalkapalloarkisto/lupaavat",
    title: "Lupaavat pelaajat",
    eyebrow: "Palkinnot",
    categories: ["lupaavat"],
  },
  {
    href: "/jalkapalloarkisto/saavutukset",
    title: "TOP 10 saavutukset",
    eyebrow: "Historia",
    categories: ["saavutukset"],
  },
  {
    href: "/jalkapalloarkisto/jarkytykset",
    title: "TOP 10 järkytykset",
    eyebrow: "Historia",
    categories: ["jarkytykset"],
  },
  {
    href: "/jalkapalloarkisto/ulkomaiset-mestarit",
    title: "Ulkomaiset mestarit",
    eyebrow: "Sarjat",
    categories: ["ulkomaiset-mestarit"],
  },
  {
    href: "/jalkapalloarkisto/palloliitto",
    title: "Palloliiton puheenjohtajat",
    eyebrow: "Historia",
    categories: ["palloliitto"],
  },
  {
    href: "/jalkapalloarkisto/stadionit",
    title: "Stadionit",
    eyebrow: "Paikat",
  },
  {
    href: "/jalkapalloarkisto/tilastot",
    title: "Muut tilastot",
    eyebrow: "Koosteet",
    categories: ["muu"],
  },
];

/** Kortin polku hrefistä ("/jalkapalloarkisto/mestarit" → "jalkapalloarkisto/mestarit"), jos se on osion sivu. */
function osionPolku(section: ArkistoSection): OsioSivuSlug | null {
  return osioSivu(section.href.replace(/^\//, ""))?.slug ?? null;
}

const KORTTIEN_POLUT = sections.map(osionPolku).filter((polku): polku is OsioSivuSlug => polku !== null);

/** Kortin teksti: osion sivun korttiteksti Studiosta, sitten koodin oletus, sitten koodin teksti (Litmanen). */
function korttiteksti(section: ArkistoSection, tekstit: Map<string, string>): string {
  const polku = osionPolku(section);
  return (polku && tekstit.get(polku)) || (polku && osioSivu(polku)?.oletus.kortti) || section.body || "";
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await haeOsioSivu(OSIO);
  return buildMetadata({
    title: s.seoTitle,
    description: s.description,
    path: arkistoBasePath,
  });
}

export default async function JalkapalloarkistoPage() {
  const [summary, s, tekstit] = await Promise.all([
    sanityFetch<TilastoSummary[]>({
      query: arkistoSummaryQuery,
      tags: arkistoTags,
      fallback: [],
    }),
    haeOsioSivu(OSIO),
    haeOsioSivujenKorttitekstit(KORTTIEN_POLUT),
  ]);

  const counts = countByCategory(summary);
  const total = summary.length;
  const updated = latestUpdate(summary);
  const trail = arkistoTrail({ label: s.title });

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: s.title,
            description: s.description,
            path: arkistoBasePath,
            itemCount: sections.length,
          }),
        ]}
      />

      <ArkistoPage
        title={s.title}
        lead={s.lead}
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
                  <CardBody className="mt-2">{korttiteksti(section, tekstit)}</CardBody>
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
              message="Tilastoja ei ole vielä lisätty. Taulukot julkaistaan tällä sivulla myöhemmin."
            />
          </div>
        )}
      </ArkistoPage>
    </>
  );
}
