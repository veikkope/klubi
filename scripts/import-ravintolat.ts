/**
 * Muuntaa jäsennetyt ravintolat Sanity-tuontitiedostoksi.
 *
 * Ajo:    `npm run import:ravintolat` (osana `npm run migrate:ravintolat`)
 * Lähde:  data/normalized/ravintolat.json   (`npm run parse:ravintolat`)
 *         data/normalized/kuvat.json        (`npm run images`)
 * Tulos:  data/migration-ravintolat.ndjson
 *         data/normalized/ravintola-kuvat.json          (docId → kuvat, import-kuvat.ts lukee)
 *         data/normalized/ravintola-kuvat-dropped.json  (liittämättä jääneet perusteluineen)
 *         data/normalized/ravintola-kaupungit.json      (vanha sivu → kaupungit, redirect-integraatiota varten)
 *
 * Tuonti Sanityyn: `npx tsx scripts/sanity-import.ts data/migration-ravintolat.ndjson`
 *
 * Tämä on se ohut CMS-kohtainen adapteri, jonka takia parseri tuottaa
 * neutraalia JSONia: jos CMS vaihtuu, vain tämä tiedosto kirjoitetaan uusiksi.
 *
 * `_id` on deterministinen (`ravintola-<slug>`), joten `--replace` on
 * turvallinen — sama ajo tuottaa samat dokumentit eikä duplikaatteja.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { Ravintola } from "./parse-ravintolat";
import type { KuvaRecord } from "./download-images";
import { localImageName } from "./lib/image-names";
import { fileDates, rankOwners } from "./lib/match-image-owner";
import { decodeEntities } from "./lib/decode-html";
import { maakuntaFor } from "./lib/maakunnat";
import { slugify as sharedSlugify } from "../lib/slugify";
import { SUOMI, type MaakuntaValue } from "../lib/maakunnat";

const SOURCE = join(process.cwd(), "data", "normalized", "ravintolat.json");
const OUT = join(process.cwd(), "data", "migration-ravintolat.ndjson");
const IMAGE_MAP = join(process.cwd(), "data", "normalized", "ravintola-kuvat.json");
const IMAGE_DROPPED = join(process.cwd(), "data", "normalized", "ravintola-kuvat-dropped.json");
const CITY_REPORT = join(process.cwd(), "data", "normalized", "ravintola-kaupungit.json");
const IMAGE_INVENTORY = join(process.cwd(), "data", "normalized", "kuvat.json");
const PARSE_REPORT = join(process.cwd(), "data", "normalized", "ravintola-report.json");

/** Ravintolasivut, joiden kuvat kuuluvat tämän putken vastuulle. */
const RESTAURANT_PAGE = /^ruokailu.*\.htm$/i;
/** Koostesivut: kuvat ovat ravintolakuvien kopioita, omistaja haetaan kaikista ravintoloista. */
const INDEX_PAGES = new Set(["ruokailu.htm", "ruokailutop5.htm"]);

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
 * Vanhan sivuston aluenimissä on kirjoitusvirheitä ja parserin
 * normalisoinnissa kadonneita ääkkösiä. Korjataan ne nimetysti sen sijaan
 * että yritettäisiin arvata sääntöä.
 */
const AREA_NAME_FIXES: Record<string, string> = {
  Venaja: "Venäjä",
  Kokkkola: "Kokkola",
  "Savonlinna Ja Rantasalmi": "Savonlinna ja Rantasalmi",
  "Varsinais-suomi": "Varsinais-Suomi",
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

/**
 * Kaupungin slug: yhteinen `lib/slugify.ts` (myös muut tarkkeet puretaan,
 * München → munchen). Sama apuri johtaa hakemiston `?maa=`-slugit maan nimestä.
 */
const citySlug = sharedSlugify;

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

function fold(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/ö/g, "o")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Kaikki käynnit ISO-muodossa, uusin ensin, ilman toistoja. */
function allVisits(r: Ravintola): string[] {
  const visits = [r.firstVisit, ...r.visits]
    .map(toIsoDate)
    .filter((d): d is string => d !== null);
  return [...new Set(visits)].sort().reverse();
}

/**
 * Tiivistelmä koostetaan mitatuista faktoista, ei keksitä.
 *
 * Tämä on sivun ensimmäinen kappale ja se teksti, jonka hakukone
 * todennäköisimmin lainaa (docs/11 §7.2). Siksi se kertoo arvosanan,
 * sijainnin ja käyntimäärän — ne ovat kysymykset joihin ihminen haluaa
 * vastauksen ennen kuin lukee pidemmälle.
 *
 * Kaupunkia ei toisteta, jos se on jo osoitteessa ("Mariankatu 8 Lahti"),
 * eikä alueviitettä (maa tai maakunta) esitetä kaupunkina.
 */
function buildTiivistelma(r: Ravintola, cityName: string | null): string {
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

  const address = r.address?.trim() || null;
  const cityInAddress =
    address && cityName ? ` ${fold(address)} `.includes(` ${fold(cityName)} `) : false;
  if (address) {
    const where = cityName && !cityInAddress ? `${address}, ${cityName}` : address;
    parts.push(`${r.name} sijaitsee osoitteessa ${where}.`);
  } else if (cityName) {
    parts.push(`${r.name} sijaitsee kaupungissa ${cityName}.`);
  }

  const visits = allVisits(r);
  const years = visits.map((v) => v.slice(0, 4));
  const firstYear = years.at(-1);
  const lastYear = years[0];
  if (visits.length > 1 && firstYear) {
    const span = lastYear && lastYear !== firstYear ? `vuosina ${firstYear}–${lastYear}` : `vuonna ${firstYear}`;
    parts.push(`Klubi on vieraillut ravintolassa ${visits.length} kertaa ${span}.`);
  } else if (firstYear) {
    parts.push(`Klubi vieraili ravintolassa vuonna ${firstYear}.`);
  }

  if (r.closed) parts.push("Ravintolan toiminta on sittemmin loppunut.");

  // Katkaistaan kokonaiseen virkkeeseen, ei kesken sanan.
  let out = "";
  for (const part of parts) {
    const next = out ? `${out} ${part}` : part;
    if (next.length > 300) break;
    out = next;
  }
  return out;
}

interface CityDoc {
  _id: string;
  _type: "kaupunki";
  name: string;
  slug: { _type: "slug"; current: string };
  country: string;
  /** Vain Suomessa: maakunta `scripts/lib/maakunnat.ts`:n kunta- ja taajamataulukosta. */
  maakunta?: MaakuntaValue;
}

/**
 * Viite, kun kaupunki ei selviä lähteestä: sivun alue (maa tai maakunta).
 * Parseri on merkinnyt ravintolan tarkistettavaksi.
 */
function areaDoc(area: string, parsedCountry: string | null): { name: string; country: string } {
  const fixed = AREA_NAME_FIXES[area] ?? area;
  const segments = fixed.split("/").map((s) => s.trim()).filter(Boolean);
  if (segments.length > 1) {
    const country = COUNTRIES[slugify(segments[0])] ?? segments[0];
    return { name: segments[segments.length - 1], country };
  }
  const only = segments[0] ?? "Tuntematon";
  const country = COUNTRIES[slugify(only)];
  // Parserin maa ensin: esim. alue "Lontoo" on Iso-Britanniassa, ei Suomessa.
  return country ? { name: country, country } : { name: only, country: parsedCountry ?? SUOMI };
}

/**
 * Kaupunkidokumentti. Maa- tai aluetason viite (kaupunki ei selviä lähteestä,
 * esim. "Portugali", "Ruotsi", "Venäjä") saa nimekseen maan nimen: hakemiston
 * kaupunkisuodatin jättää pois dokumentit, joiden nimi on sama kuin maa
 * (`sanity/lib/queries/ravintolat.ts`), mutta ravintola löytyy maasuodattimella.
 *
 * Suomalaiselle kaupungille maakunta taulukosta; tuntematon paikkakunta kaataa ajon.
 */
function cityFor(r: Ravintola, cities: Map<string, CityDoc>): { doc: CityDoc; isArea: boolean } {
  const { name, country } = r.city ? { name: r.city, country: r.country } : areaDoc(r.area, r.country);
  const slug = citySlug(name);
  let doc = cities.get(slug);
  if (!doc) {
    doc = {
      _id: `kaupunki-${slug}`,
      _type: "kaupunki",
      name,
      slug: { _type: "slug", current: slug },
      country,
      ...(country === SUOMI && name !== SUOMI ? { maakunta: maakuntaFor(name) } : {}),
    };
    cities.set(slug, doc);
  } else if (doc.country !== country) {
    throw new Error(
      `Kaupunki ${slug}: ristiriitainen maa (${doc.country} / ${country}, ravintola "${r.name}" sivulla ${r.sourcePage})`,
    );
  }
  return { doc, isArea: !r.city };
}

function key(...parts: string[]): string {
  return createHash("sha1").update(parts.join("|")).digest("hex").slice(0, 12);
}

/** Lähteen vapaa teksti → Portable Text -kappaleet. `_key`-etuliite `rv-` erottaa ne patch-ravintola-arviot.ts:n lohkoista. */
function reviewBlocks(docId: string, notes: string[]) {
  return notes.map((text, i) => ({
    _type: "block" as const,
    _key: `rv-${key(docId, "review", String(i))}`,
    style: "normal" as const,
    markDefs: [],
    children: [
      { _type: "span" as const, _key: `rs-${key(docId, "review", String(i), "span")}`, text, marks: [] },
    ],
  }));
}

interface ImageLink {
  docId: string;
  name: string;
  city: string;
  images: string[];
  /** Lähdesivun kuvateksti kuvalle (src → teksti), esim. "Ravintola Maistrali, Egina 09.07.2008". */
  captions?: Record<string, string>;
  /** Kuvan alt-tekstin tarkistettavat kohdat (src → syy). Lähteen alt säilyy sellaisenaan. */
  altHuomiot?: Record<string, string>;
}

/**
 * Lähteen alt-tekstin päiväys, joka ei vastaa kuvaa: esim. Sarastron kuvan
 * alt "Sarastro Savonlinna 24.07.2023", vaikka tiedostonimi (…250724) ja
 * käynti ovat 24.07.2025. Alt on lähteen kirjoitusvirhe, mutta sitä ei korjata
 * arvaamalla: alt säilyy, ravintola merkitään tarkistettavaksi syyn kanssa.
 *
 * Ristiriita = altissa on päiväys, joka ei ole tiedostonimen päiväys (millään
 * tulkinnalla) eikä ravintolan käyntipäivä, JA tiedostonimessä on päiväys.
 */
function altDateConflicts(links: ImageLink[], inventory: KuvaRecord[], visitsByDoc: Map<string, string[]>): number {
  const byFile = new Map(inventory.map((k) => [k.file, k]));
  let flagged = 0;
  for (const link of links) {
    for (const src of link.images) {
      const file = localImageName(src);
      const fromFile = fileDates(file);
      if (fromFile.length === 0) continue;
      const visits = visitsByDoc.get(link.docId) ?? [];
      for (const raw of byFile.get(file)?.altTexts ?? []) {
        const alt = decodeEntities(raw).replace(/\s+/g, " ").trim();
        const altDates = [...alt.matchAll(/(?<![\d.])(\d{1,2})\.(\d{1,2})\.(\d{4})(?!\d)/g)].map(
          (m) => `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`,
        );
        const wrong = altDates.filter((d) => !fromFile.includes(d) && !visits.includes(d));
        if (wrong.length === 0) continue;
        const fi = (iso: string) => iso.split("-").reverse().join(".");
        link.altHuomiot = {
          ...(link.altHuomiot ?? {}),
          [src]:
            `lähteen alt "${alt}": päiväys ${wrong.map(fi).join(", ")} ei vastaa tiedostonimen päiväystä ` +
            `(${fromFile.map(fi).join(" / ")}) eikä käyntejä (${visits.map(fi).join(", ") || "ei käyntejä"}); ` +
            "todennäköisesti lähteen kirjoitusvirhe — alt säilytetty lähteen mukaisena, tarkista",
        };
        flagged += 1;
      }
    }
  }
  return flagged;
}

interface DroppedImage {
  file: string;
  sivu: string;
  syy: string;
}

/**
 * Liittää kuvat ravintoloihin ensisijaisesti tiedostonimen perusteella.
 *
 * Jäsennin liittää kuvan siihen ravintolaan, joka oli käsittelyssä kun kuva
 * kohdattiin. Sivuilla joilla kuvat on koottu listan loppuun se tarkoittaa,
 * että kaikki kasautuvat viimeiselle ravintolalle — mitattuna 175 liitosta
 * 477:stä oli väärin. Siksi järjestys:
 *   1. tiedostonimi (`bestOwner`: nimi, osoite, kaupunki, kirjoitusvirheet)
 *   2. sijainti, jos kuvan solussa ei aloiteta useampaa ravintolaa
 *   3. muuten kuva jätetään liittämättä ja kirjataan perusteluineen
 *      `ravintola-kuvat-dropped.json`-tiedostoon: väärä kuva on pahempi kuin ei kuvaa.
 *
 * Koostesivujen (ruokailu.htm, ruokailutop5.htm) kuvat ovat ravintolakuvien
 * kopioita; niiden omistaja haetaan kaikista ravintoloista.
 */
async function linkImages(
  source: Ravintola[],
  cityNames: Map<Ravintola, string>,
  docIds: Map<Ravintola, string>,
): Promise<{ imageLinks: ImageLink[]; dropped: DroppedImage[]; stats: Record<string, number> }> {
  const inventory = JSON.parse(await readFile(IMAGE_INVENTORY, "utf-8")) as KuvaRecord[];
  const parseReport = JSON.parse(await readFile(PARSE_REPORT, "utf-8")) as {
    sivut: { sivu: string; kuvatekstit: string[] }[];
  };
  const captionsByPage = new Map(parseReport.sivut.map((p) => [p.sivu, p.kuvatekstit]));

  /** Sivun lopun kuvateksti, jonka sanoista vähintään kaksi on tiedostonimessä. */
  const captionFor = (file: string, page: string, owner?: Ravintola): string | null => {
    const haystack = fold(file).replace(/ /g, "");
    for (const caption of captionsByPage.get(page) ?? []) {
      const text = caption.replace(/^Kuva\s+/, "").trim();
      const words = fold(text).split(" ").filter((w) => w.length >= 4 && !/^\d+$/.test(w));
      if (words.filter((w) => haystack.includes(w)).length >= 2) return text;
      // Kuvateksti nimeää kuvan omistajan: "Kuva Ravintola Maistrali, Egina 09.07.2008"
      const ownerName = owner ? fold(owner.name) : "";
      if (ownerName.length >= 4 && ` ${fold(text)} `.includes(` ${ownerName} `) && haystack.includes(ownerName.replace(/ /g, ""))) {
        return text;
      }
    }
    return null;
  };

  const restaurantsByPage = new Map<string, Ravintola[]>();
  for (const r of source) {
    if (!docIds.has(r)) continue;
    const list = restaurantsByPage.get(r.sourcePage) ?? [];
    list.push(r);
    restaurantsByPage.set(r.sourcePage, list);
  }
  const allRestaurants = source.filter((r) => docIds.has(r));

  // Sijainnin perusteella yksiselitteiset omistajat: sivu|kuva → ravintola.
  const positional = new Map<string, Ravintola>();
  for (const r of allRestaurants) {
    for (const src of r.imagesPositional) positional.set(`${r.sourcePage}|${localImageName(src)}`, r);
  }

  const byDocId = new Map<string, ImageLink>();
  const assigned = new Map<string, string>(); // tiedosto → docId
  const dropped: DroppedImage[] = [];
  const stats = { nimi: 0, sijainti: 0, pudotettu: 0 };

  const attach = (r: Ravintola, file: string, src: string, page: string) => {
    const docId = docIds.get(r)!;
    assigned.set(file, docId);
    let link = byDocId.get(docId);
    if (!link) {
      link = { docId, name: r.name, city: cityNames.get(r) ?? "", images: [] };
      byDocId.set(docId, link);
    }
    if (!link.images.includes(src)) link.images.push(src);
    const caption = captionFor(file, page, r);
    if (caption) link.captions = { ...(link.captions ?? {}), [src]: caption };
  };

  // Ensin omien sivujen kuvat, sitten koostesivujen (jotka usein ovat samoja).
  const records = inventory
    .filter((k) => k.pages.some((p) => RESTAURANT_PAGE.test(p)))
    .sort((a, b) => a.file.localeCompare(b.file));
  const ordered = [
    ...records.filter((k) => k.pages.some((p) => RESTAURANT_PAGE.test(p) && !INDEX_PAGES.has(p.toLowerCase()))),
    ...records.filter((k) => k.pages.every((p) => !RESTAURANT_PAGE.test(p) || INDEX_PAGES.has(p.toLowerCase()))),
  ];

  // Kaksi kierrosta: yksiselitteiset ensin, jotta tasapelissä voidaan suosia
  // ravintolaa, jolla ei vielä ole kuvaa (esim. kaksi McDonald'sia samalla sivulla).
  const pending: { record: KuvaRecord; page: string; ties: Ravintola[] }[] = [];

  for (const record of ordered) {
    const file = record.file;
    const pages = record.pages.filter((p) => RESTAURANT_PAGE.test(p));
    const page = pages.find((p) => !INDEX_PAGES.has(p.toLowerCase())) ?? pages[0];

    if (!record.ok) {
      dropped.push({ file, sivu: page, syy: `lataus vanhalta palvelimelta epäonnistui (HTTP ${record.status || "virhe"}); kuvaa ei ole olemassa` });
      continue;
    }
    if (assigned.has(file)) continue;

    const isIndex = INDEX_PAGES.has(page.toLowerCase());
    const candidates = isIndex ? allRestaurants : (restaurantsByPage.get(page) ?? []);
    const options = candidates.map((r) => ({
      key: docIds.get(r)!,
      name: r.name,
      address: r.address ?? undefined,
      city: cityNames.get(r),
      visits: allVisits(r),
      restaurant: r,
    }));

    const result = rankOwners(file, options, { requireCity: isIndex });
    if (result && result.ties.length === 1) {
      attach(result.ties[0].restaurant, file, record.src, page);
      stats.nimi += 1;
      continue;
    }
    if (result && result.ties.length > 1) {
      pending.push({ record, page, ties: result.ties.map((t) => t.restaurant) });
      continue;
    }
    const pos = positional.get(`${page}|${file}`);
    if (pos && !isIndex) {
      attach(pos, file, record.src, page);
      stats.sijainti += 1;
      continue;
    }
    const caption = captionFor(file, page);
    dropped.push({
      file,
      sivu: page,
      syy: /logo/i.test(file)
        ? "yhdistyksen logo (teemagrafiikka), ei sisältökuva"
        : caption
          ? `ei ravintolan kuva vaan sivun maisemakuva (kuvateksti: "${caption}")`
          : isIndex
            ? "koostesivun kuva, jonka ravintolaa ei voi tunnistaa tiedostonimestä (nimi + kaupunki)"
            : "tiedostonimi ei vastaa yhtäkään sivun ravintolaa eikä sijainti sivulla ole yksiselitteinen (useita ravintoloita samassa solussa)",
    });
  }

  for (const { record, page, ties } of pending) {
    const withoutImage = ties.filter((r) => !byDocId.has(docIds.get(r)!));
    const pos = positional.get(`${page}|${record.file}`);
    // "Ainoa ilman kuvaa" vain kahden tasapelissä; isommassa joukossa se olisi arvaus.
    const pick = pos && ties.includes(pos) ? pos : ties.length === 2 && withoutImage.length === 1 ? withoutImage[0] : null;
    if (pick) {
      attach(pick, record.file, record.src, page);
      stats.nimi += 1;
    } else {
      dropped.push({
        file: record.file,
        sivu: page,
        syy: `tiedostonimi sopii ${ties.length} samannimiseen ravintolaan (${ties.map((t) => docIds.get(t)).join(", ")}); omistaja ei yksiselitteinen`,
      });
    }
  }

  stats.pudotettu = dropped.length;
  const imageLinks = [...byDocId.values()].sort((a, b) => a.docId.localeCompare(b.docId));
  for (const link of imageLinks) link.images.sort();
  dropped.sort((a, b) => a.sivu.localeCompare(b.sivu) || a.file.localeCompare(b.file));
  return { imageLinks, dropped, stats };
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
  const cityNames = new Map<Ravintola, string>();
  const pageCities = new Map<string, Map<string, number>>();
  let skipped = 0;

  const restaurants = source.flatMap((r) => {
    if (!r.name) {
      skipped += 1;
      return [];
    }
    const { doc: city, isArea } = cityFor(r, cities);
    cityNames.set(r, city.name);
    const perPage = pageCities.get(r.sourcePage) ?? new Map<string, number>();
    perPage.set(city.slug.current, (perPage.get(city.slug.current) ?? 0) + 1);
    pageCities.set(r.sourcePage, perPage);

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
    const docId = `ravintola-${slug}`;
    docIds.set(r, docId);

    const visits = allVisits(r);
    const review = reviewBlocks(docId, r.notes);

    return [
      {
        _id: docId,
        _type: "ravintola" as const,
        name: r.name,
        slug: { _type: "slug" as const, current: slug },
        tiivistelma: buildTiivistelma(r, isArea ? null : city.name) || undefined,
        city: { _type: "reference" as const, _ref: city._id },
        address: r.address ?? undefined,
        postalCode: r.postalCode ?? undefined,
        location: r.location ? { _type: "geopoint" as const, ...r.location } : undefined,
        phone: r.phone ?? undefined,
        stars: r.starsGlyph ?? undefined,
        ratingOverall: r.ratingOverall ?? undefined,
        ratingFood: r.ratingFood ?? undefined,
        ratingPrice: r.ratingPrice ?? undefined,
        ratingAtmosphere: r.ratingAtmosphere ?? undefined,
        review: review.length ? review : undefined,
        pros: r.pros.length ? r.pros : undefined,
        cons: r.cons.length ? r.cons : undefined,
        visitedAt: toIsoDate(r.firstVisit) ?? visits.at(-1) ?? undefined,
        visits: visits.length ? visits : undefined,
        visitContext: r.visitContext ?? undefined,
        closed: r.closed,
        closedNote: r.closedNote ?? undefined,
        needsReview: r.needsReview,
        legacyUrl: `/${r.sourcePage}`,
      },
    ];
  });

  const { imageLinks, dropped, stats } = await linkImages(source, cityNames, docIds);

  // Kuvan alt-tekstin ristiriita → ravintola tarkistettavaksi (syy ravintola-kuvat.json:n `altHuomiot`issa).
  const inventory = JSON.parse(await readFile(IMAGE_INVENTORY, "utf-8")) as KuvaRecord[];
  const visitsByDoc = new Map(source.filter((r) => docIds.has(r)).map((r) => [docIds.get(r)!, allVisits(r)]));
  const altFlagged = altDateConflicts(imageLinks, inventory, visitsByDoc);
  const altReviewDocs = new Set(imageLinks.filter((l) => l.altHuomiot).map((l) => l.docId));
  for (const restaurant of restaurants) {
    if (altReviewDocs.has(restaurant._id)) restaurant.needsReview = true;
  }

  const cityDocs = [...cities.values()].sort((a, b) => a._id.localeCompare(b._id));
  for (const city of cityDocs) lines.push(JSON.stringify(city));
  for (const restaurant of restaurants) lines.push(JSON.stringify(restaurant));

  // Vanha sivu → kaupunki-slugit. Redirect-integraatio (lib/redirects.ts,
  // `?kaupunki=`) käyttää tätä: aluesivun (esim. Uusimaa) ravintolat ovat nyt
  // oikeissa kaupungeissaan, joten `?kaupunki=uusimaa` ei enää rajaa mitään.
  const cityReport = [...pageCities.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([page, counts]) => {
      const legacySlug = slugify(page.replace(/^ruokailu/i, "").replace(/\.htm$/i, ""));
      const list = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      return {
        sivu: page,
        vanhaParametri: legacySlug,
        vanhaParametriOsuu: counts.has(legacySlug),
        kaupungit: Object.fromEntries(list),
        ehdotus:
          counts.has(legacySlug)
            ? `/ravintolat?kaupunki=${legacySlug}`
            : list.length === 1
              ? `/ravintolat?kaupunki=${list[0][0]}`
              : "/ravintolat",
      };
    });

  await writeFile(OUT, `${lines.join("\n")}\n`, "utf-8");
  await writeFile(IMAGE_MAP, `${JSON.stringify(imageLinks, null, 2)}\n`, "utf-8");
  await writeFile(IMAGE_DROPPED, `${JSON.stringify(dropped, null, 2)}\n`, "utf-8");
  await writeFile(CITY_REPORT, `${JSON.stringify(cityReport, null, 2)}\n`, "utf-8");

  const withRating = restaurants.filter((r) => r.ratingOverall !== undefined);
  const withVisits = restaurants.filter((r) => r.visits !== undefined);
  const brokenParams = cityReport.filter((c) => !c.vanhaParametriOsuu);

  console.log(`
Kaupunkeja .............. ${cities.size}
Ravintoloita ............ ${restaurants.length}
  arvosana .............. ${withRating.length}
  käyntihistoria ........ ${withVisits.length}
  sanallinen arvio ...... ${restaurants.filter((r) => r.review).length}
  lopettaneita .......... ${restaurants.filter((r) => r.closed).length}
  tarkistettavia ........ ${restaurants.filter((r) => r.needsReview).length}
Ohitettu (ei nimeä) ..... ${skipped}
Dokumentteja yhteensä ... ${lines.length}
Kuvaliitoksia ........... ${imageLinks.length} ravintolaa, ${imageLinks.reduce((n, l) => n + l.images.length, 0)} kuvaa
  nimellä / sijainnilla . ${stats.nimi} / ${stats.sijainti}
  pudotettu ............. ${dropped.length} (perustelut: ${IMAGE_DROPPED})
  alt tarkistettava ..... ${altFlagged} kuvaa, ${altReviewDocs.size} ravintolaa (syyt: ravintola-kuvat.json → altHuomiot)
${imageLinks.flatMap((l) => Object.entries(l.altHuomiot ?? {}).map(([src, syy]) => `    ${l.docId} ${src}: ${syy}`)).join("\n")}
Vanhoja ?kaupunki=-parametreja ilman osumaa: ${brokenParams.length}
${brokenParams.map((c) => `  ${c.sivu.padEnd(28)} ?kaupunki=${c.vanhaParametri.padEnd(15)} → ${c.ehdotus}`).join("\n")}

Kirjoitettu: ${OUT}
             ${IMAGE_MAP}
             ${CITY_REPORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
