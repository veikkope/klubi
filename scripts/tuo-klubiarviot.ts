/**
 * Ruokailutaulukon klubilaisten arvosanat Sanityyn (docs/21).
 *
 * Lähde: data/normalized/klubiarviot.json (scripts/klubiarviot-excel.py).
 * Päätökset: data/klubiarviot-paatokset.csv (valinnainen, ks. alla).
 *
 * 1. Klubilaiset (taulukon Painot-välilehti) → `klubilainen-<numero>`.
 *    Olemassa olevaa ei muuteta (isä voi muokata nimeä Studiossa).
 * 2. Taulukon rivi täsmäytetään sivuston ravintolaan:
 *     - sama nimi samassa kaupungissa, tai
 *     - sama ensimmäinen käyntipäivä ja nimi lähes sama (≥ 0,5), tai
 *     - nimi lähes sama (≥ 0,85) samassa kaupungissa ja sama päivä tai osoite.
 *    Pelkkä osoite ei riitä (kauppahallin eri kioskit). Jos kaksi riviä osuu
 *    samaan ravintolaan, molemmat jäävät tarkistukseen.
 * 3. Jokaisesta rivin arvioijasta `klubiArvio`: id
 *    `klubiarvio-<ravintolan id>-<numero>`, `tuotu: true`. Uudelleenajo
 *    korvaa vain tuodut; Studiossa lisättyihin ei kosketa. Tuodut, joiden
 *    riviä ei enää täsmäytetä, poistetaan.
 * 4. Lomakkeen arvostelut, joilla ei ole klubilaista, liitetään klubilaiseen,
 *    kun nimi täsmää täsmälleen yhteen.
 * 5. Ravintoloiden arvosanat lasketaan (lib/ravintola-arvosana.ts).
 *
 * Tarkistuslista: data/klubiarviot-tarkistus.csv (Excel avaa suoraan). Täytä
 * sarake "päätös" ja tallenna nimellä data/klubiarviot-paatokset.csv:
 *   ok             ehdotus on oikea
 *   <ravintolan id> oikea ravintola (esim. ravintola-cafe-ida-kauppakeskus-valo)
 *   ohita          rivi jätetään pois
 *   uusi           ravintolaa ei ole sivustolla: luodaan (kaupunki haetaan nimellä tai
 *                  luodaan; käynnit, tapahtuma; osoite vain, jos postinumero sopii
 *                  kaupunkiin; T/L-sarakkeen L = lopettanut). Alle kahden klubilaisen
 *                  ravintola jää piiloon, kunnes toinen arvioi sen (docs/21).
 *
 * Ajo:
 *   npm run tuo:klubiarviot                         # kuivaharjoitus, development
 *   npm run tuo:klubiarviot -- --vie                # kirjoittaa developmentiin
 *   npm run tuo:klubiarviot -- --production         # kuivaharjoitus, production
 *   npm run tuo:klubiarviot -- --production --vie   # varmuuskopio + production
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { createClient, type SanityClient } from "@sanity/client";

import { paivitaArvosanat, VAHIMMAISARVIOIJAT } from "../lib/ravintola-arvosana";
import { slugify } from "../lib/slugify";
import { sanityWriteToken } from "./lib/sanity-token";

const LAHDE = "data/normalized/klubiarviot.json";
const PAATOKSET = "data/klubiarviot-paatokset.csv";
const TARKISTUS = "data/klubiarviot-tarkistus.csv";

type TaulukonArvio = { numero: number; ruoka: number; hinta: number; viihtyvyys: number; paivat: string[] };
type TaulukonRivi = {
  rivi: number;
  nimi: string;
  kaupunki: string;
  maa: string;
  alku: string | null;
  viimeisin: string | null;
  katu: string;
  posti: string;
  tapahtuma: string;
  /** T = toiminnassa, L = lopettanut. */
  tl: string;
  arviot: TaulukonArvio[];
};
type Lahde = { jasenet: { numero: number; nimi: string }[]; ravintolat: TaulukonRivi[] };
type Ravintola = {
  _id: string;
  name: string;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  visitedAt: string | null;
};
type Kaupunki = { _id: string; name: string; slug: string; country: string | null };
type Tx = ReturnType<SanityClient["transaction"]>;

/* ── Täsmäytys ──────────────────────────────────────────────────────────── */

function norm(s: string | null | undefined): string {
  return (s ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " ja ")
    .replace(/[’'`´]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const YLEISET = new Set(["ravintola", "restaurant", "ristorante", "trattoria", "cafe", "kahvila", "bar", "pub", "the", "hotel", "oy", "ab"]);
const ydin = (s: string) => norm(s).split(" ").filter((w) => w && !YLEISET.has(w)).join(" ");

/** Ratcliff–Obershelp-samankaltaisuus (sama kuin Pythonin difflib). */
function samankaltaisuus(a: string, b: string): number {
  const osumat = (x: string, y: string): number => {
    if (!x || !y) return 0;
    let paras = 0;
    let ai = 0;
    let bi = 0;
    for (let i = 0; i < x.length; i++) {
      for (let j = 0; j < y.length; j++) {
        let k = 0;
        while (i + k < x.length && j + k < y.length && x[i + k] === y[j + k]) k++;
        if (k > paras) [paras, ai, bi] = [k, i, j];
      }
    }
    if (paras === 0) return 0;
    return paras + osumat(x.slice(0, ai), y.slice(0, bi)) + osumat(x.slice(ai + paras), y.slice(bi + paras));
  };
  return a.length + b.length === 0 ? 0 : (2 * osumat(a, b)) / (a.length + b.length);
}

function nimiSama(a: string, b: string): number {
  const x = ydin(a);
  const y = ydin(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  let s = samankaltaisuus(x, y);
  const wx = new Set(x.split(" "));
  const wy = new Set(y.split(" "));
  const osajoukko = [...wx].every((w) => wy.has(w)) || [...wy].every((w) => wx.has(w));
  if (Math.min(x.length, y.length) >= 4 && osajoukko) s = Math.max(s, 0.85);
  return s;
}

function katuJaNumero(s: string | null | undefined): [string, string | null] {
  const m = norm(s).match(/^([a-z ]+?)\s*(\d+)/);
  return m ? [m[1].trim(), m[2]] : [norm(s), null];
}

type Tasmays = {
  rivi: TaulukonRivi;
  ravintola: Ravintola | null;
  tila: "varma" | "todennakoinen" | "ei" | "tormays" | "paatos" | "ohita" | "uusi";
  syy: string;
};

function tasmaa(rivi: TaulukonRivi, ravintolat: Ravintola[]): Tasmays {
  let paras: { pisteet: number; ns: number; pv: boolean; ka: boolean; sama: boolean; r: Ravintola } | null = null;
  for (const r of ravintolat) {
    const sama = norm(rivi.kaupunki) === norm(r.city);
    const pv = Boolean(rivi.alku) && rivi.alku === r.visitedAt;
    let ka = false;
    if (rivi.katu && r.address) {
      const [k1, n1] = katuJaNumero(rivi.katu);
      const [k2, n2] = katuJaNumero(r.address.split(",")[0]);
      ka = n1 !== null && k1 === k2 && n1 === n2;
    }
    const ns = nimiSama(rivi.nimi, r.name);
    const pisteet = ns + (pv ? 0.35 : 0) + (ka ? 0.3 : 0) + (sama ? 0.15 : -0.3);
    if (!paras || pisteet > paras.pisteet) paras = { pisteet, ns, pv, ka, sama, r };
  }
  if (!paras) return { rivi, ravintola: null, tila: "ei", syy: "sivustolla ei ravintoloita" };
  const { ns, pv, ka, sama, r } = paras;
  const peruste = [`nimi ${ns.toFixed(2)}`, pv && "sama 1. käynti", ka && "sama osoite", sama ? "sama kaupunki" : "eri kaupunki"]
    .filter(Boolean)
    .join(", ");
  if (ns >= 0.999 && sama) return { rivi, ravintola: r, tila: "varma", syy: peruste };
  if (pv && ns >= 0.5) return { rivi, ravintola: r, tila: "varma", syy: peruste };
  if (ns >= 0.85 && sama && (pv || ka)) return { rivi, ravintola: r, tila: "varma", syy: peruste };
  if (ns >= 0.85 && sama) return { rivi, ravintola: r, tila: "todennakoinen", syy: peruste };
  if (paras.pisteet >= 1 && (pv || ka)) return { rivi, ravintola: r, tila: "todennakoinen", syy: peruste };
  return { rivi, ravintola: r, tila: "ei", syy: `paras ehdotus heikko (${peruste})` };
}

/* ── CSV ────────────────────────────────────────────────────────────────── */

const CSV_SARAKKEET = [
  "rivi", "ravintola taulukossa", "kaupunki", "1. käynti", "arvioijia", "tila",
  "ehdotus sivustolla", "ehdotuksen kaupunki", "ehdotuksen 1. käynti", "ehdotuksen id", "peruste", "päätös",
];
const solu = (v: unknown) => {
  const s = String(v ?? "");
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function lueCsv(polku: string): Map<number, string> {
  const paatokset = new Map<number, string>();
  if (!existsSync(polku)) return paatokset;
  const rivit = readFileSync(polku, "utf-8").replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
  const otsikot = rivit[0].split(";").map((s) => s.trim().toLowerCase());
  const iRivi = otsikot.indexOf("rivi");
  const iPaatos = otsikot.indexOf("päätös");
  if (iRivi < 0 || iPaatos < 0) throw new Error(`${polku}: sarakkeet "rivi" ja "päätös" puuttuvat.`);
  for (const r of rivit.slice(1)) {
    // Yksinkertainen ;-jako: päätös ja rivinumero eivät sisällä puolipisteitä.
    const solut = r.split(";");
    const n = Number.parseInt(solut[iRivi], 10);
    const p = (solut[iPaatos] ?? "").trim().replace(/^"|"$/g, "");
    if (Number.isInteger(n) && p) paatokset.set(n, p);
  }
  return paatokset;
}

/* ── Pääohjelma ─────────────────────────────────────────────────────────── */

const pyorista = (x: number) => Math.round(x * 100) / 100;

async function kirjoitaPaloina(client: SanityClient, muutokset: ((tx: Tx) => void)[]) {
  for (let i = 0; i < muutokset.length; i += 200) {
    const tx = client.transaction();
    for (const m of muutokset.slice(i, i + 200)) m(tx);
    // sync: laskenta lukee arvosanat heti perään, joten niiden pitää näkyä haussa.
    await tx.commit({ visibility: "sync" });
    process.stdout.write(`  ${Math.min(i + 200, muutokset.length)}/${muutokset.length}\r`);
  }
  if (muutokset.length > 0) process.stdout.write("\n");
}

async function main() {
  const vie = process.argv.includes("--vie");
  const dataset = process.argv.includes("--production") ? "production" : "development";
  if (!existsSync(LAHDE)) {
    console.error(`${LAHDE} puuttuu. Aja ensin: python scripts/klubiarviot-excel.py ruokailu2026.xls`);
    process.exit(1);
  }
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = sanityWriteToken();
  if (!projectId || !token) {
    console.error("NEXT_PUBLIC_SANITY_PROJECT_ID tai kirjoitustoken puuttuu (.env.local tai npx sanity login).");
    process.exit(1);
  }
  const client = createClient({ projectId, dataset, apiVersion: "2025-08-15", token, useCdn: false, perspective: "raw" });

  const lahde = JSON.parse(readFileSync(LAHDE, "utf-8")) as Lahde;

  // Taulukon tunnetut virhetyypit (docs/21):
  // 1. Arvosana, jonka kaikki päivät ovat ennen ravintolan ensimmäistä käyntiä, on
  //    toiselta riviltä jäänyt solu (Rosso, Imatra 2024: Simo 1999, Lkm-sarake 1).
  const hylatyt: string[] = [];
  for (const rivi of lahde.ravintolat) {
    rivi.arviot = rivi.arviot.filter((a) => {
      const mahdoton = Boolean(rivi.alku) && a.paivat.length > 0 && a.paivat.every((p) => p < rivi.alku!);
      if (mahdoton) {
        const nimi = lahde.jasenet.find((j) => j.numero === a.numero)?.nimi ?? a.numero;
        hylatyt.push(`${rivi.nimi} (rivi ${rivi.rivi}): ${nimi} ${a.paivat.join(", ")} < 1. käynti ${rivi.alku}`);
      }
      return !mahdoton;
    });
  }
  // 2. Sama katuosoite usealla rivillä eri kaupungeissa on kopioitu (myös tapahtuma ja
  //    T/L): uuteen ravintolaan ei oteta niitä.
  const osoitteenKaupungit = new Map<string, Set<string>>();
  for (const rivi of lahde.ravintolat) {
    if (!rivi.katu || rivi.katu === "-") continue;
    const avain = `${norm(rivi.katu)}|${rivi.posti}`;
    osoitteenKaupungit.set(avain, new Set([...(osoitteenKaupungit.get(avain) ?? []), norm(rivi.kaupunki)]));
  }
  const kopioituOsoite = (rivi: TaulukonRivi) =>
    (osoitteenKaupungit.get(`${norm(rivi.katu)}|${rivi.posti}`)?.size ?? 0) > 1;
  const paatokset = lueCsv(PAATOKSET);
  const [ravintolat, olemassa, irralliset, kaupungit] = await Promise.all([
    client.fetch<Ravintola[]>(
      `*[_type == "ravintola" && !(_id in path("drafts.**"))]{ _id, name, "city": city->name, address, postalCode, visitedAt }`,
    ),
    client.fetch<{ _id: string; tuotu?: boolean }[]>(`*[_type == "klubiArvio"]{ _id, tuotu }`),
    client.fetch<{ _id: string; _rev: string; reviewerName?: string }[]>(
      `*[_type == "ravintolaKayttajaArvostelu" && !defined(arvioija)]{ _id, _rev, reviewerName }`,
    ),
    client.fetch<Kaupunki[]>(
      `*[_type == "kaupunki" && !(_id in path("drafts.**"))]{ _id, name, "slug": slug.current, country }`,
    ),
  ]);
  const ravintolaIdlla = new Map(ravintolat.map((r) => [r._id, r]));

  // 1. Täsmäytys ja päätökset
  const tasmaykset = lahde.ravintolat.map((rivi) => {
    const t = tasmaa(rivi, ravintolat);
    const p = paatokset.get(rivi.rivi);
    if (!p) return t;
    if (p.toLowerCase() === "ohita") return { ...t, ravintola: null, tila: "ohita" as const, syy: "päätös: ohita" };
    if (p.toLowerCase() === "uusi") {
      // Uudelleenajo: aiemmin luotu ravintola täsmää jo nimellä ja kaupungilla.
      if (t.tila === "varma" && t.ravintola) return { ...t, tila: "paatos" as const, syy: "päätös: uusi (luotu jo)" };
      return { ...t, ravintola: null, tila: "uusi" as const, syy: "päätös: uusi ravintola" };
    }
    if (p.toLowerCase() === "ok") {
      return t.ravintola ? { ...t, tila: "paatos" as const, syy: "päätös: ok" } : t;
    }
    const r = ravintolaIdlla.get(p);
    if (!r) throw new Error(`${PAATOKSET}: rivin ${rivi.rivi} ravintolaa "${p}" ei löydy datasetista ${dataset}.`);
    return { ...t, ravintola: r, tila: "paatos" as const, syy: "päätös: ravintola valittu" };
  });
  // Kaksi automaattista osumaa samaan ravintolaan → molemmat tarkistukseen.
  const osumia = new Map<string, number>();
  for (const t of tasmaykset) if (t.tila === "varma" && t.ravintola) osumia.set(t.ravintola._id, (osumia.get(t.ravintola._id) ?? 0) + 1);
  for (const t of tasmaykset) {
    if (t.tila === "varma" && t.ravintola && (osumia.get(t.ravintola._id) ?? 0) > 1) {
      t.tila = "tormays";
      t.syy = `useampi taulukon rivi osuu samaan ravintolaan (${t.syy})`;
    }
  }
  // Uudet ravintolat (päätös "uusi"): kaupunki nimellä tai uusi, id ja slug nimestä.
  const kaupunkiNimella = new Map(kaupungit.map((k) => [norm(k.name), k]));
  const varatut = new Set(ravintolat.map((r) => r._id));
  const uudetKaupungit = new Map<string, Kaupunki>();
  const uudetRavintolat: { _id: string; _type: string; [k: string]: unknown }[] = [];
  const postinumerot = new Map<string, Set<string>>();
  for (const r of ravintolat) {
    if (r.city && r.postalCode) {
      const k = norm(r.city);
      postinumerot.set(k, new Set([...(postinumerot.get(k) ?? []), r.postalCode.slice(0, 2)]));
    }
  }
  const vapaa = (pohja: string, lisa: string): string => {
    for (const ehdokas of [pohja, `${pohja}-${lisa}`, ...[2, 3, 4, 5].map((n) => `${pohja}-${lisa}-${n}`)]) {
      if (!varatut.has(`ravintola-${ehdokas}`)) return ehdokas;
    }
    return `${pohja}-${Date.now().toString(36)}`;
  };
  for (const t of tasmaykset.filter((t) => t.tila === "uusi")) {
    const rivi = t.rivi;
    let kaupunki = kaupunkiNimella.get(norm(rivi.kaupunki)) ?? uudetKaupungit.get(norm(rivi.kaupunki));
    if (!kaupunki) {
      let slug = slugify(rivi.kaupunki);
      if (kaupungit.some((k) => k.slug === slug)) slug = `${slug}-${slugify(rivi.maa || "maa")}`;
      kaupunki = { _id: `kaupunki-${slug}`, name: rivi.kaupunki, slug, country: rivi.maa || null };
      uudetKaupungit.set(norm(rivi.kaupunki), kaupunki);
    }
    const nimiSlug = vapaa(slugify(rivi.nimi), slugify(rivi.kaupunki));
    const id = `ravintola-${nimiSlug}`;
    varatut.add(id);
    const kaynnit = [
      ...new Set([rivi.alku, rivi.viimeisin, ...rivi.arviot.flatMap((a) => a.paivat)].filter((p): p is string => Boolean(p))),
    ]
      .sort()
      .reverse();
    // Osoite vain, jos postinumero sopii kaupunkiin (taulukossa on kopioituja osoitteita).
    const tunnetut = postinumerot.get(norm(rivi.kaupunki));
    const posti = /^[0-9]{5}$/.test(rivi.posti) ? rivi.posti : "";
    const kopioitu = kopioituOsoite(rivi);
    const osoiteKelpaa =
      !kopioitu && Boolean(rivi.katu) && rivi.katu !== "-" && (!posti || !tunnetut || tunnetut.has(posti.slice(0, 2)));
    const tapahtuma = !kopioitu && rivi.tapahtuma && rivi.tapahtuma !== "-" ? rivi.tapahtuma : null;
    uudetRavintolat.push({
      _id: id,
      _type: "ravintola",
      name: rivi.nimi,
      slug: { _type: "slug", current: nimiSlug },
      city: { _type: "reference", _ref: kaupunki._id },
      ...(osoiteKelpaa ? { address: rivi.katu, ...(posti ? { postalCode: posti } : {}) } : {}),
      ...(rivi.alku ? { visitedAt: rivi.alku } : {}),
      ...(kaynnit.length > 0 ? { visits: kaynnit } : {}),
      ...(tapahtuma ? { visitContext: tapahtuma } : {}),
      closed: !kopioitu && rivi.tl === "L",
      // Näkyvät uudet tarkistetaan (kuvaus, kuvat); piilossa odottavat eivät kiirehdi.
      needsReview: rivi.arviot.length >= VAHIMMAISARVIOIJAT,
    });
    t.ravintola = { _id: id, name: rivi.nimi, city: rivi.kaupunki, address: null, postalCode: null, visitedAt: rivi.alku };
  }

  const hyvaksytyt = tasmaykset.filter(
    (t) => (t.tila === "varma" || t.tila === "paatos" || t.tila === "uusi") && t.ravintola,
  );

  // 2. Tarkistuslista
  const tarkistettavat = tasmaykset.filter((t) => t.tila === "todennakoinen" || t.tila === "ei" || t.tila === "tormays");
  const kaytetyt = new Set(hyvaksytyt.map((t) => t.ravintola!._id));
  const ilmanRivia = ravintolat.filter((r) => !kaytetyt.has(r._id));
  const csv = [
    CSV_SARAKKEET.join(";"),
    ...tarkistettavat.map((t) =>
      [
        t.rivi.rivi, t.rivi.nimi, t.rivi.kaupunki, t.rivi.alku, t.rivi.arviot.length, t.tila,
        t.ravintola?.name, t.ravintola?.city, t.ravintola?.visitedAt, t.ravintola?._id, t.syy, "",
      ].map(solu).join(";"),
    ),
  ];
  writeFileSync(TARKISTUS, "﻿" + csv.join("\r\n") + "\r\n", "utf-8");

  // 3. Dokumentit
  const jasenId = (numero: number) => `klubilainen-${numero}`;
  const jasenNimet = new Map(lahde.jasenet.map((j) => [j.numero, j.nimi]));
  const arviot = hyvaksytyt.flatMap((t) =>
    t.rivi.arviot.map((a) => {
      const paiva = a.paivat.at(-1) ?? t.rivi.viimeisin ?? t.rivi.alku ?? t.ravintola!.visitedAt;
      return {
        _id: `klubiarvio-${t.ravintola!._id}-${a.numero}`,
        _type: "klubiArvio",
        ravintola: { _type: "reference", _ref: t.ravintola!._id },
        arvioija: { _type: "reference", _ref: jasenId(a.numero) },
        ratingFood: pyorista(a.ruoka),
        ratingPrice: pyorista(a.hinta),
        ratingAtmosphere: pyorista(a.viihtyvyys),
        ...(paiva ? { paiva } : {}),
        ...(a.paivat.length > 0 ? { kaynnit: a.paivat } : {}),
        tuotu: true,
      };
    }),
  );
  const tuntemattomat = [...new Set(arviot.map((a) => a.arvioija._ref))].filter(
    (id) => !lahde.jasenet.some((j) => jasenId(j.numero) === id),
  );
  if (tuntemattomat.length > 0) throw new Error(`Arvioijia ilman klubilaista: ${tuntemattomat.join(", ")}`);
  const uudetIdt = new Set(arviot.map((a) => a._id));
  const poistettavat = olemassa.filter((d) => d.tuotu && !uudetIdt.has(d._id.replace(/^drafts\./, "")));

  // 4. Lomakkeen arvostelut klubilaisiin
  const nimella = new Map<string, number[]>();
  for (const j of lahde.jasenet) nimella.set(norm(j.nimi), [...(nimella.get(norm(j.nimi)) ?? []), j.numero]);
  const liitettavat = irralliset.flatMap((a) => {
    const numerot = nimella.get(norm(a.reviewerName)) ?? [];
    return numerot.length === 1 ? [{ ...a, numero: numerot[0] }] : [];
  });

  const laske = (tila: Tasmays["tila"]) => tasmaykset.filter((t) => t.tila === tila).length;
  console.log(`Dataset ${dataset}`);
  console.log(`  Taulukon ravintoloita ......... ${lahde.ravintolat.length}`);
  console.log(`    täsmätty automaattisesti .... ${laske("varma")}`);
  console.log(`    täsmätty päätöksellä ........ ${laske("paatos")}`);
  console.log(`    ohitettu päätöksellä ........ ${laske("ohita")}`);
  const nakyvat = tasmaykset.filter((t) => t.tila === "uusi" && t.rivi.arviot.length >= VAHIMMAISARVIOIJAT);
  console.log(
    `    uusia ravintoloita .......... ${laske("uusi")} (näkyviin ${nakyvat.length}, piiloon ${laske("uusi") - nakyvat.length}; uusia kaupunkeja ${uudetKaupungit.size})`,
  );
  if (nakyvat.length > 0) console.log(`      näkyviin: ${nakyvat.map((t) => `${t.rivi.nimi} (${t.rivi.kaupunki})`).join(", ")}`);
  console.log(`    tarkistettavia .............. ${tarkistettavat.length} (todennäköisiä ${laske("todennakoinen")}, törmäyksiä ${laske("tormays")}, ei vastinetta ${laske("ei")})`);
  console.log(`  Sivuston ravintoloita ilman taulukkoriviä: ${ilmanRivia.length}`);
  console.log(`  Klubilaisia ................... ${lahde.jasenet.length} (${lahde.jasenet.map((j) => j.nimi).join(", ")})`);
  console.log(`  Klubilaisten arvosanoja ....... ${arviot.length} (poistettavia vanhoja tuotuja ${poistettavat.length})`);
  console.log(`  Lomakkeen arvosteluja liitetään: ${liitettavat.map((a) => `${a.reviewerName} → ${jasenNimet.get(a.numero)}`).join(", ") || "–"}`);
  if (hylatyt.length > 0) console.log(`  Hylätyt taulukon arvosanat: ${hylatyt.join("; ")}`);
  console.log(`  Tarkistuslista: ${TARKISTUS}${paatokset.size ? ` · päätöksiä luettu ${paatokset.size}` : ""}`);

  if (!vie) {
    const muutokset = await paivitaArvosanat(client, { kuiva: true });
    console.log(`  Arvosanoja muuttuisi nyt (ennen tuontia): ${muutokset.length}`);
    console.log(
      `\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npm run tuo:klubiarviot -- ${dataset === "production" ? "--production " : ""}--vie`,
    );
    return;
  }

  if (dataset === "production") {
    console.log("\nVarmuuskopio productionista");
    const tulos = spawnSync("npm", ["run", "backup"], { stdio: "inherit", shell: process.platform === "win32" });
    if (tulos.status !== 0) {
      console.error("Varmuuskopio epäonnistui: mitään ei kirjoitettu.");
      process.exit(1);
    }
  }

  if (uudetKaupungit.size > 0 || uudetRavintolat.length > 0) {
    console.log("\nKirjoitetaan uudet kaupungit ja ravintolat");
    await kirjoitaPaloina(client, [
      ...[...uudetKaupungit.values()].map((k) => (tx: Tx) =>
        tx.createIfNotExists({
          _id: k._id,
          _type: "kaupunki",
          name: k.name,
          slug: { _type: "slug", current: k.slug },
          ...(k.country ? { country: k.country } : {}),
        }),
      ),
      ...uudetRavintolat.map((r) => (tx: Tx) => tx.createIfNotExists(r)),
    ]);
  }

  console.log("\nKirjoitetaan klubilaiset");
  await kirjoitaPaloina(
    client,
    lahde.jasenet.map((j) => (tx) =>
      tx.createIfNotExists({ _id: jasenId(j.numero), _type: "klubilainen", nimi: j.nimi, taulukkoNumero: j.numero }),
    ),
  );
  console.log("Kirjoitetaan arvosanat");
  await kirjoitaPaloina(client, arviot.map((a) => (tx) => tx.createOrReplace(a)));
  if (poistettavat.length > 0) {
    console.log("Poistetaan vanhat tuodut arvosanat");
    await kirjoitaPaloina(client, poistettavat.map((d) => (tx) => tx.delete(d._id)));
  }
  if (liitettavat.length > 0) {
    console.log("Liitetään lomakkeen arvostelut");
    await kirjoitaPaloina(
      client,
      liitettavat.map((a) => (tx) =>
        tx.patch(a._id, (p) => p.ifRevisionId(a._rev).set({ arvioija: { _type: "reference", _ref: jasenId(a.numero) } })),
      ),
    );
  }
  console.log("Lasketaan ravintoloiden arvosanat");
  const muutokset = await paivitaArvosanat(client);
  console.log(`✓ Valmis (${dataset}): ${arviot.length} arvosanaa, ${muutokset.length} ravintolan arvosana päivitetty.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
