/**
 * Litmanen-osion uudistus (docs/20): pelaajan `kuvaus`-kentän lehtijutut omiksi
 * `lehtileike`-dokumenteikseen, faktalaatikot rakenteisiin kenttiin ja
 * patsaskuvat patsas-osioon.
 *
 * Ajo:
 *   npx tsx scripts/kerta/2026-10-01-uudista-litmanen.ts                         # development, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-10-01-uudista-litmanen.ts --vie                # development, kirjoitus
 *   npx tsx scripts/kerta/2026-10-01-uudista-litmanen.ts --production         # production, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-10-01-uudista-litmanen.ts --production --vie   # varmuuskopio + kirjoitus + tarkistus
 *
 * Kuivaharjoitus kirjoittaa jutut tiedostoon data/litmanen-leikkeet.tsv
 * tarkistettavaksi. Productioniin vasta, kun uudet sivut on julkaistu.
 *
 * Säännöt (CLAUDE.md, docs/17 §D):
 *  - Lehtileikkeet `createIfNotExists`, pelaajan patch `ifRevisionId`, samassa transaktiossa.
 *  - Keskeytyy, jos pelaajalla on luonnos tai kuvaus on jo jaettu.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { createClient } from "@sanity/client";

import { sanityWriteToken } from "../lib/sanity-token";

const PELAAJA_ID = "pelaaja-jari-litmanen";
const PATSAS_URL = "/litmanenjaripatsas.htm";
const RAPORTTI = "data/litmanen-leikkeet.tsv";

type Span = { _key: string; _type: string; text?: string; marks?: string[] };
type Lohko = {
  _key: string;
  _type: string;
  style?: string;
  listItem?: string;
  children?: Span[];
  markDefs?: unknown[];
  alt?: string;
  caption?: string;
  asset?: { _ref: string };
};
type Kuva = { _key: string; _type: string; asset?: { _ref: string }; alt?: string; caption?: string; hotspot?: unknown; crop?: unknown };
type Seura = { _key: string; seura: string; alkuvuosi?: number; loppuvuosi?: number };
type Pelaaja = {
  _id: string;
  _rev: string;
  kuvaus?: Lohko[];
  kuvat?: Kuva[];
  seurat?: Seura[];
  muutLegacyUrlit?: string[];
};

type Osio = "lehtileikkeet" | "patsas" | "terveys";
interface Juttu {
  otsikko: string;
  /** Otsikko muodostettu ensimmäisestä virkkeestä (jutulla ei ollut omaa otsikkoa). */
  otsikkoJohdettu: boolean;
  osio: Osio;
  lohkot: Lohko[];
  julkaistu: string | null;
  lahde: string | null;
  linkki: string | null;
  huomio: string | null;
}

const teksti = (b: Lohko) => (b.children ?? []).map((c) => c.text ?? "").join("");
const onTekstilohko = (b: Lohko) => b._type === "block";

/** Faktalaatikoiden kappaleet: siirtyvät rakenteisiin kenttiin, eivät jutuiksi. */
const FAKTA = [/^Syntymäaika:/, /^Ammattilaisseurat:/, /^Maajoukkue:/, /^SAAVUTUKSET SEURAJOUKKUEISSA/, /^HENKILÖKOHTAISET SAAVUTUKSET/, /^Kuva \d/];

/** Jutun sisäinen tietolaatikko, joka on migraatiossa merkitty h3:ksi (il.fi 20.02.2021). */
const SISAOTSIKOT = new Set(["Jari Litmanen"]);

/** "(is.fi 27.10.2025)", "(ess / 8.5.2012 / Kuva Kisapuisto 16.05.2012)", "(16.01.2012 ess.fi)". */
const LAHDE = /\(([^()]*?\b\d{1,2}\.\d{1,2}\.\d{4}[^()]*)\)\s*$/;
/** Sulkeeton päiväys lopussa: "… Kuninkaalle. / 01.10.2012". */
const LAHDE_ILMAN_SULKEITA = /\s\/\s*(\d{1,2}\.\d{1,2}\.\d{4})\s*$/;
const PVM = /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/;
const URL = /https?:\/\/\S+/;

function isoPaiva(teksti: string): string | null {
  const m = teksti.match(PVM);
  if (!m) return null;
  const [, d, kk, v] = m;
  return `${v}-${kk.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function jasennaLahde(sisalto: string): Pick<Juttu, "julkaistu" | "lahde" | "linkki" | "huomio"> {
  const julkaistu = isoPaiva(sisalto);
  const linkki = sisalto.match(URL)?.[0] ?? null;
  const osat = sisalto
    .replace(URL, "")
    .split("/")
    .map((o) => o.trim())
    .filter(Boolean);
  const kuvaOsat = osat.filter((o) => /^Kuva\b/i.test(o));
  const lahde = osat
    .filter((o) => !/^Kuva\b/i.test(o))
    .map((o) => o.replace(PVM, "").trim())
    .filter(Boolean)
    .join(", ");
  return { julkaistu, lahde: lahde || null, linkki, huomio: kuvaOsat.join("; ") || null };
}

/** Poistaa lohkon lopusta merkkijonon, joka alkaa kohdasta `alku` (koko tekstissä). */
function katkaise(lohko: Lohko, alku: number): Lohko {
  let kohta = 0;
  const children: Span[] = [];
  for (const span of lohko.children ?? []) {
    const t = span.text ?? "";
    if (kohta >= alku) break;
    const jaa = Math.min(t.length, alku - kohta);
    children.push({ ...span, text: t.slice(0, jaa) });
    kohta += t.length;
  }
  // Viimeisen säilyvän spanin loppuvälilyönnit pois.
  for (let i = children.length - 1; i >= 0; i--) {
    children[i] = { ...children[i], text: (children[i].text ?? "").replace(/\s+$/, "") };
    if (children[i].text) break;
    children.pop();
  }
  return { ...lohko, children };
}

/** Lähdemerkintä jutun viimeisestä tekstikappaleesta: poistetaan tekstistä, palautetaan kenttinä. */
const EI_LAHDETTA = { julkaistu: null, lahde: null, linkki: null, huomio: null };

/** Lähdemerkintä kappaleen lopussa: sulkeissa tai "/ pvm" ilman sulkeita. */
function lahdeLopussa(t: string): { alku: number; sisalto: string } | null {
  const m = t.match(LAHDE) ?? t.match(LAHDE_ILMAN_SULKEITA);
  return m && m.index !== undefined ? { alku: m.index, sisalto: m[1] } : null;
}

/** Otsikko jutulle, jolla sitä ei ollut: ensimmäinen virke (merkitään tarkistettavaksi). */
function johdaOtsikko(t: string): string {
  const virke = t.match(/^(.{20,110}?[.!?])(\s|$)/)?.[1];
  if (virke) return virke.replace(/\.$/, "");
  return `${t.slice(0, 80).replace(/\s+\S*$/, "")}…`;
}

function erotaLahde(lohkot: Lohko[]): Pick<Juttu, "lohkot" | "julkaistu" | "lahde" | "linkki" | "huomio"> {
  for (let i = lohkot.length - 1; i >= 0; i--) {
    const b = lohkot[i];
    if (!onTekstilohko(b)) continue;
    const t = teksti(b).replace(/\s+$/, "");
    const m = lahdeLopussa(t);
    if (!m) return { lohkot, ...EI_LAHDETTA };
    const tiedot = jasennaLahde(m.sisalto);
    const lyhennetty = katkaise(b, m.alku);
    const uudet = [...lohkot];
    if (teksti(lyhennetty).trim()) uudet[i] = lyhennetty;
    else uudet.splice(i, 1);
    return { lohkot: uudet, ...tiedot };
  }
  return { lohkot, ...EI_LAHDETTA };
}

/** Lyhenteet, joiden pisteen jälkeen ei aloiteta uutta kappaletta. */
const LYHENNE = /\b(mm|esim|ns|yms|tms|ym|jne|ks|klo|nro|n|s|t|v|kpl|tri|prof)\.$/i;
/** Pitkä kappale pilkotaan tätä pidemmiksi paloiksi virkerajoilla. */
const KAPPALE_MAX = 700;
const KAPPALE_TAVOITE = 420;

function virkkeiksi(t: string): string[] {
  const osat = t.split(/(?<=[.!?]["”]?)\s+(?=["”–A-ZÅÄÖ])/);
  const virkkeet: string[] = [];
  for (const osa of osat) {
    const edellinen = virkkeet.at(-1);
    if (edellinen && LYHENNE.test(edellinen)) virkkeet[virkkeet.length - 1] = `${edellinen} ${osa}`;
    else virkkeet.push(osa);
  }
  return virkkeet;
}

/**
 * Vanhalla sivulla monen jutun kappalejako oli kadonnut: koko juttu yhtenä
 * 1 500–4 500 merkin kappaleena. Palautetaan luettava jako:
 *  1. repliikki ("– Yleensä …") alkaa uuden kappaleen virkkeen lopun jälkeen
 *  2. yli 700 merkin kappale jaetaan virkerajoilla noin 420 merkin paloiksi.
 * Vain muotoilemattomat tekstikappaleet (ei lihavointeja, linkkejä tai listoja).
 */
function palautaKappalejako(lohkot: Lohko[]): Lohko[] {
  return lohkot.flatMap((b) => {
    const muotoilematon =
      b._type === "block" &&
      b.style === "normal" &&
      !b.listItem &&
      (b.children ?? []).every((c) => c._type === "span" && (c.marks ?? []).length === 0);
    const t = teksti(b).trim();
    if (!muotoilematon || t.length <= KAPPALE_MAX) return [b];

    const repliikit = t.split(/(?<=[.!?"”])\s*(?=[–-]\s?["A-ZÅÄÖ])/).map((s) => s.trim()).filter(Boolean);
    const kappaleet = repliikit.flatMap((kappale) => {
      if (kappale.length <= KAPPALE_MAX) return [kappale];
      const palat: string[] = [];
      let nykyinen = "";
      const virkkeet = virkkeiksi(kappale);
      virkkeet.forEach((virke, i) => {
        nykyinen = nykyinen ? `${nykyinen} ${virke}` : virke;
        const jaljella = virkkeet.slice(i + 1).join(" ").length;
        if (nykyinen.length >= KAPPALE_TAVOITE && jaljella >= 200) {
          palat.push(nykyinen);
          nykyinen = "";
        }
      });
      if (nykyinen) palat.push(nykyinen);
      return palat;
    });
    if (kappaleet.length <= 1) return [b];
    return kappaleet.map((teksti, i) => ({
      ...b,
      _key: `${b._key}-k${i}`,
      markDefs: [],
      children: [{ _key: `${b._key}-k${i}s`, _type: "span", text: teksti, marks: [] }],
    }));
  });
}

function jasennaJutut(kuvaus: Lohko[]) {
  const jutut: Juttu[] = [];
  const fakta: string[] = [];
  const irtokuvat: Lohko[] = [];
  let terveys = false;
  type Kesken = { otsikko: string; otsikkoJohdettu: boolean; osio: Osio; lohkot: Lohko[] };
  let nykyinen: Kesken | null = null;
  let edellinenPaattyiLahteeseen = true;

  const sulje = () => {
    const kesken = nykyinen as Kesken | null;
    if (!kesken) return;
    const { lohkot: ilmanLahdetta, ...lahde } = erotaLahde(kesken.lohkot);
    const lohkot = palautaKappalejako(ilmanLahdetta);
    if (lohkot.some(onTekstilohko)) {
      jutut.push({ otsikko: kesken.otsikko, otsikkoJohdettu: kesken.otsikkoJohdettu, osio: kesken.osio, lohkot, ...lahde });
    }
    nykyinen = null;
  };
  const aloita = (otsikko: string, otsikkoJohdettu = false) => {
    sulje();
    const osio: Osio = terveys ? "terveys" : /patsa|jalusta/i.test(otsikko) ? "patsas" : "lehtileikkeet";
    nykyinen = { otsikko: otsikko.trim(), otsikkoJohdettu, osio, lohkot: [] };
    edellinenPaattyiLahteeseen = false;
  };

  for (const b of kuvaus) {
    const t = onTekstilohko(b) ? teksti(b).trim() : "";

    if (b.style === "h2") {
      sulje();
      if (/loukkaantumiset/i.test(t)) terveys = true;
      edellinenPaattyiLahteeseen = true;
      continue;
    }
    if (onTekstilohko(b) && FAKTA.some((re) => re.test(t))) {
      sulje();
      fakta.push(t);
      edellinenPaattyiLahteeseen = true;
      continue;
    }
    if (b.style === "h3" && SISAOTSIKOT.has(t) && nykyinen) {
      (nykyinen as Kesken).lohkot.push({ ...b, style: "h4" });
      continue;
    }
    const lyhytOtsikko =
      b.style === "normal" && !b.listItem && t.length > 0 && t.length <= 90 && !/[.,;:)]$/.test(t) && edellinenPaattyiLahteeseen;
    if (b.style === "h3" || lyhytOtsikko) {
      aloita(t);
      continue;
    }
    if (!nykyinen) {
      if (b._type === "imageWithAlt") irtokuvat.push(b);
      else if (t) fakta.push(t);
      continue;
    }
    // Lähdemerkinnän jälkeen alkava pitkä kappale on uusi juttu ilman omaa otsikkoa.
    if (onTekstilohko(b) && edellinenPaattyiLahteeseen) aloita(johdaOtsikko(t), true);
    (nykyinen as unknown as Kesken).lohkot.push(b);
    if (onTekstilohko(b)) edellinenPaattyiLahteeseen = lahdeLopussa(t) !== null;
  }
  sulje();
  return { jutut, fakta, irtokuvat };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/, "");
}

const RYHMAT: [RegExp, "seurajoukkueet" | "henkilokohtaiset"][] = [
  [/^SAAVUTUKSET SEURAJOUKKUEISSA/, "seurajoukkueet"],
  [/^HENKILÖKOHTAISET SAAVUTUKSET/, "henkilokohtaiset"],
];

function jasennaFakta(fakta: string[]) {
  const saavutukset: { _key: string; _type: "saavutus"; ryhma: string; nimi: string; vuodet: string }[] = [];
  let syntymapaikka: string | undefined;
  let pituus: number | undefined;
  let patsas: { paljastettu?: string; sijainti?: string } = {};

  for (const kappale of fakta) {
    const ryhma = RYHMAT.find(([re]) => re.test(kappale))?.[1];
    for (const rivi of kappale.split("\n").map((r) => r.trim()).filter(Boolean)) {
      const paikka = rivi.match(/^Syntymäpaikka:\s*(.+)$/);
      if (paikka) syntymapaikka = paikka[1].trim();
      const cm = rivi.match(/^Pituus:\s*(\d+)\s*cm/);
      if (cm) pituus = Number(cm[1]);
      const p = rivi.match(/^Patsas\s+(\d{1,2}\.\d{1,2}\.\d{4})\s*\/\s*(.+?)\.?$/);
      if (p) {
        patsas = { paljastettu: isoPaiva(p[1]) ?? undefined, sijainti: p[2].trim() };
        continue;
      }
      if (!ryhma || /:$/.test(rivi)) continue;
      const s = rivi.match(/^(.+?)(?:\s*\([^)]*\))?:\s*(.+)$/);
      if (!s) continue;
      const nimi = s[1].trim().replace(/\bHollanin\b/g, "Hollannin");
      saavutukset.push({ _key: `s-${slugify(nimi)}`, _type: "saavutus", ryhma, nimi, vuodet: s[2].trim() });
    }
  }
  return { saavutukset, syntymapaikka, pituus, patsas };
}

async function main() {
  const vie = process.argv.includes("--vie");
  const dataset = process.argv.includes("--production") ? "production" : "development";
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = sanityWriteToken();
  if (!projectId || !token) {
    console.error("NEXT_PUBLIC_SANITY_PROJECT_ID tai kirjoitustoken puuttuu (.env.local tai npx sanity login).");
    process.exit(1);
  }
  const client = createClient({ projectId, dataset, apiVersion: "2025-08-15", token, useCdn: false, perspective: "raw" });

  const [pelaaja, luonnos] = await Promise.all([
    client.getDocument<Pelaaja>(PELAAJA_ID),
    client.getDocument(`drafts.${PELAAJA_ID}`),
  ]);
  if (!pelaaja) throw new Error(`Dokumenttia ${PELAAJA_ID} ei ole datasetissä ${dataset}.`);
  if (luonnos) {
    console.error("Jari Litmasen sivulla on julkaisematon luonnos. Julkaise tai hylkää se Studiossa ja aja uudelleen.");
    process.exit(1);
  }
  const kuvaus = pelaaja.kuvaus ?? [];
  if (kuvaus.length === 0) {
    console.log(`Dataset ${dataset}: kuvaus on jo jaettu. Ei tehtävää.`);
    return;
  }

  const { jutut, fakta, irtokuvat } = jasennaJutut(kuvaus);
  const { saavutukset, syntymapaikka, pituus, patsas } = jasennaFakta(fakta);

  // Lehtileikkeet
  const idt = new Set<string>();
  const leikkeet = jutut.map((j) => {
    let id = `lehtileike-litmanen-${j.julkaistu ?? "x"}-${slugify(j.otsikko)}`;
    for (let n = 2; idt.has(id); n++) id = `${id.replace(/-\d+$/, "")}-${n}`;
    idt.add(id);
    const puutteet = [
      !j.julkaistu && "Julkaisupäivää ei löytynyt jutun lopusta.",
      j.otsikkoJohdettu && "Jutulla ei ollut omaa otsikkoa: otsikko on jutun ensimmäinen virke.",
      j.huomio && `Lähdemerkinnässä oli myös: ${j.huomio}.`,
    ].filter(Boolean);
    return {
      _id: id,
      _type: "lehtileike",
      otsikko: j.otsikko,
      pelaaja: { _type: "reference", _ref: PELAAJA_ID },
      osio: j.osio,
      ...(j.julkaistu && { julkaistu: j.julkaistu }),
      ...(j.lahde && { lahde: j.lahde }),
      ...(j.linkki && { linkki: j.linkki }),
      teksti: j.lohkot,
      needsReview: !j.julkaistu || j.otsikkoJohdettu,
      ...(puutteet.length > 0 && { tarkistettavaa: puutteet.join(" ") }),
    };
  });

  // Patsaskuvat: kaikki paitsi pääkuva (docs/20 §4.5).
  const [paakuva, ...muutKuvat] = pelaaja.kuvat ?? [];
  const patsasKuvat = muutKuvat.map((k) => {
    const { _type: _unused, ...kentat } = k;
    void _unused;
    const paivamaara = isoPaiva(`${k.caption ?? ""} ${k.alt ?? ""}`);
    return { ...kentat, _type: "paivattyKuva", ...(paivamaara && { paivamaara }) };
  });

  // Seurahistoria: FC Lahti 2008–2010, uran viimeinen kausi HJK 2011 (Suomen mestaruus 2011).
  const seurat = (pelaaja.seurat ?? []).map((s) =>
    s.seura === "FC Lahti" && s.alkuvuosi === 2008 && s.loppuvuosi == null ? { ...s, loppuvuosi: 2010 } : s,
  );
  if (!seurat.some((s) => s.seura === "HJK" && s.alkuvuosi === 2011)) {
    seurat.push({ _key: "s-hjk-2011", seura: "HJK", alkuvuosi: 2011, loppuvuosi: 2011 });
  }

  // Raportti
  const osioMaara = (o: Osio) => leikkeet.filter((l) => l.osio === o).length;
  console.log(`Dataset ${dataset}:`);
  console.log(`  + ${leikkeet.length} lehtileikettä: lehtileikkeet ${osioMaara("lehtileikkeet")}, patsas ${osioMaara("patsas")}, terveys ${osioMaara("terveys")}`);
  console.log(`    ilman päiväystä (needsReview): ${leikkeet.filter((l) => l.needsReview).length}`);
  console.log(`  ~ saavutukset: ${saavutukset.length} (${saavutukset.filter((s) => s.ryhma === "seurajoukkueet").length} seura, ${saavutukset.filter((s) => s.ryhma === "henkilokohtaiset").length} henkilökohtaista)`);
  console.log(`  ~ syntymäpaikka ${syntymapaikka ?? "—"}, pituus ${pituus ?? "—"}, patsas ${patsas.paljastettu ?? "—"} ${patsas.sijainti ?? ""}`);
  console.log(`  ~ patsaskuvat: ${patsasKuvat.length} (päiväämättä ${patsasKuvat.filter((k) => !("paivamaara" in k)).length}); pääkuva jää kuviin`);
  console.log(`  ~ seurat: FC Lahti 2008–2010, + HJK 2011`);
  console.log(`  ~ kuvaus tyhjennetään (${kuvaus.length} lohkoa), ${PATSAS_URL} ohjautuu patsassivulle`);
  console.log(`  ! kuvaukseen jäävät irtokuvat (ennen ensimmäistä juttua, poistuvat): ${irtokuvat.length}`);
  console.log(`  ! faktakappaleet (eivät jutuiksi): ${fakta.length}`);

  mkdirSync("data", { recursive: true });
  const rivit = [
    ["osio", "julkaistu", "lähde", "otsikko", "lohkoja", "merkkejä", "huomio"].join("\t"),
    ...leikkeet.map((l) =>
      [
        l.osio,
        l.julkaistu ?? "",
        l.lahde ?? "",
        l.otsikko,
        l.teksti.length,
        l.teksti.filter(onTekstilohko).map(teksti).join(" ").length,
        l.tarkistettavaa ?? "",
      ].join("\t"),
    ),
    "",
    "# faktakappaleet",
    ...fakta.map((f) => `# ${f.replace(/\n/g, " | ")}`),
    "# irtokuvat",
    ...irtokuvat.map((k) => `# ${k.alt ?? k.asset?._ref}`),
  ];
  writeFileSync(RAPORTTI, rivit.join("\n") + "\n", "utf-8");
  console.log(`  Tarkistuslista: ${RAPORTTI}`);

  if (!vie) {
    console.log(`\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npx tsx scripts/kerta/2026-10-01-uudista-litmanen.ts ${dataset === "production" ? "--production " : ""}--vie`);
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

  const tx = client.transaction();
  for (const l of leikkeet) tx.createIfNotExists(l);
  tx.patch(PELAAJA_ID, (p) =>
    p
      .ifRevisionId(pelaaja._rev)
      .set({
        kuvat: paakuva ? [paakuva] : [],
        seurat,
        saavutukset,
        uutistunniste: "litmanen",
        patsas: { ...patsas, kuvat: patsasKuvat, uutistunniste: "patsas" },
        muutLegacyUrlit: (pelaaja.muutLegacyUrlit ?? []).filter((u) => u.toLowerCase() !== PATSAS_URL),
        ...(syntymapaikka && { syntymapaikka }),
        ...(pituus && { pituus }),
      })
      .unset(["kuvaus"]),
  );
  await tx.commit({ visibility: "sync" });

  const tarkistus = await client.fetch<{ leikkeita: number; kuvaus: number | null }>(
    `{ "leikkeita": count(*[_type == "lehtileike" && pelaaja._ref == $id]), "kuvaus": count(*[_id == $id][0].kuvaus) }`,
    { id: PELAAJA_ID },
  );
  if (tarkistus.leikkeita < leikkeet.length || tarkistus.kuvaus) {
    console.error(`Tarkistus epäonnistui: ${JSON.stringify(tarkistus)}`);
    process.exit(1);
  }
  console.log(`✓ Litmanen-osio uudistettu (${dataset}): ${tarkistus.leikkeita} lehtileikettä.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
