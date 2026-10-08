import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatRating, type SubRatingKey } from "@/components/restaurant-card";
import { HAKU_MAX_PITUUS, hakusanat, siistiHaku } from "@/lib/haku";
import { MAAKUNNAT, SUOMI, SUOMI_SLUG, isMaakunta, maakuntaTitle } from "@/lib/maakunnat";
import type { RavintolaCityFacet, RavintolatFacetData, RavintolatOrdering } from "@/sanity/lib/queries/ravintolat";

/**
 * Ravintolahakemiston haku, järjestys ja rajaukset.
 *
 * Tila on URL:ssa, ei Reactissa. Se on tietoinen valinta:
 *  - suodatettu näkymä on jaettavissa ja kirjanmerkittävissä
 *  - lomake on tavallinen `method="get"` -lomake, joten se toimii myös ilman
 *    JavaScriptiä; selain rakentaa kyselymerkkijonon puolestamme
 *  - palvelin renderöi tulokset, joten hakukoneet ja vastausmoottorit näkevät
 *    saman sisällön kuin käyttäjä
 *
 * Tämän vuoksi komponentti on Server Component eikä `"use client"`.
 *
 * Näkymässä on kolme asiaa, jotka toimivat yhdessä (mikään ei nollaa toista):
 *  1. hakukenttä (nimi, kaupunki tai maa)
 *  2. järjestys: uusimmat, parhaat, paras ruoka/hinta/viihtyvyys tai A–Ö.
 *     Arvosanajärjestyksissä kortit numeroidaan, joten "Lahti + Paras ruoka"
 *     on Lahden paras ruoka -lista.
 *  3. rajaukset "Rajaa"-osiossa: alue (maa tai maakunta), kaupunki,
 *     vähimmäisarvosana ja lopettaneet. Valinta päivittää tulokset heti
 *     (`data-heti`, `HakuNakyma`); ilman JavaScriptiä on "Näytä tulokset" -painike.
 *
 * Valinnat (maat, maakunnat, kaupungit, määrät) tulevat Sanityn ravintoloista
 * ja kaupungeista, joten uusi kaupunki tai maa ilmestyy tänne itsestään.
 */

/**
 * Järjestykset. `osa`: osa-arvosana, jonka kortti näyttää kokonaisarvosanan
 * lisäksi (esim. "Ruoka 4,3"). `sija`: kortit numeroidaan (paras = 1.).
 */
export const RAVINTOLA_SORTS = [
  { value: "uusin", label: "Uusimmat", osa: null, sija: false },
  { value: "arvosana", label: "Parhaat", osa: null, sija: true },
  { value: "ruoka", label: "Paras ruoka", osa: "ratingFood", sija: true },
  { value: "hinta", label: "Paras hinta", osa: "ratingPrice", sija: true },
  { value: "viihtyvyys", label: "Paras viihtyvyys", osa: "ratingAtmosphere", sija: true },
  { value: "nimi", label: "A–Ö", osa: null, sija: false },
] as const satisfies readonly { value: RavintolatOrdering; label: string; osa: SubRatingKey | null; sija: boolean }[];

export type RavintolaSort = (typeof RAVINTOLA_SORTS)[number]["value"];

export function ravintolaSort(value: RavintolaSort) {
  return RAVINTOLA_SORTS.find((s) => s.value === value) ?? RAVINTOLA_SORTS[0];
}

/**
 * Vanhat top-listaosoitteet (`?lista=ruoka`) ovat nyt järjestyksiä. Ne
 * ohjautuvat uuteen osoitteeseen (`?jarjesta=ruoka`), joten jaetut linkit toimivat.
 */
const VANHAT_LISTAT: Record<string, RavintolaSort> = {
  parhaat: "arvosana",
  ruoka: "ruoka",
  hinta: "hinta",
  viihtyvyys: "viihtyvyys",
};

/** Vähimmäisarvosanan valinnat. Vanha osoite voi sisältää muunkin arvon (näytetään silloin lisäksi). */
export const MIN_RATING_OPTIONS = [3, 3.5, 4, 4.5] as const;

export type RavintolaFilterValues = {
  /** Hakukentän teksti siistittynä (`lib/haku.ts`), tyhjä = ei hakua. */
  q: string;
  kaupunki: string | null;
  /** Maan slug (`lib/slugify.ts` maan nimestä), esim. "saksa". */
  maa: string | null;
  /**
   * Maakuntien arvot, esim. ["uusimaa"]. Tyhjä = ei rajausta. Useampi arvo
   * (`?maakunta=uusimaa,kanta-hame`) = mikä tahansa niistä; niitä käyttävät
   * vanhojen aluesivujen ohjaukset, joiden ravintolat ylittävät maakunnan rajan.
   */
  maakunta: string[];
  arvosana: number | null;
  lopettaneet: boolean;
  jarjesta: RavintolaSort;
  sivu: number;
};

export const RAVINTOLA_DEFAULT_FILTERS: RavintolaFilterValues = {
  q: "",
  kaupunki: null,
  maa: null,
  maakunta: [],
  arvosana: null,
  lopettaneet: false,
  jarjesta: "uusin",
  sivu: 1,
};

export type RavintolaSearchParams = Record<string, string | string[] | undefined>;

/** URL-parametrit, joista hakemiston tila luetaan. Muihin (esim. esikatselu) ei kosketa. */
export const RAVINTOLA_PARAMS = [
  "q", "lista", "alue", "kaupunki", "maa", "maakunta", "arvosana", "lopettaneet", "jarjesta", "sivu",
] as const;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function values(value: string | string[] | undefined): string[] {
  return [value ?? []]
    .flat()
    .flatMap((v) => v.split(","))
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

const SLUG = /^[a-z0-9-]{1,60}$/;

/**
 * Lukee ja validoi suodattimet URL:sta. Kelvoton arvo putoaa oletukseen.
 *
 * Alue tulee joko lomakkeen `?alue=`-valinnasta (maa tai maakunta samassa
 * valikossa) tai suorista `?maa=`/`?maakunta=`-parametreista (vanhat
 * ohjaukset ja jaetut linkit). Lomakkeen `alue` voittaa.
 */
export function parseRavintolaFilters(
  sp: RavintolaSearchParams,
): RavintolaFilterValues {
  let maa: string | null;
  let pyydetytMaakunnat: string[];
  if (sp.alue !== undefined) {
    const alue = values(sp.alue);
    if (alue.length > 0 && alue.every(isMaakunta)) {
      maa = null;
      pyydetytMaakunnat = alue;
    } else {
      maa = alue[0] && SLUG.test(alue[0]) ? alue[0] : null;
      pyydetytMaakunnat = [];
    }
  } else {
    const m = first(sp.maa)?.trim().toLowerCase();
    maa = m && SLUG.test(m) ? m : null;
    pyydetytMaakunnat = values(sp.maakunta).filter(isMaakunta);
  }
  // Maakunta on vain Suomessa: toinen maa ohittaa maakuntarajauksen, ja
  // maakunta tekee Suomi-rajauksesta tarpeettoman. Kanoninen järjestys.
  const requested = new Set(pyydetytMaakunnat);
  const maakunta =
    maa && maa !== SUOMI_SLUG
      ? []
      : MAAKUNNAT.map((m) => m.value as string).filter((v) => requested.has(v));
  if (maakunta.length > 0) maa = null;

  const kaupunki = first(sp.kaupunki)?.trim();
  const arvosana = Number.parseFloat(first(sp.arvosana) ?? "");
  const sivu = Number.parseInt(first(sp.sivu) ?? "", 10);
  const jarjesta =
    RAVINTOLA_SORTS.find((s) => s.value === first(sp.jarjesta))?.value ??
    VANHAT_LISTAT[first(sp.lista) ?? ""] ??
    RAVINTOLA_DEFAULT_FILTERS.jarjesta;

  // Liian lyhyt haku (esim. "a") ei rajaa mitään, joten sitä ei pidetä hakuna.
  const q = siistiHaku(first(sp.q));

  return {
    q: hakusanat(q).length > 0 ? q : "",
    kaupunki: kaupunki && /^[a-z0-9_-]{1,60}$/i.test(kaupunki) ? kaupunki : null,
    maa,
    maakunta,
    arvosana:
      Number.isFinite(arvosana) && arvosana > 0 && arvosana <= 5
        ? arvosana
        : null,
    lopettaneet: first(sp.lopettaneet) === "1",
    jarjesta,
    sivu: Number.isInteger(sivu) && sivu > 1 ? sivu : 1,
  };
}

/** Valitun alueen (maa tai maakunnat) kaupungit. Ilman aluetta kaikki. */
export function alueenKaupungit(
  facets: RavintolatFacetData,
  f: Pick<RavintolaFilterValues, "maa" | "maakunta">,
): RavintolaCityFacet[] {
  if (f.maakunta.length) {
    return facets.cities.filter((c) => c.maakunta !== null && f.maakunta.includes(c.maakunta));
  }
  if (f.maa) {
    const names = facets.countries.find((c) => c.slug === f.maa)?.names ?? [];
    return facets.cities.filter((c) => c.country !== null && names.includes(c.country));
  }
  return facets.cities;
}

/**
 * Pitää alueen ja kaupungin yhteensopivina: kun alue vaihtuu, toisen alueen
 * kaupunki putoaa pois (muuten tulos olisi aina tyhjä). Tuntematon kaupunki
 * jätetään ennalleen, jotta tyhjä tulos kertoo siitä rehellisesti.
 */
export function sovitaAlue(f: RavintolaFilterValues, facets: RavintolatFacetData): RavintolaFilterValues {
  if (!f.kaupunki || (!f.maa && !f.maakunta.length)) return f;
  if (!facets.cities.some((c) => c.slug === f.kaupunki)) return f;
  return alueenKaupungit(facets, f).some((c) => c.slug === f.kaupunki) ? f : { ...f, kaupunki: null };
}

/**
 * Kaupungin vanha tunniste nykyiseksi (docs/24 askel 8): kun kaupungin
 * osoite muuttuu, webhook tallentaa vanhan kenttään `aiemmatPolut`, ja vanha
 * `?kaupunki=`-linkki (myös vanhan sivuston .htm-ohjaukset) ohjautuu uuteen.
 * Nykyinen ja tuntematon tunniste jäävät ennalleen.
 */
export function korjaaKaupunki(f: RavintolaFilterValues, facets: RavintolatFacetData): RavintolaFilterValues {
  if (!f.kaupunki || facets.cities.some((c) => c.slug === f.kaupunki)) return f;
  const uusi = facets.cities.find((c) => c.aiemmatTunnisteet?.includes(f.kaupunki!));
  return uusi ? { ...f, kaupunki: uusi.slug } : f;
}

/** Rakentaa hakemiston osoitteen. Tyhjät ja oletusarvot jätetään pois URL:sta. */
export function buildRavintolaHref(
  current: RavintolaFilterValues,
  override: Partial<RavintolaFilterValues> = {},
): string {
  const merged = { ...current, ...override };
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.kaupunki) params.set("kaupunki", merged.kaupunki);
  if (merged.maa) params.set("maa", merged.maa);
  if (merged.maakunta.length) params.set("maakunta", merged.maakunta.join(","));
  if (merged.arvosana) params.set("arvosana", String(merged.arvosana));
  if (merged.lopettaneet) params.set("lopettaneet", "1");
  if (merged.jarjesta !== RAVINTOLA_DEFAULT_FILTERS.jarjesta) params.set("jarjesta", merged.jarjesta);
  if (merged.sivu > 1) params.set("sivu", String(merged.sivu));
  return hakemistoHref(params);
}

/** Pilkku on sallittu kyselymerkkijonossa (RFC 3986); arvot ovat muuten slugeja. */
function hakemistoHref(params: URLSearchParams): string {
  const qs = params.toString().replace(/%2C/g, ",");
  return qs ? `/ravintolat?${qs}` : "/ravintolat";
}

/**
 * Osoite, johon pyyntö pitää ohjata, tai null, jos se on jo siisti.
 *
 * Ilman JavaScriptiä lomake lähettää myös tyhjät kentät ja `alue`-valinnan
 * (`?alue=uusimaa&kaupunki=&…`), ja vanhat linkit voivat olla muodossa
 * `?lista=ruoka`. Ne ohjataan lyhyeen muotoon (`?maakunta=uusimaa`), jotta
 * osoite on siisti jakaa. Muut kuin hakemiston omat parametrit säilyvät.
 *
 * Parametrien järjestyksellä ei ole väliä: JavaScriptillä lomake (HakuNakyma)
 * lähettää jo siistit parametrit kenttien järjestyksessä, eikä sitä ohjata.
 * Ohjaus renderöisi sivun alusta, jolloin rajauspaneeli sulkeutuisi ja
 * valikon fokus katoaisi.
 */
export function siistiRavintolaHref(sp: RavintolaSearchParams, kanoninen: string): string | null {
  const omat = new URLSearchParams();
  const muut = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    for (const v of [value ?? []].flat()) {
      ((RAVINTOLA_PARAMS as readonly string[]).includes(key) ? omat : muut).append(key, v);
    }
  }
  omat.sort();
  const kanonisetJarjestettyna = new URLSearchParams(kanoninen.split("?")[1] ?? "");
  kanonisetJarjestettyna.sort();
  if (omat.toString() === kanonisetJarjestettyna.toString()) return null;
  // Varmistus silmukkaa vastaan: siisti osoite luetaan takaisin samaksi.
  const kanonisetParametrit = Object.fromEntries(new URLSearchParams(kanoninen.split("?")[1] ?? ""));
  if (buildRavintolaHref(parseRavintolaFilters(kanonisetParametrit)) !== kanoninen) return null;
  if (![...muut].length) return kanoninen;
  return `${kanoninen}${kanoninen.includes("?") ? "&" : "?"}${muut.toString()}`;
}

/** Onko jokin muu kuin oletusnäkymä voimassa (haku tai rajaus; järjestys ei ole rajaus). */
export function hasActiveRavintolaFilters(f: RavintolaFilterValues): boolean {
  return Boolean(f.q || rajaustenMaara(f) > 0);
}

/** "Rajaa"-osion voimassa olevien rajausten määrä. */
export function rajaustenMaara(f: RavintolaFilterValues): number {
  return (
    [f.kaupunki, f.maa, f.arvosana, f.lopettaneet].filter(Boolean).length + f.maakunta.length
  );
}

const fieldClass =
  "h-12 w-full rounded-sm border border-border-input bg-background px-3 text-base text-foreground " +
  "transition focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const FORM_ID = "ravintolahaku-lomake";

const chipBase =
  "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-sm border px-4 text-sm font-medium transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const chipActive = "border-primary bg-primary text-on-primary hover:text-on-primary";
const chipIdle = "border-border bg-background text-foreground hover:border-accent hover:text-accent";

const labelClass = "text-sm font-semibold text-foreground";

type Props = {
  active: RavintolaFilterValues;
  facets: RavintolatFacetData;
  /** Osumien määrä nykyisillä rajauksilla — kerrotaan ruudunlukijalle. */
  resultCount: number;
};

export function RavintolaFilterBar({ active, facets, resultCount }: Props) {
  const rajauksia = rajaustenMaara(active);

  return (
    <section aria-label="Hae ja rajaa ravintoloita" className="flex flex-col gap-4">
      {/*
        Yksi GET-lomake: hakukenttä on tässä, ja "Rajaa"-osion kentät
        liittyvät siihen `form`-attribuutilla. Järjestys kulkee piilokenttänä,
        joten haku ei nollaa järjestystä eikä rajauksia.
      */}
      <form
        id={FORM_ID}
        role="search"
        method="get"
        action="/ravintolat"
        data-heti
        className="flex max-w-2xl gap-2"
      >
        <label htmlFor="ravintolahaku" className="sr-only">
          Hae ravintolaa nimellä, kaupungilla tai maalla
        </label>
        <div className="relative flex-1">
          <Search
            aria-hidden
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft"
          />
          <input
            id="ravintolahaku"
            type="search"
            name="q"
            defaultValue={active.q}
            maxLength={HAKU_MAX_PITUUS}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Nimi tai paikkakunta"
            className="h-12 w-full rounded-sm border border-border-input bg-background pl-10 pr-3 text-base text-foreground placeholder:text-muted-soft focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>
        {active.jarjesta !== RAVINTOLA_DEFAULT_FILTERS.jarjesta && (
          <input type="hidden" name="jarjesta" value={active.jarjesta} />
        )}
        <Button type="submit" size="lg">
          Hae
        </Button>
      </form>

      <details className="group rounded-sm border border-border bg-surface">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-sm px-4 text-[15px] font-medium text-foreground transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-5 [&::-webkit-details-marker]:hidden">
          <SlidersHorizontal aria-hidden size={18} className="shrink-0 text-muted-soft" />
          <span className="flex-1">
            Rajaa: alue ja arvosana
            {rajauksia > 0 && (
              <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold tabular-nums text-on-primary">
                {rajauksia}
                <span className="sr-only">&nbsp;valittuna</span>
              </span>
            )}
          </span>
          <ChevronDown aria-hidden size={18} className="shrink-0 transition group-open:rotate-180" />
        </summary>

        <Rajaukset active={active} facets={facets} />
      </details>

      <nav aria-label="Järjestys" className="flex flex-col gap-2">
        <p aria-hidden className="text-sm font-semibold text-foreground">
          Järjestä
        </p>
        {/* Puhelimella yksi vieritettävä rivi reunasta reunaan, isommalla rivitys. */}
        <ul data-vaakarivi className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
          {RAVINTOLA_SORTS.map((sort) => (
            <li key={sort.value} className="shrink-0">
              <Link
                href={buildRavintolaHref(active, { jarjesta: sort.value, sivu: 1 })}
                aria-current={active.jarjesta === sort.value ? "true" : undefined}
                className={cn(chipBase, active.jarjesta === sort.value ? chipActive : chipIdle)}
              >
                {sort.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-3">
        <p aria-live="polite" className="text-[15px] font-medium text-foreground">
          {resultCount === 0
            ? active.q
              ? "Ei osumia haulla."
              : "Ei osumia näillä rajauksilla."
            : `${resultCount} ${resultCount === 1 ? "ravintola" : "ravintolaa"}`}
        </p>
        {hasActiveRavintolaFilters(active) && <ActiveFilterChips active={active} facets={facets} />}
      </div>
    </section>
  );
}

/** "Rajaa"-osion kentät. Jokainen valinta päivittää tulokset heti (`data-heti`). */
function Rajaukset({ active, facets }: { active: RavintolaFilterValues; facets: RavintolatFacetData }) {
  const suomi = facets.countries.find((c) => c.slug === SUOMI_SLUG);
  const ulkomaat = facets.countries.filter((c) => c.slug !== SUOMI_SLUG);
  const tunnettuMaa = !active.maa || facets.countries.some((c) => c.slug === active.maa);
  const alueValue = active.maakunta.length ? active.maakunta.join(",") : (active.maa ?? "");

  // Kaupunkivalikko rajautuu valittuun alueeseen; valittu kaupunki pysyy
  // listassa, jotta lomake ei hiljaa pudota sitä.
  const alueRajattu = Boolean(active.maa || active.maakunta.length);
  const kaupungit = [...alueenKaupungit(facets, active)];
  const valittuKaupunki = facets.cities.find((c) => c.slug === active.kaupunki);
  if (valittuKaupunki && !kaupungit.includes(valittuKaupunki)) kaupungit.push(valittuKaupunki);
  // Ilman aluetta kaupungit ryhmitellään maittain (Suomi ensin), jottei
  // Ateena ja Lahti ole samassa pitkässä listassa.
  const ryhmat = alueRajattu
    ? [{ maa: null, kaupungit }]
    : facets.countries
        .map((c) => ({ maa: c.name, kaupungit: kaupungit.filter((k) => k.country !== null && c.names.includes(k.country)) }))
        .filter((r) => r.kaupungit.length > 0);

  const arvosanat: number[] = [...MIN_RATING_OPTIONS];
  if (active.arvosana && !arvosanat.includes(active.arvosana)) {
    arvosanat.push(active.arvosana);
    arvosanat.sort((a, b) => a - b);
  }

  return (
    <div className="flex flex-col gap-5 border-t border-border p-4 sm:p-5">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="suodatin-alue" className={labelClass}>
            Alue
          </label>
          {/*
            Maa ja maakunta samassa valikossa. Ilman JavaScriptiä lomake lähettää
            `alue=`, jonka palvelin lukee; JavaScriptillä vaihtoehdon `data-nimi`
            antaa suoraan `maa=`/`maakunta=` (HakuNakyma). Alueen vaihto
            tyhjentää kaupungin.
          */}
          <select
            form={FORM_ID}
            id="suodatin-alue"
            name="alue"
            defaultValue={alueValue}
            data-arvo={alueValue}
            data-tyhjentaa="suodatin-kaupunki"
            className={fieldClass}
          >
            <option value="">Kaikki alueet</option>
            {active.maa && !tunnettuMaa && <option value={active.maa} data-nimi="maa">{active.maa} (ei ravintoloita)</option>}
            {suomi && (
              <optgroup label={SUOMI}>
                <option value={SUOMI_SLUG} data-nimi="maa">Koko Suomi ({suomi.count})</option>
                {active.maakunta.length > 1 && (
                  <option value={alueValue} data-nimi="maakunta">{active.maakunta.map((m) => maakuntaTitle(m) ?? m).join(" + ")}</option>
                )}
                {facets.maakunnat.map((m) => (
                  <option key={m.value} value={m.value} data-nimi="maakunta">
                    {m.title} ({m.count})
                  </option>
                ))}
              </optgroup>
            )}
            {ulkomaat.length > 0 && (
              <optgroup label="Ulkomaat">
                {ulkomaat.map((c) => (
                  <option key={c.slug} value={c.slug} data-nimi="maa">
                    {c.name} ({c.count})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="suodatin-kaupunki" className={labelClass}>
            Kaupunki
          </label>
          <select
            form={FORM_ID}
            id="suodatin-kaupunki"
            name="kaupunki"
            defaultValue={active.kaupunki ?? ""}
            data-arvo={active.kaupunki ?? ""}
            className={fieldClass}
          >
            <option value="">{alueRajattu ? "Kaikki alueen kaupungit" : "Kaikki kaupungit"}</option>
            {ryhmat.map((ryhma) => {
              const vaihtoehdot = ryhma.kaupungit.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                  {city.count > 0 ? ` (${city.count})` : ""}
                </option>
              ));
              return ryhma.maa ? (
                <optgroup key={ryhma.maa} label={ryhma.maa}>
                  {vaihtoehdot}
                </optgroup>
              ) : (
                vaihtoehdot
              );
            })}
          </select>
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className={cn(labelClass, "mb-1.5")}>Arvosana vähintään</legend>
          <div className="flex flex-wrap gap-2">
            {[null, ...arvosanat].map((value) => (
              <label
                key={value ?? "kaikki"}
                className={cn(
                  chipBase,
                  "cursor-pointer px-3.5 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-on-primary",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                  "border-border bg-background text-foreground hover:border-accent",
                )}
              >
                <input
                  form={FORM_ID}
                  type="radio"
                  name="arvosana"
                  value={value === null ? "" : String(value)}
                  defaultChecked={active.arvosana === value}
                  className="sr-only"
                />
                {value === null ? "Kaikki" : formatRating(value)}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <label
          htmlFor="suodatin-lopettaneet"
          className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-foreground"
        >
          <input
            form={FORM_ID}
            id="suodatin-lopettaneet"
            name="lopettaneet"
            type="checkbox"
            value="1"
            defaultChecked={active.lopettaneet}
            className="size-5 shrink-0 rounded border-border-input text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <span>
            Näytä myös lopettaneet ravintolat
            {facets.closedCount > 0 ? ` (${facets.closedCount})` : ""}
          </span>
        </label>
        {/* JavaScriptillä valinta päivittää tulokset heti; ilman sitä tarvitaan painike. */}
        <noscript>
          <button
            type="submit"
            form={FORM_ID}
            className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-on-primary shadow-sm transition hover:bg-primary-hover hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Näytä tulokset
          </button>
        </noscript>
      </div>
    </div>
  );
}

function ActiveFilterChips({
  active,
  facets,
}: {
  active: RavintolaFilterValues;
  facets: RavintolatFacetData;
}) {
  const cityName =
    facets.cities.find((c) => c.slug === active.kaupunki)?.name ??
    active.kaupunki;
  const countryName =
    facets.countries.find((c) => c.slug === active.maa)?.name ?? active.maa;

  const chips: { key: string; label: string; href: string }[] = [];
  if (active.q) {
    chips.push({
      key: "q",
      label: `“${active.q}”`,
      href: buildRavintolaHref(active, { q: "", sivu: 1 }),
    });
  }
  if (active.maa) {
    chips.push({
      key: "maa",
      label: countryName ?? active.maa,
      href: buildRavintolaHref(active, { maa: null, sivu: 1 }),
    });
  }
  for (const value of active.maakunta) {
    chips.push({
      key: `maakunta-${value}`,
      label: maakuntaTitle(value) ?? value,
      href: buildRavintolaHref(active, {
        maakunta: active.maakunta.filter((m) => m !== value),
        sivu: 1,
      }),
    });
  }
  if (active.kaupunki) {
    chips.push({
      key: "kaupunki",
      label: cityName ?? active.kaupunki,
      href: buildRavintolaHref(active, { kaupunki: null, sivu: 1 }),
    });
  }
  if (active.arvosana) {
    chips.push({
      key: "arvosana",
      label: `Arvosana ${formatRating(active.arvosana)}+`,
      href: buildRavintolaHref(active, { arvosana: null, sivu: 1 }),
    });
  }
  if (active.lopettaneet) {
    chips.push({
      key: "lopettaneet",
      label: "Lopettaneet mukana",
      href: buildRavintolaHref(active, { lopettaneet: false, sivu: 1 }),
    });
  }

  const chipClass = cn(
    "inline-flex min-h-11 items-center gap-2 rounded-sm border border-border",
    "bg-background px-4 text-sm text-foreground transition hover:border-accent hover:text-accent",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  );

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Voimassa olevat rajaukset">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Link href={chip.href} className={chipClass}>
            {chip.label}
            <span aria-hidden>×</span>
            <span className="sr-only">— poista rajaus</span>
          </Link>
        </li>
      ))}
      {chips.length > 1 && (
        <li>
          <Link
            href={buildRavintolaHref(RAVINTOLA_DEFAULT_FILTERS, { jarjesta: active.jarjesta })}
            className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-accent underline decoration-1 underline-offset-[4px] hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Tyhjennä kaikki
          </Link>
        </li>
      )}
    </ul>
  );
}
