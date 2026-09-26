import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import {
  Card,
  CardArrow,
  CardBody,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/card";
import { breadcrumbSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  arkistoTags,
  tilastotByCategoryQuery,
  type TilastoDoc,
} from "@/sanity/lib/queries/arkisto";

import { ArkistoPage } from "../_tilastot/arkisto-page";
import {
  arkistoTrail,
  datasetSchemas,
  huuhkajatPath,
  karsintaPath,
} from "../_tilastot/helpers";
import { ArkistoEmpty, StatSections } from "../_tilastot/stat-sections";

export const revalidate = 3600;

const path = huuhkajatPath;
const title = "Huuhkajat";
const description =
  "Suomen miesten maajoukkueen otteluhistoria ja pelaajatilastot: maaottelut, maalintekijät ja edustusmäärät taulukoina.";
const lead =
  "Huuhkajat on Suomen miesten A-maajoukkueen nimi. Arkisto kokoaa " +
  "maajoukkueen otteluhistorian ja pelaajatilastot: maaottelut tuloksineen, " +
  "maalintekijät ja eniten edustuksia keränneet pelaajat.";

/** Sisarsivut, joilla Huuhkajien tilastot jatkuvat. */
const relatedLinks = [
  {
    href: "/jalkapalloarkisto/pelaajat",
    title: "Pelaajat",
    eyebrow: "Henkilöt",
    body: "Litmanen ja Pikkuhuuhkajat omina koosteinaan sekä maailman parhaat pelaajat.",
  },
  {
    href: "/jalkapalloarkisto/valmentajat",
    title: "Valmentajat",
    eyebrow: "Maajoukkue",
    body: "Huuhkajien päävalmentajat kausittain sekä tiedot valmentajien palkoista.",
  },
  {
    href: "/jalkapalloarkisto/arvokisat",
    title: "Arvokisat",
    eyebrow: "MM ja EM",
    body: "MM- ja EM-kisojen tulokset sekä Kansojen liigan kaudet kisa kerrallaan.",
  },
  {
    href: "/jalkapalloarkisto/fifa-ranking",
    title: "FIFA-ranking",
    eyebrow: "Tilastot",
    body: "Suomen sijoitus FIFA:n maailmanlistalla ja listan kärkimaat.",
  },
];

export function generateMetadata(): Metadata {
  return buildMetadata({ title, description, path });
}

export default async function HuuhkajatPage() {
  // Karsintasarjat ovat oma kategoriansa ja omat sivunsa — täällä ne ovat
  // vain nostoina, jotta maajoukkueen kokonaiskuva pysyy yhdellä sivulla.
  const [ottelut, karsinnat] = await Promise.all([
    sanityFetch<TilastoDoc[]>({
      query: tilastotByCategoryQuery,
      params: { category: "huuhkajat" },
      tags: arkistoTags,
      fallback: [],
    }),
    sanityFetch<TilastoDoc[]>({
      query: tilastotByCategoryQuery,
      params: { category: "karsinta" },
      tags: arkistoTags,
      fallback: [],
    }),
  ]);

  const trail = arkistoTrail({ label: title });
  const karsintalinkit = karsinnat.filter((tilasto) => Boolean(tilasto.slug));

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          ...datasetSchemas({ tilastot: ottelut, path, title, description }),
          ...(karsintalinkit.length > 0
            ? datasetSchemas({
                tilastot: karsintalinkit,
                path,
                title,
                description,
                itemPath: (tilasto) => karsintaPath(tilasto.slug ?? ""),
              })
            : []),
        ]}
      />

      <ArkistoPage title={title} lead={lead} breadcrumbs={trail}>
        <section aria-labelledby="ottelut-otsikko">
          <h2
            id="ottelut-otsikko"
            className="font-serif text-2xl leading-tight text-foreground sm:text-3xl"
          >
            Otteluhistoria ja pelaajatilastot
          </h2>
          <div className="mt-6">
            <StatSections
              tilastot={ottelut}
              headingLevel="h3"
              emptyTitle="Ei vielä Huuhkajien tilastoja"
            />
          </div>
        </section>

        <section aria-labelledby="karsinnat-otsikko" className="mt-16">
          <h2
            id="karsinnat-otsikko"
            className="font-serif text-2xl leading-tight text-foreground sm:text-3xl"
          >
            Karsintasarjat
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted">
            Jokainen karsintasarja on oma taulukkonsa: ottelut, tulokset ja
            sarjataulukot. Avaa sarja nähdäksesi kaikki ottelut.
          </p>

          <div className="mt-6">
            {karsintalinkit.length === 0 ? (
              <ArkistoEmpty
                title="Ei vielä karsintasarjoja"
                message="Karsintataulukoita ei ole vielä lisätty Studiossa."
              />
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {karsintalinkit.map((tilasto) => (
                  <li key={tilasto._id} className="flex">
                    <Card
                      href={karsintaPath(tilasto.slug ?? "")}
                      className="flex w-full flex-col"
                    >
                      <CardEyebrow>Karsinta</CardEyebrow>
                      <CardTitle className="mt-2">{tilasto.title}</CardTitle>
                      {tilasto.tiivistelma && (
                        <CardBody className="mt-2">
                          {tilasto.tiivistelma}
                        </CardBody>
                      )}
                      <CardArrow label="Avaa taulukko" />
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section aria-labelledby="jatka-otsikko" className="mt-16">
          <h2
            id="jatka-otsikko"
            className="font-serif text-2xl leading-tight text-foreground sm:text-3xl"
          >
            Jatka arkistossa
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {relatedLinks.map((link) => (
              <li key={link.href} className="flex">
                <Card href={link.href} className="flex w-full flex-col">
                  <CardEyebrow>{link.eyebrow}</CardEyebrow>
                  <CardTitle className="mt-2">{link.title}</CardTitle>
                  <CardBody className="mt-2">{link.body}</CardBody>
                  <CardArrow label="Avaa osio" />
                </Card>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-muted">
            Koko arkiston sisällysluettelo löytyy{" "}
            <Link
              href="/jalkapalloarkisto"
              className="text-accent underline-offset-4 hover:underline"
            >
              jalkapalloarkiston etusivulta
            </Link>
            .
          </p>
        </section>
      </ArkistoPage>
    </>
  );
}
