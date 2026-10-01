import { PortableText } from "@/components/portable-text";
import { FramedImage } from "@/components/framed-image";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav, type SectionNavItem } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { arkistoNav } from "@/lib/nav-sections";
import { breadcrumbSchema, personSchema } from "@/lib/schema-org";
import { resolveDescription } from "@/lib/seo";
import { urlForImage } from "@/sanity/lib/image";
import {
  pelipaikkaLabel,
  type PelaajaCard,
  type PelaajaFull,
  type PelaajaSeura,
} from "@/sanity/lib/queries/arkisto-laajennus";

import { StatSections } from "../_tilastot/stat-sections";
import { Avainluvut, type Avainluku } from "./avainluvut";
import { Saavutukset } from "./saavutukset";
import { UranAikajana } from "./uran-aikajana";

type Crumb = { label: string; href?: string };

/** Avainluvut perustietokentistä: vain ne, joille on arvo. */
function avainluvut(pelaaja: PelaajaFull, seurat: PelaajaSeura[]): Avainluku[] {
  const luvut: Avainluku[] = [];
  if (pelaaja.maaottelut != null) luvut.push({ arvo: String(pelaaja.maaottelut), selite: "maaottelua" });
  if (pelaaja.maalit != null) luvut.push({ arvo: String(pelaaja.maalit), selite: "maajoukkuemaalia" });
  const seuroja = new Set(seurat.map((s) => s.seura?.trim().toLowerCase()).filter(Boolean)).size;
  if (seuroja > 0) luvut.push({ arvo: String(seuroja), selite: seuroja === 1 ? "seura" : "seuraa" });
  const alut = seurat.map((s) => s.alkuvuosi).filter((v): v is number => v != null);
  const loput = seurat.map((s) => s.loppuvuosi ?? s.alkuvuosi).filter((v): v is number => v != null);
  if (alut.length > 0 && loput.length > 0) {
    const [a, b] = [Math.min(...alut), Math.max(...loput)];
    luvut.push({ arvo: a === b ? `${a}` : `${a}–${b}`, selite: "seuraura" });
  }
  return luvut;
}

/**
 * Pelaajaprofiilin sivu: pääkuva ja avainluvut, perustiedot, esittely, seurat ja
 * saavutukset. Litmanen-osio lisää omat osionsa `children`-kohtaan (docs/20).
 */
export function PelaajaProfiili({
  pelaaja,
  path,
  trail,
  subNav,
  naytaTilastot = true,
  related = [],
  relatedHref,
  children,
}: {
  pelaaja: PelaajaFull;
  path: string;
  trail: Crumb[];
  /** Osion sisarsivujen valikko arkiston osionavigaation alla. */
  subNav?: { items: SectionNavItem[]; label: string };
  /** `false`, kun pelaajan taulukot ovat omalla sivullaan. */
  naytaTilastot?: boolean;
  related?: (PelaajaCard & { slug: string })[];
  relatedHref?: (slug: string) => string;
  /** Sivukohtaiset osiot seurojen ja saavutusten alle. */
  children?: React.ReactNode;
}) {
  const paikka = pelipaikkaLabel(pelaaja.pelipaikka);
  const kuvat = (pelaaja.kuvat ?? []).filter(Boolean);
  const paakuva = kuvat[0];
  const lisakuvat = kuvat.slice(1);
  const seurat = (pelaaja.seurat ?? []).filter(Boolean);
  const saavutukset = (pelaaja.saavutukset ?? []).filter(Boolean);
  const tilastot = naytaTilastot ? (pelaaja.tilastot ?? []).filter(Boolean) : [];
  const description = resolveDescription(pelaaja.seoDescription, pelaaja.tiivistelma);
  const luvut = avainluvut(pelaaja, seurat);

  const syntynyt = [formatDate(pelaaja.syntymaaika), pelaaja.syntymapaikka].filter(Boolean).join(", ");
  const perustiedot = [
    { label: "Syntynyt", value: syntynyt },
    { label: "Pelipaikka", value: paikka },
    { label: "Pituus", value: pelaaja.pituus ? `${pelaaja.pituus} cm` : null },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          personSchema({
            name: pelaaja.name,
            description,
            path,
            birthDate: pelaaja.syntymaaika,
            image: paakuva ? (urlForImage(paakuva)?.width(1200).height(900).url() ?? null) : null,
          }),
        ]}
      />

      <PageHeader
        eyebrow="Pelaaja"
        title={pelaaja.name}
        lead={pelaaja.tiivistelma}
        breadcrumbs={trail}
        meta={paikka ? <Badge tone="brand">{paikka}</Badge> : undefined}
      />

      <SectionNav items={arkistoNav} label="Jalkapalloarkiston osiot" className="mt-8" />
      {subNav && <SectionNav items={subNav.items} label={subNav.label} className="mt-3" />}

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-12">
        {paakuva?.asset && (
          <figure className="mx-auto w-full max-w-sm overflow-hidden rounded-sm lg:max-w-none">
            <FramedImage
              image={paakuva}
              kuvateksti={paakuva?.caption}
              width={900}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="aspect-[4/5] w-full"
              priority
            />
            {paakuva.caption && <figcaption className="mt-2 text-sm text-muted">{paakuva.caption}</figcaption>}
          </figure>
        )}

        <div className="flex flex-col gap-8">
          <Avainluvut luvut={luvut} />

          {perustiedot.length > 0 && (
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
              {perustiedot.map((f) => (
                <div key={f.label}>
                  <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft">{f.label}</dt>
                  <dd className="mt-1 text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {pelaaja.kuvaus && pelaaja.kuvaus.length > 0 && (
            <div className="max-w-prose">
              <PortableText value={pelaaja.kuvaus} ylinOtsikko={2} />
            </div>
          )}
        </div>
      </div>

      {(seurat.length > 0 || saavutukset.length > 0) && (
        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
          <UranAikajana seurat={seurat} otsikkoId="pelaajan-seurat" />
          <Saavutukset saavutukset={saavutukset} otsikkoId="pelaajan-saavutukset" />
        </div>
      )}

      {children}

      {tilastot.length > 0 && (
        <section aria-labelledby="pelaajan-tilastot" className="mt-16">
          <h2 id="pelaajan-tilastot" className="font-display text-2xl text-foreground sm:text-3xl">
            Tilastot
          </h2>
          <StatSections tilastot={tilastot} headingLevel="h3" className="mt-6" />
        </section>
      )}

      {lisakuvat.length > 0 && (
        <section aria-labelledby="pelaajan-kuvat" className="mt-16">
          <h2 id="pelaajan-kuvat" className="font-display text-2xl text-foreground sm:text-3xl">
            Kuvat
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lisakuvat.map((kuva, index) => (
              <li key={kuva?._key ?? index}>
                <figure>
                  <FramedImage
                    image={kuva}
                    kuvateksti={kuva?.caption}
                    width={800}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="aspect-[4/3] w-full rounded-sm"
                  />
                  {kuva?.caption && <figcaption className="mt-2 text-sm text-muted">{kuva.caption}</figcaption>}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && relatedHref && (
        <section aria-labelledby="muut-pelaajat" className="mt-16">
          <h2 id="muut-pelaajat" className="font-display text-2xl text-foreground sm:text-3xl">
            Muita pelaajia arkistossa
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item._id}>
                <Card href={relatedHref(item.slug)} className="h-full">
                  {pelipaikkaLabel(item.pelipaikka) && <CardEyebrow>{pelipaikkaLabel(item.pelipaikka)}</CardEyebrow>}
                  <CardTitle className="mt-1">{item.name}</CardTitle>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
