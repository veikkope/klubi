import type { Metadata } from "next";
import Link from "next/link";

import { NewsCard } from "@/components/news-card";
import { Card, CardArrow, CardBody, CardEyebrow, CardTitle } from "@/components/ui/card";
import { Nuoli } from "@/components/ui/nuoli";
import { formatDate } from "@/lib/format";
import { vuosivali } from "@/lib/lehtileikkeet";
import { loukkaantumisYhteenveto } from "@/lib/loukkaantumiset";
import { rootCrumb } from "@/lib/nav-sections";
import {
  documentHref,
  LITMANEN_LEHTILEIKKEET_PATH,
  LITMANEN_LOUKKAANTUMISET_PATH,
  LITMANEN_PATH,
  LITMANEN_PATSAS_PATH,
  LITMANEN_SLUG,
} from "@/lib/path";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { tunnisteHref } from "@/lib/tunnisteet";
import { ohjaaTaiEiLoydy } from "@/sanity/lib/ohjaus";

import { PelaajaProfiili } from "../_pelaaja/pelaaja-profiili";
import {
  haeLehtileikeYhteenveto,
  haeLitmanen,
  haeTunnisteenUutiset,
  litmanenSubNav,
} from "./hae";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const pelaaja = await haeLitmanen();
  return buildMetadata({
    title: pelaaja?.seoTitle || pelaaja?.name || "Jari Litmanen",
    description: resolveDescription(pelaaja?.seoDescription, pelaaja?.tiivistelma),
    path: LITMANEN_PATH,
    image: pelaaja?.kuvat?.[0],
    modifiedAt: pelaaja?._updatedAt,
  });
}

const osioOtsikko = "font-display text-2xl text-foreground sm:text-3xl";

export default async function LitmanenPage() {
  const pelaaja = await haeLitmanen();
  if (!pelaaja) return ohjaaTaiEiLoydy(LITMANEN_PATH);

  const [yhteenveto, uutiset] = await Promise.all([
    haeLehtileikeYhteenveto(pelaaja._id),
    // Otsikossa "Litmanen", "Litmasen", "Litmaselle" …: patsaalla pidetyt tapahtumat eivät nouse.
    haeTunnisteenUutiset(pelaaja.uutistunniste, 3, "litma*"),
  ]);

  const taulukko = (pelaaja.tilastot ?? []).find(Boolean);
  const vammat = taulukko ? loukkaantumisYhteenveto(taulukko.columns ?? [], taulukko.rows ?? []) : null;
  const patsas = pelaaja.patsas;
  const patsasKuvia = (patsas?.kuvat ?? []).filter(Boolean).length;
  const leikkeet = yhteenveto?.lehtileikkeet;

  const osiot = [
    leikkeet && leikkeet.maara > 0 && {
      href: LITMANEN_LEHTILEIKKEET_PATH,
      eyebrow: [`${leikkeet.maara} juttua`, vuosivali(leikkeet.ensimmainen, leikkeet.viimeisin)].filter(Boolean).join(" · "),
      title: "Lehtileikkeet",
      body: "Lehtijutut Litmasen urasta, valmentamisesta ja elämästä jalkapallon jälkeen vuosittain.",
    },
    (patsasKuvia > 0 || patsas?.paljastettu) && {
      href: LITMANEN_PATSAS_PATH,
      eyebrow: [patsas?.paljastettu && `Paljastettu ${formatDate(patsas.paljastettu)}`, patsasKuvia > 0 && `${patsasKuvia} kuvaa`]
        .filter(Boolean)
        .join(" · "),
      title: "Patsas",
      body: [patsas?.sijainti, "Patsaan vaiheet kuvina ja uutisina."].filter(Boolean).join(". "),
    },
    vammat && {
      href: LITMANEN_LOUKKAANTUMISET_PATH,
      eyebrow: `${vammat.maara} kirjattua · ${vammat.ensimmainenVuosi}–${vammat.viimeisinVuosi}`,
      title: "Litmasen loukkaantumiset",
      body: "Ammattilaisuran vammat vuosittain ja kehonosittain sekä terveyttä käsittelevät jutut.",
    },
  ].filter((o): o is { href: string; eyebrow: string; title: string; body: string } => Boolean(o));

  const uusimmat = yhteenveto?.uusimmat ?? [];
  const uutistenHref = pelaaja.uutistunniste ? tunnisteHref(pelaaja.uutistunniste) : null;

  return (
    <PelaajaProfiili
      pelaaja={pelaaja}
      path={LITMANEN_PATH}
      trail={[rootCrumb, { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" }, { label: pelaaja.name }]}
      subNav={litmanenSubNav}
      naytaTilastot={false}
    >
      {osiot.length > 0 && (
        <section aria-labelledby="litmanen-osiot" className="mt-16">
          <h2 id="litmanen-osiot" className={osioOtsikko}>
            Lisää Litmasesta
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {osiot.map((osio) => (
              <li key={osio.href}>
                <Card href={osio.href} className="flex h-full flex-col">
                  <CardEyebrow>{osio.eyebrow}</CardEyebrow>
                  <CardTitle className="mt-1">{osio.title}</CardTitle>
                  <CardBody className="mt-2 text-sm">{osio.body}</CardBody>
                  <div className="mt-auto pt-4">
                    <CardArrow label="Avaa" />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {uusimmat.length > 0 && (
        <section aria-labelledby="litmanen-uusimmat" className="mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="litmanen-uusimmat" className={osioOtsikko}>
              Uusimmat lehtileikkeet
            </h2>
            <Link href={LITMANEN_LEHTILEIKKEET_PATH} className="group/linkki inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover">
              Kaikki lehtileikkeet <Nuoli />
            </Link>
          </div>
          <ol className="mt-4 divide-y divide-border border-y border-border">
            {uusimmat.map((leike) => {
              const href =
                documentHref({ _id: leike._id, _type: "lehtileike", osio: leike.osio, pelaajaSlug: LITMANEN_SLUG }) ??
                LITMANEN_LEHTILEIKKEET_PATH;
              return (
                <li key={leike._id} className="py-5">
                  <p className="text-sm text-muted">
                    <time dateTime={leike.julkaistu}>{formatDate(leike.julkaistu)}</time>
                    {leike.lahde && <> · {leike.lahde}</>}
                  </p>
                  <h3 className="mt-1 font-display text-xl leading-snug">
                    <Link href={href} className="text-heading no-underline hover:text-accent hover:underline">
                      {leike.otsikko}
                    </Link>
                  </h3>
                  {leike.ote && <p className="mt-2 line-clamp-2 max-w-prose text-muted">{leike.ote}</p>}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {uutiset.items.length > 0 && (
        <section aria-labelledby="litmanen-uutiset" className="mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="litmanen-uutiset" className={osioOtsikko}>
              Litmanen klubin uutisissa
            </h2>
            {uutistenHref && (
              <Link href={uutistenHref} className="group/linkki inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover">
                Kaikki {uutiset.total} uutista <Nuoli />
              </Link>
            )}
          </div>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {uutiset.items.map((uutinen) => (
              <li key={uutinen._id} className="flex">
                <NewsCard news={uutinen} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </PelaajaProfiili>
  );
}
