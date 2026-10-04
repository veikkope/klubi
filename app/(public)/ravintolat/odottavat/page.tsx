import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { OdottavaRavintolaKortti } from "@/components/odottava-ravintola";
import { normalizeSearch, siistiHaku } from "@/lib/haku";
import { rootCrumb } from "@/lib/nav-sections";
import { VAHIMMAISARVIOIJAT } from "@/lib/ravintola-arvosana";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { odottavatRavintolatQuery, type OdottavaRavintola } from "@/sanity/lib/queries/ravintolat";
import { OdottavatHaku, type OdottavaKaupunki } from "./odottavat-haku";

export const revalidate = 3600;

const TITLE = "Odottavat toista arvioijaa";
const PATH = "/ravintolat/odottavat";
const LEAD =
  `Ravintola julkaistaan sivuilla, kun vähintään ${VAHIMMAISARVIOIJAT} klubilaista on arvioinut sen. ` +
  "Näissä paikoissa on käynyt yksi klubilainen. Kun käyt itse, lähetä arvostelu: " +
  "ravintola tulee sivuille, kun arvostelusi on hyväksytty.";

const trail = [
  rootCrumb,
  { label: "Ravintola-arviot", href: "/ravintolat" },
  { label: "Arvostele ravintola", href: "/ravintolat/arvostele" },
  { label: TITLE },
];

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata(): Promise<Metadata> {
  // Kahden arvioijan sääntö: julkaisemattomat paikat eivät kuulu hakukoneisiin.
  return buildMetadata({ title: TITLE, description: LEAD, path: PATH, noIndex: true });
}

type Kaupunki = {
  avain: string;
  nimi: string;
  maa: string | null;
  slug: string | null;
  julkisia: number;
  ravintolat: OdottavaRavintola[];
};

const fi = (a: string, b: string) => a.localeCompare(b, "fi");

/** Kaupungeittain: Suomi ensin, sitten muut maat; kaupungit aakkosjärjestyksessä. */
function kaupungeittain(ravintolat: OdottavaRavintola[]): Kaupunki[] {
  const ryhmat = new Map<string, Kaupunki>();
  for (const r of ravintolat) {
    const avain = r.city?.slug ?? r.city?.name ?? "muu";
    const ryhma = ryhmat.get(avain) ?? {
      avain,
      nimi: r.city?.name ?? "Muu",
      maa: r.city?.country ?? null,
      slug: r.city?.slug ?? null,
      julkisia: r.julkisiaKaupungissa ?? 0,
      ravintolat: [],
    };
    ryhma.ravintolat.push(r);
    ryhmat.set(avain, ryhma);
  }
  const suomiEnsin = (k: Kaupunki) => (k.maa === "Suomi" || !k.maa ? "" : k.maa);
  return [...ryhmat.values()].sort((a, b) => fi(suomiEnsin(a), suomiEnsin(b)) || fi(a.nimi, b.nimi));
}

/**
 * Toista klubilaista arvioijaa odottavat ravintolat (docs/21) kaupungeittain.
 * Klubilainen hakee nimellä tai kaupungilla tai napauttaa kaupunkia ja näkee
 * sen odottavat paikat sekä linkin kaupungin jo arvioituihin ravintoloihin.
 * Haku ja rajaus: odottavat-haku.tsx (kortit piirretään täällä palvelimella).
 */
export default async function OdottavatPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const valittu = typeof sp.kaupunki === "string" ? sp.kaupunki : null;
  const haku = siistiHaku(typeof sp.q === "string" ? sp.q : "");
  const kaikki = kaupungeittain(
    await sanityFetch<OdottavaRavintola[]>({
      query: odottavatRavintolatQuery,
      tags: ["ravintola", "kaupunki"],
      fallback: [],
    }),
  );

  const kaupungit: OdottavaKaupunki[] = kaikki.map((k) => ({
    avain: k.avain,
    nimi: k.nimi,
    maa: k.maa,
    slug: k.slug,
    julkisia: k.julkisia,
    ravintolat: k.ravintolat.map((r) => ({
      id: r._id,
      // Haetaan nimestä, kaupungista, maasta ja arvioijien nimistä.
      haku: normalizeSearch(
        [r.name, r.city?.name, r.city?.country, ...r.arviot.map((a) => a.nimi)].filter(Boolean).join(" "),
      ),
      kortti: <OdottavaRavintolaKortti ravintola={r} naytaPaikka={false} />,
    })),
  }));

  return (
    <Container size="default" className="py-12 sm:py-16">
      <PageHeader title={TITLE} lead={LEAD} eyebrow="Ravintolat" topic="food" breadcrumbs={trail} />

      {kaikki.length === 0 ? (
        <p className="mt-10 rounded-sm bg-surface p-6 text-muted">
          Kaikilla ravintoloilla on tällä hetkellä vähintään kaksi arvioijaa.
        </p>
      ) : (
        <OdottavatHaku polku={PATH} kaupungit={kaupungit} alkuKaupunki={valittu} alkuHaku={haku} />
      )}
    </Container>
  );
}
