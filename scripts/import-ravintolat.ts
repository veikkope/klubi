/**
 * Muuntaa jäsennetyt ravintolat Sanity-tuontitiedostoksi.
 *
 * Ajo:    `npm run import:ravintolat`
 * Lähde:  data/normalized/ravintolat.json   (`npm run parse:ravintolat`)
 * Tulos:  data/migration-ravintolat.ndjson
 *
 * Tuonti Sanityyn:
 *   npx sanity dataset import data/migration-ravintolat.ndjson development --replace
 *
 * Tämä on se ohut CMS-kohtainen adapteri, jonka takia parseri tuottaa
 * neutraalia JSONia: jos CMS vaihtuu, vain tämä tiedosto kirjoitetaan uusiksi.
 *
 * `_id` on deterministinen (`ravintola-<slug>`), joten `--replace` on
 * turvallinen — sama ajo tuottaa samat dokumentit eikä duplikaatteja.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { Ravintola } from "./parse-ravintolat";
import type { KuvaRecord } from "./download-images";
import { localImageName } from "./lib/image-names";
import { bestOwner } from "./lib/match-image-owner";

const SOURCE = join(process.cwd(), "data", "normalized", "ravintolat.json");
const OUT = join(process.cwd(), "data", "migration-ravintolat.ndjson");
const IMAGE_MAP = join(process.cwd(), "data", "normalized", "ravintola-kuvat.json");
const IMAGE_INVENTORY = join(process.cwd(), "data", "normalized", "kuvat.json");

/**
 * Maanimien normalisointi. Avain on slugifioitu segmentti vanhalta sivulta,
 * arvo virallinen suomenkielinen maannimi.
 */
const COUNTRIES: Record<string, string> = {
  venaja: "Venäjä",
  ruotsi: "Ruotsi",
  saksa: "Saksa",
  kreikka: "Kreikka",
  portugali: "Portugali",
  espanja: "Espanja",
  belgia: "Belgia",
  hollanti: "Alankomaat",
  irlanti: "Irlanti",
  islanti: "Islanti",
  italia: "Italia",
  kroatia: "Kroatia",
  puola: "Puola",
  ranska: "Ranska",
  latvia: "Latvia",
  slovakia: "Slovakia",
  slovenia: "Slovenia",
  sveitsi: "Sveitsi",
  viro: "Viro",
  tanska: "Tanska",
  tshekki: "Tšekki",
  turkki: "Turkki",
};

/**
 * Ulkomaiset kaupungit, jotka esiintyvät vanhalla sivulla ilman maata.
 * Erillään `COUNTRIES`-taulukosta, koska muuten esim. Lontoo tulkittaisiin
 * maaksi eikä kaupungiksi.
 */
const CITY_COUNTRIES: Record<string, string> = {
  lontoo: "Iso-Britannia",
  riika: "Latvia",
  ventspils: "Latvia",
  tallinna: "Viro",
  tarto: "Viro",
  madrid: "Espanja",
  praha: "Tšekki",
  varsova: "Puola",
  zagreb: "Kroatia",
  zurich: "Sveitsi",
  istanbul: "Turkki",
  dublin: "Irlanti",
  reykjavik: "Islanti",
  milano: "Italia",
  bratislava: "Slovakia",
  ljubljana: "Slovenia",
  koopenhamina: "Tanska",
  "den-haag": "Alankomaat",
};

/**
 * Vanhan sivuston aluenimissä on kirjoitusvirheitä ja parserin
 * normalisoinnissa kadonneita ääkkösiä. Korjataan ne nimetysti sen sijaan
 * että yritettäisiin arvata sääntöä.
 */
const AREA_NAME_FIXES: Record<string, string> = {
  Venaja: "Venäjä",
  Kokkkola: "Kokkola",
  "Savonlinna Ja Rantasalmi": "Savonlinna ja Rantasalmi",
  "Varsinais-suomi": "Varsinais-Suomi",
  "Kotka / Pyhtää / Kouvola": "Kotka",
  Lappi: "Lappi",
  Uusimaa: "Uusimaa",
  Pirkanmaa: "Pirkanmaa",
};

/** Suomalainen slug: ä→a, ö→o, pienet kirjaimet, väliviivat. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/ö/g, "o")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** "23.12.2003" → "2003-12-23". Palauttaa null jos päivä ei ole kelvollinen. */
function toIsoDate(finnish: string | null): string | null {
  if (!finnish) return null;
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(finnish.trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  // Torjutaan esim. 31.02. joka "valuisi" maaliskuun puolelle.
  if (date.getUTCDate() !== Number(dd) || date.getUTCMonth() + 1 !== Number(mm)) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

function formatRating(value: number | null): string | null {
  return value === null ? null : value.toFixed(1).replace(".", ",");
}

/**
 * Tiivistelmä koostetaan mitatuista faktoista, ei keksitä.
 *
 * Tämä on sivun ensimmäinen kappale ja se teksti, jonka hakukone
 * todennäköisimmin lainaa (docs/11 §7.2). Siksi se kertoo arvosanan,
 * sijainnin ja käyntimäärän — ne ovat kysymykset joihin ihminen haluaa
 * vastauksen ennen kuin lukee pidemmälle.
 */
function buildTiivistelma(r: Ravintola, cityName: string): string {
  const parts: string[] = [];

  const overall = formatRating(r.ratingOverall);
  if (overall) {
    const sub = [
      r.ratingFood !== null ? `ruoka ${formatRating(r.ratingFood)}` : null,
      r.ratingPrice !== null ? `hinta ${formatRating(r.ratingPrice)}` : null,
      r.ratingAtmosphere !== null
        ? `viihtyvyys ${formatRating(r.ratingAtmosphere)}`
        : null,
    ].filter(Boolean);
    parts.push(
      `Klubin arvio ${overall}/5${sub.length ? ` (${sub.join(", ")})` : ""}.`,
    );
  }

  const where = [r.address, cityName].filter(Boolean).join(", ");
  if (where) parts.push(`${r.name} sijaitsee osoitteessa ${where}.`);

  const visitCount = r.visits.length + (r.firstVisit ? 1 : 0);
  const firstYear = r.firstVisit?.slice(-4);
  if (visitCount > 1 && firstYear) {
    parts.push(`Klubi on vieraillut ${visitCount} kertaa vuodesta ${firstYear}.`);
  } else if (firstYear) {
    parts.push(`Klubi vieraili vuonna ${firstYear}.`);
  }

  if (r.closed) parts.push("Ravintolan toiminta on sittemmin loppunut.");

  return parts.join(" ").slice(0, 300);
}

interface CityDoc {
  _id: string;
  _type: "kaupunki";
  name: string;
  slug: { _type: "slug"; current: string };
  country: string;
}

/**
 * Päättelee kaupungin ja maan vanhan sivuston aluenimestä.
 *
 * Aluenimi on kolmea muotoa:
 *   "Lahti"                   kotimainen kaupunki
 *   "Viro / Tallinna"         maa ensin, kaupunki viimeisenä
 *   "Kreikka"                 pelkkä maa, kaupunkia ei tiedetä
 *
 * Kolmas tapaus on se, jossa aiempi logiikka meni pieleen: nimi ja maa ovat
 * sama merkkijono, jolloin maaksi päätyi virheellisesti "Suomi".
 */
function cityFor(area: string, cities: Map<string, CityDoc>): CityDoc {
  const fixed = AREA_NAME_FIXES[area] ?? area;
  const segments = fixed.split("/").map((s) => s.trim()).filter(Boolean);

  let name: string;
  let country: string;

  if (segments.length > 1) {
    // "Viro / Tallinna" — ensimmäinen on maa, viimeinen kaupunki
    const first = slugify(segments[0]);
    name = segments[segments.length - 1];
    country = COUNTRIES[first] ?? CITY_COUNTRIES[slugify(name)] ?? segments[0];
  } else {
    const only = AREA_NAME_FIXES[segments[0] ?? ""] ?? segments[0] ?? "Tuntematon";
    const slug = slugify(only);
    const cityCountry = CITY_COUNTRIES[slug];
    const knownCountry = COUNTRIES[slug];

    if (cityCountry) {
      // Ulkomainen kaupunki ilman maata, esim. "Lontoo".
      name = only;
      country = cityCountry;
    } else if (knownCountry) {
      // Pelkkä maa: vanha sivu ryhmitteli maan mukaan, kaupunkia ei tiedetä.
      name = knownCountry;
      country = knownCountry;
    } else {
      name = only;
      country = "Suomi";
    }
  }

  const slug = slugify(name);
  const existing = cities.get(slug);
  if (existing) return existing;

  const doc: CityDoc = {
    _id: `kaupunki-${slug}`,
    _type: "kaupunki",
    name,
    slug: { _type: "slug", current: slug },
    country,
  };
  cities.set(slug, doc);
  return doc;
}

interface ImageLink {
  docId: string;
  name: string;
  city: string;
  images: string[];
}

/**
 * Liittää kuvat ravintoloihin tiedostonimen perusteella, ei jäsennysjärjestyksen.
 *
 * Jäsennin liittää kuvan siihen ravintolaan, joka oli käsittelyssä kun kuva
 * kohdattiin. Sivuilla joilla kuvat on koottu listan loppuun se tarkoittaa,
 * että kaikki kasautuvat viimeiselle ravintolalle — mitattuna 175 liitosta
 * 477:stä oli väärin.
 *
 * Ehdokkaat rajataan saman lähdesivun ravintoloihin, jolloin esim. Lahden
 * Hesburger ei voi kaapata Helsingin Hesburgerin kuvaa. Jos nimi ei osu
 * yhteenkään, kuva jätetään liittämättä: väärä kuva on pahempi kuin ei kuvaa.
 */
async function linkImages(
  source: Ravintola[],
  cities: Map<string, CityDoc>,
  docIds: Map<Ravintola, string>,
): Promise<{ imageLinks: ImageLink[]; unmatched: number }> {
  const inventory = JSON.parse(
    await readFile(IMAGE_INVENTORY, "utf-8"),
  ) as KuvaRecord[];

  // Sivu → sillä esiintyvät kuvat (vain onnistuneesti ladatut).
  const imagesByPage = new Map<string, string[]>();
  for (const record of inventory) {
    if (!record.ok) continue;
    for (const page of record.pages) {
      const list = imagesByPage.get(page) ?? [];
      list.push(record.src);
      imagesByPage.set(page, list);
    }
  }

  // Sivu → sillä esiintyvät ravintolat.
  const restaurantsByPage = new Map<string, Ravintola[]>();
  for (const r of source) {
    const list = restaurantsByPage.get(r.sourcePage) ?? [];
    list.push(r);
    restaurantsByPage.set(r.sourcePage, list);
  }

  const byDocId = new Map<string, ImageLink>();
  const seen = new Set<string>();
  let unmatched = 0;

  for (const [page, images] of imagesByPage) {
    const candidates = restaurantsByPage.get(page);
    if (!candidates || candidates.length === 0) continue;

    const options = candidates
      .map((r) => ({ key: docIds.get(r) ?? "", name: r.name, restaurant: r }))
      .filter((o) => o.key);

    for (const src of images) {
      const dedupeKey = `${page}|${localImageName(src)}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const owner = bestOwner(localImageName(src), options);
      if (!owner) {
        unmatched += 1;
        continue;
      }

      const restaurant = options.find((o) => o.key === owner.key)!.restaurant;
      const existing = byDocId.get(owner.key);
      if (existing) {
        if (!existing.images.includes(src)) existing.images.push(src);
      } else {
        byDocId.set(owner.key, {
          docId: owner.key,
          name: restaurant.name,
          city: cityFor(restaurant.area, cities).name,
          images: [src],
        });
      }
    }
  }

  return { imageLinks: [...byDocId.values()], unmatched };
}

async function main() {
  const source = JSON.parse(await readFile(SOURCE, "utf-8")) as Ravintola[];

  const cities = new Map<string, CityDoc>();
  const usedSlugs = new Set<string>();
  const lines: string[] = [];
  /**
   * Kuvaliitokset kirjoitetaan erikseen, koska kuvat viedään Sanityyn omana
   * vaiheenaan (`npm run import:kuvat`). Slug lasketaan vain täällä, joten
   * dokumentti-id:n on tultava samasta paikasta — muuten liitos osuisi väärin.
   */
  const docIds = new Map<Ravintola, string>();
  let skipped = 0;

  const restaurants = source.map((r) => {
    const city = cityFor(r.area, cities);

    // Sama nimi toistuu eri kaupungeissa (Hesburger, McDonald's).
    let slug = slugify(r.name);
    if (!slug) slug = `ravintola-${r.index}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${city.slug.current}`;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${slugify(r.name)}-${city.slug.current}-${suffix}`;
      suffix += 1;
    }
    usedSlugs.add(slug);
    docIds.set(r, `ravintola-${slug}`);

    const visits = [r.firstVisit, ...r.visits]
      .map(toIsoDate)
      .filter((d): d is string => d !== null);
    const uniqueVisits = [...new Set(visits)].sort().reverse();

    return {
      _id: `ravintola-${slug}`,
      _type: "ravintola" as const,
      name: r.name,
      slug: { _type: "slug" as const, current: slug },
      tiivistelma: buildTiivistelma(r, city.name),
      city: { _type: "reference" as const, _ref: city._id },
      address: r.address ?? undefined,
      postalCode: r.postalCode ?? undefined,
      phone: r.phone ?? undefined,
      stars: r.starsGlyph ?? undefined,
      ratingOverall: r.ratingOverall ?? undefined,
      ratingFood: r.ratingFood ?? undefined,
      ratingPrice: r.ratingPrice ?? undefined,
      ratingAtmosphere: r.ratingAtmosphere ?? undefined,
      pros: r.pros.length ? r.pros : undefined,
      cons: r.cons.length ? r.cons : undefined,
      visitedAt: toIsoDate(r.firstVisit) ?? undefined,
      visits: uniqueVisits.length ? uniqueVisits : undefined,
      visitContext: r.visitContext ?? undefined,
      closed: r.closed,
      closedNote: r.closedNote ?? undefined,
      needsReview: r.needsReview,
      legacyUrl: `/${r.sourcePage}`,
    };
  });

  for (const city of cities.values()) lines.push(JSON.stringify(city));
  for (const restaurant of restaurants) {
    if (!restaurant.name) {
      skipped += 1;
      continue;
    }
    lines.push(JSON.stringify(restaurant));
  }

  const { imageLinks, unmatched } = await linkImages(source, cities, docIds);

  await writeFile(OUT, `${lines.join("\n")}\n`, "utf-8");
  await writeFile(IMAGE_MAP, JSON.stringify(imageLinks, null, 2), "utf-8");

  const withRating = restaurants.filter((r) => r.ratingOverall !== undefined);
  const withVisits = restaurants.filter((r) => r.visits !== undefined);

  console.log(`
Kaupunkeja .............. ${cities.size}
Ravintoloita ............ ${restaurants.length}
  arvosana .............. ${withRating.length}
  käyntihistoria ........ ${withVisits.length}
  lopettaneita .......... ${restaurants.filter((r) => r.closed).length}
  tarkistettavia ........ ${restaurants.filter((r) => r.needsReview).length}
Ohitettu (ei nimeä) ..... ${skipped}
Dokumentteja yhteensä ... ${lines.length}
Kuvaliitoksia ........... ${imageLinks.length} ravintolaa, ${imageLinks.reduce((n, l) => n + l.images.length, 0)} kuvaa
  liittämättä jääneitä .. ${unmatched} (nimi ei tunnistettavissa tiedostonimestä)

Kirjoitettu: ${OUT}
             ${IMAGE_MAP}

Tuonti:
  npx sanity dataset import ${OUT} development --replace`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
