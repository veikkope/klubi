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

type Crumb = { label: string; href?: string };

/** Seurahistoria aikajanalle: tuorein ensin, vuodettomat loppuun. */
function sortSeurat(seurat: PelaajaSeura[]): PelaajaSeura[] {
  return [...seurat].sort((a, b) => {
    const aStart = a.alkuvuosi ?? Number.NEGATIVE_INFINITY;
    const bStart = b.alkuvuosi ?? Number.NEGATIVE_INFINITY;
    return bStart - aStart;
  });
}

/** "1992–1999", "2015–" tai "2015" riippuen siitä mitä vuosia on tiedossa. */
function seuraVuodet(seura: PelaajaSeura): string | null {
  const { alkuvuosi, loppuvuosi } = seura;
  if (alkuvuosi != null && loppuvuosi != null) {
    return alkuvuosi === loppuvuosi
      ? `${alkuvuosi}`
      : `${alkuvuosi}–${loppuvuosi}`;
  }
  if (alkuvuosi != null) return `${alkuvuosi}–`;
  if (loppuvuosi != null) return `–${loppuvuosi}`;
  return null;
}

/**
 * Pelaajaprofiilin sivu: perustiedot, kuvaus, seurahistoria ja kuvat.
 * Käytössä Litmanen-osiossa ja yleisellä pelaajasivulla.
 */
export function PelaajaProfiili({
  pelaaja,
  path,
  trail,
  subNav,
  naytaTilastot = true,
  related = [],
  relatedHref,
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
}) {
  const paikka = pelipaikkaLabel(pelaaja.pelipaikka);
  const kuvat = (pelaaja.kuvat ?? []).filter(Boolean);
  const paakuva = kuvat[0];
  const lisakuvat = kuvat.slice(1);
  const seurat = sortSeurat((pelaaja.seurat ?? []).filter(Boolean));
  const tilastot = naytaTilastot ? (pelaaja.tilastot ?? []).filter(Boolean) : [];
  const description = resolveDescription(
    pelaaja.seoDescription,
    pelaaja.tiivistelma,
  );

  const hasFacts = Boolean(
    pelaaja.syntymaaika ||
      paikka ||
      pelaaja.maaottelut != null ||
      pelaaja.maalit != null,
  );

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
            image: paakuva
              ? (urlForImage(paakuva)?.width(1200).height(900).url() ?? null)
              : null,
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

      <SectionNav
        items={arkistoNav}
        label="Jalkapalloarkiston osiot"
        className="mt-8"
      />
      {subNav && (
        <SectionNav items={subNav.items} label={subNav.label} className="mt-3" />
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        {paakuva?.asset && (
          <figure className="overflow-hidden rounded-2xl">
            <FramedImage
              image={paakuva}
              kuvateksti={paakuva?.caption}
              width={900}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="aspect-[9/11] w-full"
              priority
            />
            {paakuva.caption && (
              <figcaption className="mt-2 text-sm text-muted">
                {paakuva.caption}
              </figcaption>
            )}
          </figure>
        )}

        <div>
          {hasFacts && (
            <dl className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
              <Fact label="Syntymäaika" value={formatDate(pelaaja.syntymaaika)} />
              <Fact label="Pelipaikka" value={paikka} />
              <Fact
                label="Maaottelut"
                value={pelaaja.maaottelut?.toString()}
                numeric
              />
              <Fact
                label="Maalit maajoukkueessa"
                value={pelaaja.maalit?.toString()}
                numeric
              />
            </dl>
          )}

          {pelaaja.kuvaus && pelaaja.kuvaus.length > 0 && (
            <div className="mt-8">
              <PortableText value={pelaaja.kuvaus} />
            </div>
          )}
        </div>
      </div>

      {seurat.length > 0 && (
        <section aria-labelledby="seurahistoria" className="mt-16">
          <h2
            id="seurahistoria"
            className="font-display text-2xl text-foreground sm:text-3xl"
          >
            Seurahistoria
          </h2>
          <ol className="mt-6 border-l border-border">
            {seurat.map((seura, index) => {
              const vuodet = seuraVuodet(seura);
              return (
                <li
                  key={seura._key ?? `${seura.seura}-${index}`}
                  className="relative py-3 pl-6"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent"
                  />
                  <p className="font-medium text-foreground">{seura.seura}</p>
                  {vuodet && (
                    <p className="text-sm tabular-nums text-muted">{vuodet}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {tilastot.length > 0 && (
        <section aria-labelledby="pelaajan-tilastot" className="mt-16">
          <h2
            id="pelaajan-tilastot"
            className="font-display text-2xl text-foreground sm:text-3xl"
          >
            Tilastot
          </h2>
          <StatSections
            tilastot={tilastot}
            headingLevel="h3"
            className="mt-6"
          />
        </section>
      )}

      {lisakuvat.length > 0 && (
        <section aria-labelledby="pelaajan-kuvat" className="mt-16">
          <h2
            id="pelaajan-kuvat"
            className="font-display text-2xl text-foreground sm:text-3xl"
          >
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
                    className="aspect-[4/3] w-full rounded-2xl"
                  />
                  {kuva?.caption && (
                    <figcaption className="mt-2 text-sm text-muted">
                      {kuva.caption}
                    </figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && relatedHref && (
        <section aria-labelledby="muut-pelaajat" className="mt-16">
          <h2
            id="muut-pelaajat"
            className="font-display text-2xl text-foreground sm:text-3xl"
          >
            Muita pelaajia arkistossa
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item._id}>
                <Card href={relatedHref(item.slug)} className="h-full">
                  {pelipaikkaLabel(item.pelipaikka) && (
                    <CardEyebrow>{pelipaikkaLabel(item.pelipaikka)}</CardEyebrow>
                  )}
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

function Fact({
  label,
  value,
  numeric = false,
}: {
  label: string;
  value?: string | null;
  numeric?: boolean;
}) {
  return (
    <div className="bg-surface px-5 py-4">
      <dt className="font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
        {label}
      </dt>
      <dd
        className={
          numeric
            ? "mt-1 text-base tabular-nums text-foreground"
            : "mt-1 text-base text-foreground"
        }
      >
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}
