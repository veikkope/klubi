import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { OdottavaRavintolaKortti } from "@/components/odottava-ravintola";
import { Nuoli } from "@/components/ui/nuoli";
import { rootCrumb } from "@/lib/nav-sections";
import { VAHIMMAISARVIOIJAT } from "@/lib/ravintola-arvosana";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { odottavatRavintolatQuery, type OdottavaRavintola } from "@/sanity/lib/queries/ravintolat";

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

const kaupunginNimi = (k: Kaupunki) => (k.maa && k.maa !== "Suomi" ? `${k.nimi}, ${k.maa}` : k.nimi);

/**
 * Toista klubilaista arvioijaa odottavat ravintolat (docs/21) kaupungeittain.
 * Klubilainen valitsee kaupungin, jossa on, ja näkee sen odottavat paikat
 * sekä linkin kaupungin jo arvioituihin ravintoloihin hakemistossa.
 */
export default async function OdottavatPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const valittu = typeof sp.kaupunki === "string" ? sp.kaupunki : null;
  const kaikki = kaupungeittain(
    await sanityFetch<OdottavaRavintola[]>({
      query: odottavatRavintolatQuery,
      tags: ["ravintola", "kaupunki"],
      fallback: [],
    }),
  );
  const naytettavat = valittu ? kaikki.filter((k) => k.avain === valittu) : kaikki;
  const yhteensa = kaikki.reduce((n, k) => n + k.ravintolat.length, 0);

  return (
    <Container size="default" className="py-12 sm:py-16">
      <PageHeader title={TITLE} lead={LEAD} eyebrow="Ravintolat" topic="food" breadcrumbs={trail} />

      {kaikki.length === 0 ? (
        <p className="mt-10 rounded-sm bg-surface p-6 text-muted">
          Kaikilla ravintoloilla on tällä hetkellä vähintään kaksi arvioijaa.
        </p>
      ) : (
        <>
          {/* Toimii ilman JavaScriptiä: GET-lomake ?kaupunki=… */}
          <form action={PATH} method="get" className="mt-10 flex flex-wrap items-end gap-3">
            <div className="flex min-w-[240px] flex-1 flex-col gap-1.5 sm:max-w-sm">
              <label htmlFor="odottavat-kaupunki" className="text-sm font-semibold text-foreground">
                Kaupunki
              </label>
              <select
                id="odottavat-kaupunki"
                name="kaupunki"
                defaultValue={valittu ?? ""}
                className="min-h-11 rounded-sm border border-border-input bg-surface px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Kaikki kaupungit ({yhteensa})</option>
                {kaikki.map((k) => (
                  <option key={k.avain} value={k.avain}>
                    {kaupunginNimi(k)} ({k.ravintolat.length})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="min-h-11 rounded-sm bg-primary px-5 text-sm font-medium text-on-primary transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Näytä
            </button>
            {valittu && (
              <Link href={PATH} className="min-h-11 content-center text-sm font-semibold text-accent underline underline-offset-4">
                Näytä kaikki
              </Link>
            )}
          </form>

          {naytettavat.length === 0 && (
            <p className="mt-8 rounded-sm bg-surface p-6 text-muted">
              Valitussa kaupungissa ei ole toista arvioijaa odottavia ravintoloita.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-10">
            {naytettavat.map((k) => (
              <section key={k.avain} aria-labelledby={`kaupunki-${k.avain}`} className="flex flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border pb-2">
                  <h2 id={`kaupunki-${k.avain}`} className="text-2xl">
                    {kaupunginNimi(k)} <span className="text-lg font-normal text-muted-soft">({k.ravintolat.length})</span>
                  </h2>
                  {k.slug && k.julkisia > 0 && (
                    <Link
                      href={`/ravintolat?kaupunki=${encodeURIComponent(k.slug)}`}
                      className="group/linkki text-[15px] font-semibold text-accent underline decoration-1 underline-offset-[4px] hover:decoration-2"
                    >
                      Klubin arvioimat ravintolat ({k.julkisia})&nbsp;<Nuoli />
                    </Link>
                  )}
                </div>
                <ul className="flex flex-col gap-4">
                  {k.ravintolat.map((r) => (
                    <li key={r._id}>
                      <OdottavaRavintolaKortti ravintola={r} naytaPaikka={false} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
