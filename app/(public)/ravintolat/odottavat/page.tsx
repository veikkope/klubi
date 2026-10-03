import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { formatRating } from "@/components/restaurant-card";
import { Nuoli } from "@/components/ui/nuoli";
import { formatDate } from "@/lib/format";
import { rootCrumb } from "@/lib/nav-sections";
import { voimassaOlevat, VAHIMMAISARVIOIJAT } from "@/lib/ravintola-arvosana";
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

export async function generateMetadata(): Promise<Metadata> {
  // Kahden arvioijan sääntö: julkaisemattomat paikat eivät kuulu hakukoneisiin.
  return buildMetadata({ title: TITLE, description: LEAD, path: PATH, noIndex: true });
}

const luku = (x: number | null | undefined) => (typeof x === "number" ? formatRating(x) : "–");

/**
 * Toista klubilaista arvioijaa odottavat ravintolat (docs/21). Klubilaiselle
 * vinkkilista: paikka, kaupunki, kuka on arvioinut ja millä pisteillä, ja
 * suora linkki arvostelulomakkeelle ravintola valmiiksi valittuna.
 */
export default async function OdottavatPage() {
  const ravintolat = await sanityFetch<OdottavaRavintola[]>({
    query: odottavatRavintolatQuery,
    tags: ["ravintola"],
    fallback: [],
  });

  return (
    <Container size="default" className="py-12 sm:py-16">
      <PageHeader title={TITLE} lead={LEAD} eyebrow="Ravintolat" topic="food" breadcrumbs={trail} />

      {ravintolat.length === 0 ? (
        <p className="mt-10 rounded-sm bg-surface p-6 text-muted">
          Kaikilla ravintoloilla on tällä hetkellä vähintään kaksi arvioijaa.
        </p>
      ) : (
        <>
          <p className="mt-10 text-sm text-muted-soft">{ravintolat.length} paikkaa, tuoreimmin arvioidut ensin.</p>
          <ul className="mt-4 flex flex-col gap-4">
            {ravintolat.map((r) => {
              const arviot = voimassaOlevat(r.arviot);
              const paikka = [r.city?.name, r.city?.country && r.city.country !== "Suomi" ? r.city.country : null]
                .filter(Boolean)
                .join(", ");
              return (
                <li
                  key={r._id}
                  className="flex flex-col gap-4 rounded-sm border-t-[3px] border-t-brass bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6"
                >
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <h2 className="font-display text-xl leading-snug text-heading sm:text-[1.375rem]">{r.name}</h2>
                    {paikka && <p className="text-sm text-muted-soft">{paikka}</p>}
                    {arviot.length > 0 ? (
                      arviot.map((a) => (
                        <p key={a.arvioija} className="text-[15px] text-foreground">
                          <span className="font-semibold">{a.nimi ?? "Klubilainen"}</span>
                          {a.pvm && <span className="text-muted-soft"> · {formatDate(a.pvm)}</span>}
                          <span className="mt-0.5 block text-sm text-muted">
                            Ruoka {luku(a.ratingFood)} · Hinta {luku(a.ratingPrice)} · Viihtyvyys{" "}
                            {luku(a.ratingAtmosphere)} · <span className="font-semibold">Keskiarvo {luku(a.kokonais)}</span>
                          </span>
                        </p>
                      ))
                    ) : (
                      <p className="text-[15px] text-muted">Ei vielä klubilaisen arviota.</p>
                    )}
                  </div>
                  <Link
                    href={`/ravintolat/arvostele?ravintola=${encodeURIComponent(r.slug)}`}
                    className="group/linkki inline-flex min-h-11 shrink-0 items-center justify-center gap-1 self-start rounded-sm bg-primary px-5 text-sm font-medium text-on-primary no-underline transition hover:bg-primary-hover hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:self-center"
                  >
                    Arvostele<span className="sr-only"> {r.name}</span>&nbsp;<Nuoli />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Container>
  );
}
