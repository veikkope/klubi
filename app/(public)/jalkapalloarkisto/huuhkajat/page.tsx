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
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  arkistoTags,
  huuhkajatHubQuery,
  type HuuhkajatHub,
} from "@/sanity/lib/queries/arkisto";

import { ArkistoPage } from "../_tilastot/arkisto-page";
import {
  arkistoTrail,
  huuhkajatPath,
  karsintaPath,
  karsinnatAnchor,
  tableCountLabel,
} from "../_tilastot/helpers";
import { ArkistoEmpty } from "../_tilastot/stat-sections";
import { groupByOsio } from "./osiot";
import { VanhaAnkkuriOhjaus } from "./vanha-ankkuri";

export const revalidate = 3600;

const path = huuhkajatPath;
const title = "Huuhkajat";
const description =
  "Suomen miesten maajoukkueen otteluhistoria ja pelaajatilastot: maaottelut, maalintekijät ja edustusmäärät taulukoina.";
const lead =
  "Huuhkajat on Suomen miesten A-maajoukkueen nimi. Arkisto kokoaa " +
  "maajoukkueen tilastot aiheittain: pelaajatilastot, klubin oma " +
  "Huuhkaja-arvostelu, Kansojen liiga ja karsintasarjat.";

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

const headingClass =
  "font-display text-2xl leading-tight text-foreground sm:text-3xl";

export function generateMetadata(): Metadata {
  return buildMetadata({ title, description, path });
}

export default async function HuuhkajatPage() {
  const { taulukot, karsinnat } = await sanityFetch<HuuhkajatHub>({
    query: huuhkajatHubQuery,
    tags: arkistoTags,
    fallback: { taulukot: [], karsinnat: [] },
  });

  const osiot = groupByOsio(taulukot);
  const aiheet = osiot.filter((osio) => osio.hubKohta === "aiheet");
  // Kansojen liiga listataan karsintasarjojen alla, ei omana korttinaan.
  const karsintaOsiot = osiot.filter((osio) => osio.hubKohta === "karsinnat");
  const karsintaKohteita =
    karsinnat.length + karsintaOsiot.reduce((sum, osio) => sum + osio.taulukot.length, 0);
  const trail = arkistoTrail({ label: title });

  // Vanha ankkuri (#slug) → taulukon osiosivu.
  const kohteet = Object.fromEntries(
    osiot.flatMap((osio) =>
      osio.taulukot.flatMap((taulukko) =>
        taulukko.slug ? [[taulukko.slug, osio.href]] : [],
      ),
    ),
  );

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title,
            description,
            path,
            itemCount: taulukot.length + karsinnat.length,
          }),
        ]}
      />
      <VanhaAnkkuriOhjaus kohteet={kohteet} />

      <ArkistoPage title={title} lead={lead} breadcrumbs={trail}>
        <section aria-labelledby="aiheet-otsikko">
          <h2 id="aiheet-otsikko" className={headingClass}>
            Tilastot aiheittain
          </h2>

          {aiheet.length === 0 && karsintaKohteita === 0 ? (
            <div className="mt-6">
              <ArkistoEmpty title="Ei vielä Huuhkajien tilastoja" />
            </div>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {aiheet.map((osio) => (
                <li key={osio.value} className="flex">
                  <Card href={osio.href} className="flex w-full flex-col">
                    <CardEyebrow>{tableCountLabel(osio.taulukot.length)}</CardEyebrow>
                    <CardTitle className="mt-2">{osio.title}</CardTitle>
                    <CardBody className="mt-2">{osio.lead}</CardBody>
                    <CardArrow label="Avaa osio" />
                  </Card>
                </li>
              ))}
              {karsintaKohteita > 0 && (
                <li className="flex">
                  <Card href={`#${karsinnatAnchor}`} className="flex w-full flex-col">
                    <CardEyebrow>
                      {karsintaKohteita} {karsintaKohteita === 1 ? "sarja" : "sarjaa"}
                    </CardEyebrow>
                    <CardTitle className="mt-2">Karsintasarjat</CardTitle>
                    <CardBody className="mt-2">
                      MM- ja EM-karsintojen ottelut, tulokset ja sarjataulukot
                      sekä Kansojen liigan lohkot kausittain.
                    </CardBody>
                    <CardArrow label="Näytä sarjat" />
                  </Card>
                </li>
              )}
            </ul>
          )}
        </section>

        {karsintaKohteita > 0 && (
          <section
            id={karsinnatAnchor}
            aria-labelledby="karsinnat-otsikko"
            className="mt-16 scroll-mt-24"
          >
            <h2 id="karsinnat-otsikko" className={headingClass}>
              Karsintasarjat
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-muted">
              Jokainen karsintasarja on oma sivunsa: ottelut, tulokset ja
              sarjataulukot. Uusin sarja ensin.
            </p>

            {karsinnat.length > 0 && (
              <SarjaLista
                otsikko="MM- ja EM-karsinnat"
                linkit={karsinnat.map((sarja) => ({
                  id: sarja._id,
                  title: sarja.title,
                  href: karsintaPath(sarja.slug ?? ""),
                }))}
              />
            )}

            {karsintaOsiot.map((osio) => (
              <SarjaLista
                key={osio.value}
                otsikko={osio.title}
                linkit={osio.taulukot.map((taulukko) => ({
                  id: taulukko._id,
                  title: taulukko.title,
                  href: taulukko.slug ? `${osio.href}#${taulukko.slug}` : osio.href,
                }))}
              />
            ))}
          </section>
        )}

        <section aria-labelledby="jatka-otsikko" className="mt-16">
          <h2 id="jatka-otsikko" className={headingClass}>
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
              className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
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

/** Karsintasarjojen alaryhmä: otsikko ja kaksipalstainen linkkilista. */
function SarjaLista({
  otsikko,
  linkit,
}: {
  otsikko: string;
  linkit: { id: string; title: string; href: string }[];
}) {
  return (
    <div className="mt-8">
      <h3 className="font-display text-xl leading-tight text-foreground sm:text-2xl">
        {otsikko}
      </h3>
      <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
        {linkit.map((linkki) => (
          <li key={linkki.id} className="border-b border-border">
            <Link
              href={linkki.href}
              className="group flex min-h-11 items-center justify-between gap-4 py-3 text-foreground no-underline transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span>{linkki.title}</span>
              <span
                aria-hidden
                className="text-accent transition group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
