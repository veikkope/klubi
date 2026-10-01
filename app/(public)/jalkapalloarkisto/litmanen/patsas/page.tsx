import type { Metadata } from "next";
import Link from "next/link";

import { AlbumGrid } from "@/components/gallery/album-grid";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { PortableText } from "@/components/portable-text";
import { JsonLd } from "@/components/seo/json-ld";
import { Nuoli } from "@/components/ui/nuoli";
import { formatDate } from "@/lib/format";
import { arkistoNav } from "@/lib/nav-sections";
import { LITMANEN_PATSAS_PATH } from "@/lib/path";
import { breadcrumbSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { tunnisteHref } from "@/lib/tunnisteet";
import type { PaivattyKuva } from "@/sanity/lib/queries/arkisto-laajennus";

import { ArkistoEmpty } from "../../_tilastot/stat-sections";
import { LeikeLista } from "../../_pelaaja/leike-lista";
import { haeLehtileikkeet, haeLitmanen, haeTunnisteenUutiset, litmanenSubNav, litmanenTrail } from "../hae";

export const revalidate = 3600;

const TITLE = "Litmasen patsas";

/** Kuvat kuvauspäivän mukaan, tuorein ensin; päiväämättömät loppuun. */
function jarjestaKuvat(kuvat: PaivattyKuva[]): PaivattyKuva[] {
  return [...kuvat].sort((a, b) => (b.paivamaara ?? "").localeCompare(a.paivamaara ?? ""));
}

async function hae() {
  const pelaaja = await haeLitmanen();
  const patsas = pelaaja?.patsas ?? null;
  const tiedot = [patsas?.paljastettu && `Paljastettu ${formatDate(patsas.paljastettu)}`, patsas?.sijainti]
    .filter(Boolean)
    .join(" · ");
  return { pelaaja, patsas, tiedot };
}

export async function generateMetadata(): Promise<Metadata> {
  const { tiedot } = await hae();
  return buildMetadata({
    title: TITLE,
    description: `Jari Litmasen patsas${tiedot ? ` (${tiedot})` : ""}: patsaan vaiheet kuvina ja uutisina.`,
    path: LITMANEN_PATSAS_PATH,
  });
}

const osioOtsikko = "font-display text-2xl text-foreground sm:text-3xl";

export default async function LitmasenPatsasPage() {
  const { pelaaja, patsas, tiedot } = await hae();
  const [leikkeet, uutiset] = await Promise.all([
    pelaaja ? haeLehtileikkeet(pelaaja._id, "patsas") : Promise.resolve([]),
    haeTunnisteenUutiset(patsas?.uutistunniste, 0),
  ]);
  const kuvat = jarjestaKuvat((patsas?.kuvat ?? []).filter((k) => k?.asset));
  const trail = litmanenTrail(pelaaja?.name, "Patsas");
  const uutistenHref = patsas?.uutistunniste ? tunnisteHref(patsas.uutistunniste) : null;

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd schema={[breadcrumbSchema(trail)]} />
      <PageHeader eyebrow="Litmanen" title={TITLE} lead={tiedot || null} breadcrumbs={trail} />
      <SectionNav items={arkistoNav} label="Jalkapalloarkiston osiot" className="mt-8" />
      <SectionNav items={litmanenSubNav.items} label={litmanenSubNav.label} className="mt-3" />

      {patsas?.esittely && patsas.esittely.length > 0 && (
        <div className="mt-10 max-w-prose">
          <PortableText value={patsas.esittely} ylinOtsikko={2} />
        </div>
      )}

      {kuvat.length > 0 ? (
        <section aria-labelledby="patsas-kuvat" className="mt-12">
          <h2 id="patsas-kuvat" className={osioOtsikko}>
            Patsaan vuodet kuvina
          </h2>
          <p className="mt-2 text-muted">{kuvat.length} kuvaa, uusin ensin. Napauta kuvaa nähdäksesi sen isompana.</p>
          <div className="mt-6">
            <AlbumGrid
              images={kuvat.map((k) => ({ _key: k._key, asset: k.asset, alt: k.alt, caption: k.caption ?? k.alt, lqip: k.lqip }))}
              albumTitle={TITLE}
              merkinnat={kuvat.map((k) => (k.paivamaara ? formatDate(k.paivamaara) : null))}
              kokonaisena
            />
          </div>
        </section>
      ) : (
        <div className="mt-12">
          <ArkistoEmpty title="Ei vielä patsaskuvia" message="Kuvat lisätään Studiossa Jari Litmasen sivun Patsas-välilehdellä." />
        </div>
      )}

      {leikkeet.length > 0 && (
        <section aria-labelledby="patsas-uutisissa" className="mt-16">
          <h2 id="patsas-uutisissa" className={osioOtsikko}>
            Patsas lehtileikkeissä
          </h2>
          <div className="mt-8">
            <LeikeLista leikkeet={leikkeet} vuosiNavi={false} idEtuliite="patsas" otsikkotaso={3} />
          </div>
        </section>
      )}

      {uutistenHref && uutiset.total > 0 && (
        <p className="mt-12">
          <Link href={uutistenHref} className="group/linkki inline-flex min-h-11 items-center gap-1 font-medium text-accent hover:text-accent-hover">
            Patsas klubin uutisissa ({uutiset.total}) <Nuoli />
          </Link>
        </p>
      )}
    </Container>
  );
}
