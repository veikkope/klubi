import {
  PortableText as PortableTextRaw,
  type PortableTextBlockComponent,
  type PortableTextComponents,
  type PortableTextTypeComponent,
  type PortableTextBlock,
} from "@portabletext/react";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import { SanityImage } from "./sanity-image";
import { Kokoonpano, type KokoonpanoData } from "./kokoonpano";
import { YoutubeVideo, type YoutubeVideoData } from "./youtube-video";
import { Kuvasarja, type KuvasarjaData } from "./kuvasarja";
import { LiiteKortti, type LiiteData } from "./liite-kortti";
import { Huomiolaatikko, type HuomioData } from "./huomiolaatikko";
import { Upotus, type UpotusData } from "./upotus";
import { LinkButton } from "@/components/ui/button";
import { StatTable, type StatColumn, type StatRow } from "@/components/ui/stat-table";
import { UusiValilehti } from "@/components/ui/uusi-valilehti";
import { liitteenTiedot } from "@/lib/liite";
import { linkinOsoite, linkinTyyppi, type LinkkiData } from "@/lib/linkki";
import type { RikasLohko } from "@/lib/sisaltolohkot";
import type { SanityImage as SanityImageData } from "@/lib/types";

type OtsikkoTyyli = "h2" | "h3" | "h4";
type OtsikkoTaso = 2 | 3 | 4 | 5 | 6;

/** Ulkoasu seuraa sisällön tyyliä; HTML-taso voi olla eri (ks. `ylinOtsikko`). */
const OTSIKKO_LUOKAT: Record<OtsikkoTyyli, string> = {
  h2: "mt-12 font-display text-3xl leading-tight",
  h3: "mt-10 font-display text-2xl leading-tight",
  h4: "mt-8 font-display text-xl leading-tight",
};

function otsikko(tyyli: OtsikkoTyyli, siirto: number) {
  const taso = Math.min(6, Math.max(2, Number(tyyli.slice(1)) + siirto)) as OtsikkoTaso;
  const Tagi = `h${taso}` as const;
  function Otsikko({ children }: { children?: React.ReactNode }) {
    return <Tagi className={OTSIKKO_LUOKAT[tyyli]}>{children}</Tagi>;
  }
  return Otsikko;
}

/**
 * Tavallinen kappale; ensimmäinen (index 0) ingressinä. `data-ingressi`
 * antaa kutsujan tyyleille tavan rajata ingressi pois kappaletyyleistä.
 */
const kappaleIngressilla: PortableTextBlockComponent = ({ children, index }) =>
  index === 0 ? (
    <p data-ingressi className="font-display text-xl font-normal leading-[1.5] text-heading sm:text-2xl sm:leading-[1.45]">
      {children}
    </p>
  ) : (
    <p className="mt-4 text-lg leading-relaxed text-foreground">{children}</p>
  );

/**
 * Lohkojen renderöijät. `satisfies` varmistaa käännösaikana, että jokaisella
 * `RIKKAAT_LOHKOT`-lohkolla (lib/sisaltolohkot.ts) on renderöijä: uusi lohko
 * skeemaan ilman renderöijää kaataa type-checkin (CI).
 */
const lohkot = {
  imageWithAlt: ({ value }: { value: SanityImageData }) => {
    if (!value) return null;
    return (
      <figure className="mt-8">
        {/* Rajaamaton: migroidussa sisällössä on kaavioita ja otteluohjelmia,
            joista 3:2-rajaus leikkaisi tietoa pois. */}
        <SanityImage
          image={value}
          kuvateksti={value?.caption}
          width={1200}
          crop={false}
          sizes="(min-width: 768px) 720px, 100vw"
          className="h-auto max-w-full rounded-xl"
        />
        {value.caption && (
          <figcaption className="mt-2 text-sm text-muted">
            {value.caption}
          </figcaption>
        )}
      </figure>
    );
  },
  kokoonpano: kokoonpanoLohko(0),
  // Vain data client-komponentille: Portable Text antaa lohkoille myös
  // funktioproppeja (renderNode), joita ei voi välittää palvelimelta.
  youtubeVideo: ({ value }: { value: YoutubeVideoData }) => (
    <YoutubeVideo value={{ url: value?.url, otsikko: value?.otsikko, kuvateksti: value?.kuvateksti }} />
  ),
  // Kuvasarja: galleria-albumin ruudukko ja suurennos (client) saavat vain dataa.
  kuvasarja: ({ value }: { value: KuvasarjaData }) => (
    <Kuvasarja value={{ kuvat: value?.kuvat ?? [], kuvaus: value?.kuvaus, asettelu: value?.asettelu }} />
  ),
  // Tekstilohkot (docs/24 askel 6). Upotus tulkitaan palvelimella; selaimeen
  // menee vain valmis osoite, ei liitettyä tekstiä.
  upotus: ({ value }: { value: UpotusData }) => (
    <Upotus value={{ osoite: value?.osoite, otsikko: value?.otsikko, kuvateksti: value?.kuvateksti }} />
  ),
  huomio: ({ value }: { value: HuomioData }) => (
    <Huomiolaatikko savy={value?.savy} otsikko={value?.otsikko} teksti={value?.teksti} />
  ),
  // Painike: kohde linkkiobjektista (Sivuston sivu / Muu osoite / Tiedosto).
  // Ilman toimivaa kohdetta tai tekstiä painiketta ei näytetä.
  painike: ({ value }: { value: { teksti?: string | null; linkki?: LinkkiData | null } }) => {
    const href = stegaClean(linkinOsoite(value?.linkki));
    const teksti = value?.teksti?.trim();
    if (!href || !teksti) return null;
    return (
      <p className="mt-6">
        <LinkButton href={href} size="lg">
          {value.teksti}
        </LinkButton>
      </p>
    );
  },
  liite: ({ value }: { value: LiiteData }) => (
    <LiiteKortti otsikko={value?.otsikko} liitetiedosto={value?.liitetiedosto} />
  ),
  taulukko: ({ value }: { value: TaulukkoData }) => {
    const sarakkeet = taulukonSarakkeet(value?.columns);
    if (sarakkeet.length === 0) return null;
    return (
      <div className="mt-8">
        <StatTable
          caption={value.otsikko?.trim() || "Taulukko"}
          captionVisible
          columns={sarakkeet}
          rows={taulukonRivit(value.rows)}
        />
      </div>
    );
  },
} satisfies Record<RikasLohko, PortableTextTypeComponent>;

type TaulukkoData = {
  otsikko?: string | null;
  columns?: { key?: string | null; label?: string | null; type?: string | null }[] | null;
  rows?: { cells?: { key?: string | null; value?: string | null }[] | null }[] | null;
};

/**
 * Taulukon sarakkeet ja rivit `StatTable`lle. Sarake- ja soluavaimet sekä
 * tyyppi puhdistetaan stega-merkeistä: luonnosnäkymässä ne olisivat muuten
 * eri merkkijonoja, eikä solu löytäisi saraketta. Näkyvät tekstit säilyvät.
 */
function taulukonSarakkeet(columns: TaulukkoData["columns"]): StatColumn[] {
  return (columns ?? []).flatMap((c) =>
    c?.key ? [{ key: stegaClean(c.key), label: c.label ?? "", type: stegaClean(c.type ?? "text") as StatColumn["type"] }] : [],
  );
}

function taulukonRivit(rows: TaulukkoData["rows"]): StatRow[] {
  return (rows ?? []).map((r) => ({
    cells: (r?.cells ?? []).flatMap((c) => (c?.key ? [{ key: stegaClean(c.key), value: c.value }] : [])),
  }));
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-4 text-lg leading-relaxed text-foreground first:mt-0">
        {children}
      </p>
    ),
    h2: otsikko("h2", 0),
    h3: otsikko("h3", 0),
    h4: otsikko("h4", 0),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-navy bg-surface px-5 py-3 text-lg italic text-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-1 pl-6 text-lg text-foreground marker:text-muted-soft">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-1 pl-6 text-lg text-foreground marker:text-muted">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => <span className="underline">{children}</span>,
    // Linkkiobjekti (docs/24 askel 4): Sivuston sivu, Muu osoite tai Tiedosto.
    // Ilman toimivaa kohdetta (julkaisematon tai ajastettu sivu, virheellinen
    // osoite) näytetään pelkkä teksti, ei rikkinäistä linkkiä.
    link: ({ value, children }) => {
      const href = stegaClean(linkinOsoite(value as LinkkiData | undefined));
      if (!href) return <>{children}</>;
      const newTab = linkinTyyppi(value) !== "sivu" && Boolean(value?.newTab);
      // Tiedoston tyyppi ja koko linkin tekstiin, esim. "Säännöt (PDF, 240 kt)".
      const tiedosto = linkinTyyppi(value) === "tiedosto" ? liitteenTiedot(value?.tiedosto) : "";
      if (newTab || /^https?:/.test(href)) {
        return (
          <a
            href={href}
            target={newTab ? "_blank" : undefined}
            rel={newTab ? "noopener noreferrer" : undefined}
            className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {children}
            {tiedosto && <span className="text-sm text-muted"> ({tiedosto})</span>}
            {newTab && <UusiValilehti />}
          </a>
        );
      }
      return (
        <Link href={href} className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2">
          {children}
        </Link>
      );
    },
  },
  types: lohkot,
};

/** Kokoonpanon otsikko on sisällössä h3-tasoinen otsikko (siirretään kuten muutkin). */
function kokoonpanoLohko(siirto: number) {
  const Otsikko = otsikko("h3", siirto);
  function KokoonpanoLohko({ value }: { value: KokoonpanoData }) {
    return <Kokoonpano value={value} Otsikko={Otsikko} />;
  }
  return KokoonpanoLohko;
}

/** Sisällön ylimmän otsikon taso (2–4), tai null jos otsikoita ei ole. */
function ylinTaso(value: PortableTextBlock[]): number | null {
  const tasot = value
    .map((b) =>
      b._type === "kokoonpano"
        ? 3
        : typeof b.style === "string" && /^h[2-4]$/.test(b.style)
          ? Number(b.style.slice(1))
          : null,
    )
    .filter((t): t is number => t !== null);
  return tasot.length > 0 ? Math.min(...tasot) : null;
}

/**
 * @param ylinOtsikko Otsikkotaso, jolle sisällön ylin otsikko asetetaan
 *   (WCAG 1.3.1: tasot eivät saa hypätä). Migroitu sisältö alkaa usein h3:lla
 *   suoraan sivun h1:n alla; `ylinOtsikko={2}` nostaa kaikkia otsikoita tasolla.
 *   Ulkoasu ei muutu. Ilman arvoa tasot ovat sellaisenaan.
 * @param ingressi Ensimmäinen kappale ingressinä: isompi serif, kuten
 *   ravintola-arvion alussa. Kutsuja päättää, sopiiko kappale ingressiksi
 *   (`ensimmainenKappaleIngressiksi`, lib/artikkeli.ts).
 */
export function PortableText({
  value,
  ylinOtsikko,
  ingressi = false,
}: {
  value: PortableTextBlock[] | null | undefined;
  ylinOtsikko?: 2 | 3 | 4;
  ingressi?: boolean;
}) {
  if (!value || value.length === 0) return null;
  const ylin = ylinOtsikko ? ylinTaso(value) : null;
  const siirto = ylinOtsikko && ylin ? ylinOtsikko - ylin : 0;
  const kaytettavat =
    siirto === 0 && !ingressi
      ? components
      : {
          ...components,
          block: {
            ...(components.block as object),
            ...(siirto !== 0 && {
              h2: otsikko("h2", siirto),
              h3: otsikko("h3", siirto),
              h4: otsikko("h4", siirto),
            }),
            ...(ingressi && { normal: kappaleIngressilla }),
          },
          ...(siirto !== 0 && {
            types: { ...(components.types as object), kokoonpano: kokoonpanoLohko(siirto) },
          }),
        };
  return <PortableTextRaw value={value} components={kaytettavat} />;
}
