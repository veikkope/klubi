import type { InitialValueResolverContext, Template } from "sanity";

import {
  POHJAN_KATEGORIAT,
  kategoriatSlugeilla,
  klubiArvioPohja,
  palloveikkausKausiPohja,
  palloveikkausTilannePohja,
  tamaVuosi,
  vuosikokousPohja,
  type KategoriaRivi,
} from "../lib/pohjat";
import { osioSivu, osioSivuSiemen } from "../lib/osiosivut";
import { TILASTO_KATEGORIAT, tilastoKategoria, tilastoPohjanId } from "../lib/tilasto-kategoriat";
import { apiVersion } from "./env";
import { singletonTypes } from "./schemas";

/**
 * Studion mallipohjat (docs/24 §2.7). Yksi paikka: askel 3 lisäsi osion sivun
 * pohjan, askel 10 valmiit pohjat.
 *
 * - Singletoneja, varmuuskopioita ja sivuston tilaa ei luoda käsin (ajastus tekee ne).
 * - `lukittu-sivu`: osion sivu (lib/osiosivut.ts), jota ei vielä ole
 *   datasetissä. Studion rakenne avaa sen kiinteällä tunnuksella, ja pohja
 *   täyttää lomakkeen koodin oletusteksteillä (sama kuin `luo:osiosivut`).
 * - Uutisten pohjat (Luo-valikko → Uutinen): vuosikokouskutsu, palloveikkauksen
 *   tilanne ja uusi kausi. Arvot ja [täytä: …] -sääntö: lib/pohjat.ts.
 *   Kenttien omat oletukset (esim. kommentoinnin lomakkeen tyyppi) säilyvät:
 *   Sanity yhdistää pohjan arvot niiden päälle.
 * - `klubiArvio-ravintolalle`: ravintolan + kohdassa Ravintolat → Klubilaisten
 *   arvosanat → Ravintoloittain (ravintola ja tämä päivä valmiina).
 * - `jalkapalloTilasto-kategoria`: tilastoryhmän + kohdassa Jalkapalloarkisto →
 *   Tilastot → ryhmä (kategoria valmiina, docs/24 askel 11).
 */

/** Ajastettujen tehtävien kirjoittamat tyypit: ei pohjaa (docs/24 §2.7). */
const AJASTUKSEN_TYYPIT: ReadonlySet<string> = new Set(["varmuuskopio", "sivustonTila"]);

/**
 * Tilastoryhmän + -painikkeen pohja jokaiselle kategorialle (`tilasto-<kategoria>`).
 * Sanity käyttää listan kohdan tunnusta pohjan tunnuksena, joten parametrillinen
 * pohja ei riitä, kun samassa ryhmässä on useita kategorioita: `.id()` antoi
 * virheen "template not found" ja kaatoi Studion (8.10.2026).
 */
const tilastoPohjat: Template[] = TILASTO_KATEGORIAT.map(({ value, title }) => ({
  id: tilastoPohjanId(value),
  title,
  schemaType: "jalkapalloTilasto",
  value: { category: value },
}));

/** Pohjat, jotka tarvitsevat parametrin tai kuuluvat yhteen listaan: ne eivät näy Luo-valikossa. */
export const PIILOTETUT_POHJAT: ReadonlySet<string> = new Set([
  "lukittu-sivu",
  "klubiArvio-ravintolalle",
  "jalkapalloTilasto-kategoria",
  ...TILASTO_KATEGORIAT.map(({ value }) => tilastoPohjanId(value)),
]);

const lukittuSivu: Template<{ slug: string }> = {
  id: "lukittu-sivu",
  title: "Osion sivu",
  schemaType: "sivu",
  parameters: [{ name: "slug", type: "string" }],
  value: ({ slug }: { slug: string }) => {
    const o = osioSivu(slug);
    if (!o) return { slug: { _type: "slug", current: slug } };
    // Tunnus ja tyyppi tulevat Studiolta; loput samat kuin skriptin siemenessä.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _type, ...arvot } = osioSivuSiemen(o);
    return arvot;
  },
};

/** Pohjan kategoriat: julkaistut, nykyinen slug tai aiempi polku ($slugit). */
export const KATEGORIAT_KYSELY = /* groq */ `*[_type == "uutisKategoria" && !(_id in path("drafts.**"))
  && (slug.current in $slugit || count(aiemmatPolut[@ in $slugit]) > 0)]{ _id, "slug": slug.current, aiemmatPolut }`;

/**
 * Kategorioiden tunnukset slugeilla (julkaistut; myös aiempi polku kelpaa).
 * Haun virhe (esim. verkkokatko) ei estä pohjaa: kategoria valitaan silloin itse.
 */
async function kategoriat(context: InitialValueResolverContext, slugit: readonly string[]): Promise<string[]> {
  try {
    const rivit = await context
      .getClient({ apiVersion })
      .fetch<KategoriaRivi[]>(KATEGORIAT_KYSELY, { slugit: [...slugit] });
    return kategoriatSlugeilla(rivit ?? [], slugit);
  } catch {
    return [];
  }
}

/** Onko ravintola julkaistu (julkaistu tunnus ilman drafts.-etuliitettä). */
export const RAVINTOLA_JULKAISTU_KYSELY = /* groq */ `count(*[_id == $id]) > 0`;

const vuosikokous: Template = {
  id: "uutinen-vuosikokous",
  title: "Vuosikokouskutsu",
  description: "Uutinen valmiilla kutsutekstillä. Täytä hakasulkeissa olevat kohdat.",
  schemaType: "uutinen",
  value: async (_params: unknown, context: InitialValueResolverContext) => {
    const nyt = new Date();
    const [tapahtumat] = await kategoriat(context, POHJAN_KATEGORIAT.vuosikokous);
    return vuosikokousPohja(tamaVuosi(nyt), tapahtumat ?? null, nyt);
  },
};

const palloveikkausTilanne: Template = {
  id: "uutinen-palloveikkaus-tilanne",
  title: "Palloveikkauksen tilanne",
  description: "Kierroksen jälkeinen tilanne. Täytä hakasulkeissa olevat kohdat.",
  schemaType: "uutinen",
  value: async (_params: unknown, context: InitialValueResolverContext) => {
    const nyt = new Date();
    return palloveikkausTilannePohja(tamaVuosi(nyt), await kategoriat(context, POHJAN_KATEGORIAT.palloveikkaus), nyt);
  },
};

const palloveikkausKausi: Template = {
  id: "uutinen-palloveikkaus-kausi",
  title: "Palloveikkaus: uusi kausi",
  description: "Veikkaus päällä (sarjajärjestys). Lisää joukkueet ja sulkeutumisaika.",
  schemaType: "uutinen",
  value: async (_params: unknown, context: InitialValueResolverContext) => {
    const nyt = new Date();
    return palloveikkausKausiPohja(tamaVuosi(nyt), await kategoriat(context, POHJAN_KATEGORIAT.palloveikkaus), nyt);
  },
};

const klubiArvioRavintolalle: Template<{ ravintolaId: string }> = {
  id: "klubiArvio-ravintolalle",
  title: "Klubilaisen arvosana tälle ravintolalle",
  schemaType: "klubiArvio",
  parameters: [{ name: "ravintolaId", type: "string" }],
  value: async ({ ravintolaId }: { ravintolaId: string }, context: InitialValueResolverContext) => {
    const id = ravintolaId.replace(/^drafts\./, "");
    // Luonnosravintolaan viitataan kuten Sanityn oma viittauskenttä tekee:
    // heikko viittaus, joka vahvistuu julkaisussa. Virheessä samoin (toimii molemmissa).
    let julkaistu = false;
    try {
      julkaistu = await context
        .getClient({ apiVersion })
        .fetch<boolean>(RAVINTOLA_JULKAISTU_KYSELY, { id }, { perspective: "published" });
    } catch {
      julkaistu = false;
    }
    return klubiArvioPohja(id, new Date(), julkaistu === true);
  },
};

/** Tilasto valmiilla kategorialla; tuntematon kategoria jätetään valitsematta. */
const tilastoKategoriaan: Template<{ category: string }> = {
  id: "jalkapalloTilasto-kategoria",
  title: "Tilasto tähän ryhmään",
  schemaType: "jalkapalloTilasto",
  parameters: [{ name: "category", type: "string" }],
  value: ({ category }: { category: string }) => (tilastoKategoria(category) ? { category } : {}),
};

export function pohjat(prev: Template[]): Template[] {
  return [
    ...prev.filter(({ schemaType }) => !singletonTypes.has(schemaType) && !AJASTUKSEN_TYYPIT.has(schemaType)),
    lukittuSivu as Template,
    vuosikokous,
    palloveikkausTilanne,
    palloveikkausKausi,
    klubiArvioRavintolalle as Template,
    tilastoKategoriaan as Template,
    ...tilastoPohjat,
  ];
}
